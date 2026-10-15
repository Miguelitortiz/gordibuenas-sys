import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { JSONFilePreset } from 'lowdb/node';

export const DRINKS = {
  aguaFrescaChica: { name: 'Agua fresca chica', price: 20 },
  aguaFrescaLitro: { name: 'Agua fresca 1 L', price: 40 },
  cafe: { name: 'Café', price: 35 },
} as const;

export type DrinkKey = keyof typeof DRINKS;

export type OrderStatus = 'pendiente' | 'en_preparacion' | 'terminado' | 'cancelado';
export type OrderType = 'aqui' | 'llevar' | 'domicilio';

export type PlateItem = {
  kind: 'guisado' | 'bebida';
  name: string;
  quantity: number;
};

export type Plate = {
  id: string;
  name: string; // "Plato 1", "Plato 2"...
  items: PlateItem[];
  notes?: string;
};

export type OrderItem = {
  kind: 'guisado' | 'bebida';
  name: string;
  quantity: number;
  total: number;
};

export type Order = {
  id: string;
  folio: number;
  status: OrderStatus;
  orderType: OrderType;
  table?: string;
  customerName?: string;
  address?: string;
  phone?: string;
  accountId?: string;
  round?: number;
  isAdditional?: boolean;
  accountClosed?: boolean;
  notes: string;
  plates?: Plate[];
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
};

type Data = {
  config: {
    guisadosDelDia: string[];
    updatedAt: string;
  };
  counters: {
    nextFolio: number;
  };
  orders: Order[];
};

const today = () => new Date().toISOString().slice(0, 10);

const dataDir = join(process.cwd(), 'data');
const dataPath = join(dataDir, 'db.json');

await mkdir(dataDir, { recursive: true });

const db = await JSONFilePreset<Data>(dataPath, {
  config: {
    guisadosDelDia: ['Deshebrada', 'Chicharrón', 'Frijoles'],
    updatedAt: new Date().toISOString(),
  },
  counters: {
    nextFolio: 1,
  },
  orders: [],
});

export type OrderEvent = 
  | { type: 'order:created'; order: Order }
  | { type: 'order:updated'; order: Order }
  | { type: 'order:deleted'; orderId: string }
  | { type: 'account:closed'; accountId: string }
  | { type: 'config:updated'; config: { guisadosDelDia: string[]; updatedAt: string } };

type OrderSubscriber = (event: OrderEvent) => void;
const orderSubscribers = new Set<OrderSubscriber>();

export const subscribeOrderEvents = (cb: OrderSubscriber): (() => void) => {
  orderSubscribers.add(cb);
  return () => {
    orderSubscribers.delete(cb);
  };
};

const notifyOrderEvent = (event: OrderEvent) => {
  for (const cb of orderSubscribers) {
    try {
      cb(event);
    } catch (_) {}
  }
};

export const getConfig = async () => {
  await db.read();
  return db.data.config;
};

export const setGuisados = async (guisadosDelDia: string[]) => {
  await db.read();
  db.data.config = {
    guisadosDelDia,
    updatedAt: new Date().toISOString(),
  };
  await db.write();
  notifyOrderEvent({ type: 'config:updated', config: db.data.config });
  return db.data.config;
};

export const calculateGuisadoTotal = (quantity: number) => {
  const packs = Math.floor(quantity / 3);
  const rest = quantity % 3;
  return packs * 100 + rest * 35;
};

const summarizeItems = (items: OrderItem[]) => items.reduce((sum, item) => sum + item.total, 0);

export const createOrder = async (input: {
  orderType?: OrderType;
  table?: string;
  customerName?: string;
  address?: string;
  phone?: string;
  accountId?: string;
  notes?: string;
  plates?: Plate[];
  guisados?: Array<{ name: string; quantity: number }>;
  drinks?: Partial<Record<DrinkKey, number>>;
}) => {
  await db.read();

  const createdAt = new Date().toISOString();
  const orderType: OrderType = input.orderType || 'aqui';
  const customerName = input.customerName?.trim() || (orderType === 'aqui' ? 'Comensal en sala' : 'Cliente');

  // Manejo de cuentas no cerradas y rondas/tandas
  let accountId = input.accountId;
  let round = 1;
  let isAdditional = false;

  // Si se especificó una cuenta existente o si ya hay una cuenta abierta con este nombre
  const existingOpenAccount = accountId
    ? db.data.orders.find((o) => (o.accountId === accountId || o.id === accountId) && o.accountClosed !== true && o.status !== 'cancelado')
    : db.data.orders.find((o) => o.customerName === customerName && o.accountClosed !== true && o.status !== 'cancelado');

  if (existingOpenAccount) {
    accountId = existingOpenAccount.accountId || existingOpenAccount.id;
    const roundCount = db.data.orders.filter(
      (o) => (o.accountId === accountId || o.id === accountId) && o.status !== 'cancelado',
    ).length;
    round = roundCount + 1;
    isAdditional = true;
  } else {
    accountId = crypto.randomUUID();
  }

  const orderItems: OrderItem[] = [];

  // Si se enviaron platos (flujo nuevo por plato)
  if (input.plates && input.plates.length > 0) {
    const guisadoTotals: Record<string, number> = {};
    const drinkTotals: Record<string, number> = {};

    for (const plate of input.plates) {
      for (const it of plate.items) {
        if (it.quantity <= 0) continue;
        if (it.kind === 'guisado') {
          guisadoTotals[it.name] = (guisadoTotals[it.name] || 0) + it.quantity;
        } else {
          drinkTotals[it.name] = (drinkTotals[it.name] || 0) + it.quantity;
        }
      }
    }

    let totalGorditasCount = 0;
    for (const qty of Object.values(guisadoTotals)) {
      totalGorditasCount += qty;
    }

    const totalGorditasAmount = calculateGuisadoTotal(totalGorditasCount);
    let distributedGorditasAmount = 0;
    const guisadoEntries = Object.entries(guisadoTotals);

    guisadoEntries.forEach(([name, qty], idx) => {
      let itemTotal = 0;
      if (idx === guisadoEntries.length - 1) {
        // El último absorbe cualquier residuo de redondeo para cuadrar exacto
        itemTotal = totalGorditasAmount - distributedGorditasAmount;
      } else {
        itemTotal = Math.round((qty / totalGorditasCount) * totalGorditasAmount);
        distributedGorditasAmount += itemTotal;
      }

      orderItems.push({
        kind: 'guisado',
        name,
        quantity: qty,
        total: itemTotal,
      });
    });

    for (const [name, qty] of Object.entries(drinkTotals)) {
      const drinkEntry = Object.values(DRINKS).find((d) => d.name === name);
      const price = drinkEntry ? drinkEntry.price : 20;
      orderItems.push({
        kind: 'bebida',
        name,
        quantity: qty,
        total: price * qty,
      });
    }
  } else {
    // Retrocompatibilidad con guisados y drinks directos
    const totalGorditasCount = (input.guisados ?? []).reduce((sum, g) => sum + (g.quantity > 0 ? g.quantity : 0), 0);
    const totalGorditasAmount = calculateGuisadoTotal(totalGorditasCount);
    let distributedGorditasAmount = 0;
    const validGuisados = (input.guisados ?? []).filter((g) => g.quantity > 0);

    validGuisados.forEach((guisado, idx) => {
      let itemTotal = 0;
      if (idx === validGuisados.length - 1) {
        itemTotal = totalGorditasAmount - distributedGorditasAmount;
      } else {
        itemTotal = Math.round((guisado.quantity / totalGorditasCount) * totalGorditasAmount);
        distributedGorditasAmount += itemTotal;
      }
      orderItems.push({
        kind: 'guisado',
        name: guisado.name,
        quantity: guisado.quantity,
        total: itemTotal,
      });
    });

    for (const [key, quantity] of Object.entries(input.drinks ?? {}) as Array<[DrinkKey, number | undefined]>) {
      if (!quantity || quantity <= 0) continue;
      const drink = DRINKS[key];
      orderItems.push({
        kind: 'bebida',
        name: drink.name,
        quantity,
        total: drink.price * quantity,
      });
    }
  }

  const total = summarizeItems(orderItems);
  const order: Order = {
    id: crypto.randomUUID(),
    folio: db.data.counters.nextFolio,
    status: 'pendiente',
    orderType,
    table: input.table?.trim(),
    customerName: customerName,
    address: input.address?.trim(),
    phone: input.phone?.trim(),
    accountId,
    round,
    isAdditional,
    accountClosed: false,
    notes: input.notes?.trim() ?? '',
    plates: input.plates,
    createdAt,
    updatedAt: createdAt,
    items: orderItems,
    total,
  };

  db.data.orders.unshift(order);
  db.data.counters.nextFolio += 1;

  await db.write();
  notifyOrderEvent({ type: 'order:created', order });
  return order;
};

export const listOrders = async () => {
  await db.read();
  return db.data.orders;
};

export const getOrderById = async (id: string) => {
  await db.read();
  return db.data.orders.find((order) => order.id === id);
};

export const updateOrder = async (
  id: string,
  update: Partial<{
    status: OrderStatus;
    table: string;
    customerName: string;
    accountClosed: boolean;
    notes: string;
    plates: Plate[];
    guisados: Array<{ name: string; quantity: number }>;
    drinks: Partial<Record<DrinkKey, number>>;
  }>,
) => {
  await db.read();
  const order = db.data.orders.find((item) => item.id === id);
  if (!order) return null;

  // REGLA CRITICA: Solo se puede modificar el contenido antes de que cocina termine esa tarjeta
  if (order.status === 'terminado' && (update.plates || update.guisados || update.drinks)) {
    throw new Error('NO_MODIFICABLE_TERMINADO');
  }

  if (update.status) {
    order.status = update.status;
  }

  if (typeof update.customerName === 'string') {
    order.customerName = update.customerName.trim();
  }

  if (typeof update.accountClosed === 'boolean') {
    order.accountClosed = update.accountClosed;
    // Si se cierra la cuenta, cerrar todas las órdenes del mismo accountId
    if (order.accountId) {
      for (const o of db.data.orders) {
        if (o.accountId === order.accountId) {
          o.accountClosed = update.accountClosed;
        }
      }
    }
  }

  if (typeof update.table === 'string') {
    order.table = update.table.trim();
  }

  if (typeof update.notes === 'string') {
    order.notes = update.notes.trim();
  }

  if (update.plates && update.plates.length > 0) {
    order.plates = update.plates;
    const guisadoTotals: Record<string, number> = {};
    const drinkTotals: Record<string, number> = {};

    for (const plate of update.plates) {
      for (const it of plate.items) {
        if (it.quantity <= 0) continue;
        if (it.kind === 'guisado') {
          guisadoTotals[it.name] = (guisadoTotals[it.name] || 0) + it.quantity;
        } else {
          drinkTotals[it.name] = (drinkTotals[it.name] || 0) + it.quantity;
        }
      }
    }

    let totalGorditasCount = 0;
    for (const qty of Object.values(guisadoTotals)) {
      totalGorditasCount += qty;
    }

    const totalGorditasAmount = calculateGuisadoTotal(totalGorditasCount);
    let distributedGorditasAmount = 0;
    const guisadoEntries = Object.entries(guisadoTotals);

    const rebuilt: OrderItem[] = [];
    guisadoEntries.forEach(([name, qty], idx) => {
      let itemTotal = 0;
      if (idx === guisadoEntries.length - 1) {
        itemTotal = totalGorditasAmount - distributedGorditasAmount;
      } else {
        itemTotal = Math.round((qty / totalGorditasCount) * totalGorditasAmount);
        distributedGorditasAmount += itemTotal;
      }

      rebuilt.push({
        kind: 'guisado',
        name,
        quantity: qty,
        total: itemTotal,
      });
    });

    for (const [name, qty] of Object.entries(drinkTotals)) {
      const drinkEntry = Object.values(DRINKS).find((d) => d.name === name);
      const price = drinkEntry ? drinkEntry.price : 20;
      rebuilt.push({
        kind: 'bebida',
        name,
        quantity: qty,
        total: price * qty,
      });
    }

    order.items = rebuilt;
    order.total = summarizeItems(rebuilt);
  } else if (update.guisados || update.drinks) {
    const guisados = update.guisados ?? [];
    const drinks = update.drinks ?? {};
    const rebuilt: OrderItem[] = [];

    const totalGorditasCount = guisados.reduce((sum, g) => sum + (g.quantity > 0 ? g.quantity : 0), 0);
    const totalGorditasAmount = calculateGuisadoTotal(totalGorditasCount);
    let distributedGorditasAmount = 0;
    const validGuisados = guisados.filter((g) => g.quantity > 0);

    validGuisados.forEach((guisado, idx) => {
      let itemTotal = 0;
      if (idx === validGuisados.length - 1) {
        itemTotal = totalGorditasAmount - distributedGorditasAmount;
      } else {
        itemTotal = Math.round((guisado.quantity / totalGorditasCount) * totalGorditasAmount);
        distributedGorditasAmount += itemTotal;
      }
      rebuilt.push({
        kind: 'guisado',
        name: guisado.name,
        quantity: guisado.quantity,
        total: itemTotal,
      });
    });

    for (const [key, quantity] of Object.entries(drinks) as Array<[DrinkKey, number | undefined]>) {
      if (!quantity || quantity <= 0) continue;
      const drink = DRINKS[key];
      rebuilt.push({
        kind: 'bebida',
        name: drink.name,
        quantity,
        total: drink.price * quantity,
      });
    }

    order.items = rebuilt;
    order.total = summarizeItems(rebuilt);
  }

  order.updatedAt = new Date().toISOString();
  await db.write();
  notifyOrderEvent({ type: 'order:updated', order });
  return order;
};

export const closeAccountById = async (accountId: string) => {
  await db.read();
  let count = 0;
  const accountOrders = db.data.orders.filter(
    (o) => (o.accountId === accountId || o.id === accountId) && o.status !== 'cancelado',
  );

  if (accountOrders.length > 0) {
    // Reconciliar el total de la cuenta aplicando la promo 3 por $100 a nivel de cuenta completa
    let totalGorditasInAccount = 0;
    let drinksTotalInAccount = 0;

    for (const order of accountOrders) {
      for (const item of order.items) {
        if (item.kind === 'guisado') {
          totalGorditasInAccount += item.quantity;
        } else if (item.kind === 'bebida') {
          const drinkEntry = Object.values(DRINKS).find((d) => d.name.toUpperCase() === item.name.toUpperCase());
          const unitPrice = drinkEntry ? drinkEntry.price : (item.total / item.quantity || 20);
          drinksTotalInAccount += unitPrice * item.quantity;
        }
      }
    }

    const packs = Math.floor(totalGorditasInAccount / 3);
    const rest = totalGorditasInAccount % 3;
    const accountTotal = packs * 100 + rest * 35 + drinksTotalInAccount;

    // Distribuir el total proporcionalmente entre las órdenes de la cuenta
    if (accountOrders.length === 1) {
      accountOrders[0].total = accountTotal;
    } else {
      let accumulated = 0;
      const originalSum = accountOrders.reduce((sum, o) => sum + o.total, 0) || 1;
      accountOrders.forEach((o, idx) => {
        if (idx === accountOrders.length - 1) {
          o.total = accountTotal - accumulated;
        } else {
          o.total = Math.round((o.total / originalSum) * accountTotal);
          accumulated += o.total;
        }
      });
    }

    for (const o of accountOrders) {
      o.accountClosed = true;
      count += 1;
    }

    await db.write();
    notifyOrderEvent({ type: 'account:closed', accountId });
  }
  return count > 0;
};

export const listOpenAccounts = async () => {
  await db.read();
  const openOrders = db.data.orders.filter(
    (o) => o.accountClosed !== true && o.status !== 'cancelado',
  );

  const accountsMap = new Map<string, {
    accountId: string;
    orderType: OrderType;
    table?: string;
    customerName?: string;
    address?: string;
    ordersCount: number;
    totalAmount: number;
    orders: Order[];
  }>();

  for (const order of openOrders) {
    const accId = order.accountId || order.id;
    if (!accountsMap.has(accId)) {
      accountsMap.set(accId, {
        accountId: accId,
        orderType: order.orderType,
        table: order.table,
        customerName: order.customerName,
        address: order.address,
        ordersCount: 0,
        totalAmount: 0,
        orders: [],
      });
    }
    const acc = accountsMap.get(accId)!;
    acc.ordersCount += 1;
    acc.orders.push(order);
  }

  // Calcular el total de cada cuenta aplicando la promoción de 3 por $100
  // a la sumatoria de todas las gorditas de la cuenta
  for (const acc of accountsMap.values()) {
    let totalGorditasInAccount = 0;
    let drinksTotalInAccount = 0;

    for (const order of acc.orders) {
      for (const item of order.items) {
        if (item.kind === 'guisado') {
          totalGorditasInAccount += item.quantity;
        } else if (item.kind === 'bebida') {
          // Precios actualizados de bebidas: Chica 20, Litro 40, Café 35
          const drinkEntry = Object.values(DRINKS).find((d) => d.name.toUpperCase() === item.name.toUpperCase());
          const unitPrice = drinkEntry ? drinkEntry.price : (item.total / item.quantity || 20);
          drinksTotalInAccount += unitPrice * item.quantity;
        }
      }
    }

    const packs = Math.floor(totalGorditasInAccount / 3);
    const rest = totalGorditasInAccount % 3;
    const gorditasTotal = packs * 100 + rest * 35;

    acc.totalAmount = gorditasTotal + drinksTotalInAccount;
  }

  return Array.from(accountsMap.values());
};

export const deleteOrderById = async (id: string): Promise<boolean> => {
  await db.read();
  const index = db.data.orders.findIndex((o) => o.id === id);
  if (index === -1) return false;
  db.data.orders.splice(index, 1);
  await db.write();
  notifyOrderEvent({ type: 'order:deleted', orderId: id });
  return true;
};

export const dailySummary = async () => {
  await db.read();
  const day = today();
  const todayOrders = db.data.orders.filter((order) => order.createdAt.startsWith(day));
  const completed = todayOrders.filter((order) => order.status === 'terminado');
  const cancelled = todayOrders.filter((order) => order.status === 'cancelado');
  const active = todayOrders.filter((order) => !['terminado', 'cancelado'].includes(order.status));

  // Desglose de productos vendidos en el día (completados o no cancelados)
  const productQuantities: Record<string, { count: number; total: number; kind: string }> = {};
  let totalGorditasCount = 0;
  let totalBebidasCount = 0;

  // Calculamos desglose sobre órdenes válidas no canceladas
  const validOrders = todayOrders.filter((o) => o.status !== 'cancelado');
  for (const order of validOrders) {
    for (const item of order.items) {
      if (!productQuantities[item.name]) {
        productQuantities[item.name] = { count: 0, total: 0, kind: item.kind };
      }
      productQuantities[item.name].count += item.quantity;
      productQuantities[item.name].total += item.total;
      if (item.kind === 'guisado') totalGorditasCount += item.quantity;
      if (item.kind === 'bebida') totalBebidasCount += item.quantity;
    }
  }

  // Órdenes cerradas vs abiertas
  const closedOrders = validOrders.filter((o) => o.accountClosed === true);
  const openAccounts = await listOpenAccounts();
  const todayOpenAccounts = openAccounts.filter((acc) =>
    acc.orders.some((o) => o.createdAt.startsWith(day)),
  );
  const pendingCollection = todayOpenAccounts.reduce((sum, acc) => sum + acc.totalAmount, 0);
  const collected = closedOrders.reduce((sum, item) => sum + item.total, 0);

  return {
    day,
    counts: {
      total: todayOrders.length,
      completed: completed.length,
      cancelled: cancelled.length,
      active: active.length,
      closed: closedOrders.length,
      open: todayOpenAccounts.length,
      totalGorditas: totalGorditasCount,
      totalBebidas: totalBebidasCount,
    },
    revenue: {
      totalVenta: collected + pendingCollection,
      sold: completed.reduce((sum, item) => sum + item.total, 0),
      inProgress: active.reduce((sum, item) => sum + item.total, 0),
      collected,
      pendingCollection,
    },
    productsBreakdown: Object.entries(productQuantities).map(([name, data]) => ({
      name,
      ...data,
    })).sort((a, b) => b.count - a.count),
    ordersList: todayOrders.map((o) => ({
      id: o.id,
      folio: o.folio,
      customerName: o.customerName || 'CLIENTE',
      orderType: o.orderType,
      status: o.status,
      accountClosed: o.accountClosed ?? false,
      total: o.total,
      itemsCount: o.items.reduce((s, it) => s + it.quantity, 0),
      createdAt: o.createdAt,
    })),
  };
};
