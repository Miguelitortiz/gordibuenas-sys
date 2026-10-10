import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { JSONFilePreset } from 'lowdb/node';

export const DRINKS = {
  aguaFrescaChica: { name: 'Agua fresca chica', price: 25 },
  aguaFrescaLitro: { name: 'Agua fresca 1 L', price: 45 },
  cafe: { name: 'Café', price: 35 },
} as const;

export type DrinkKey = keyof typeof DRINKS;

export type OrderStatus = 'pendiente' | 'en_preparacion' | 'terminado' | 'cancelado';

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
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  total: number;
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
  return db.data.config;
};

export const calculateGuisadoTotal = (quantity: number) => {
  const packs = Math.floor(quantity / 3);
  const rest = quantity % 3;
  return packs * 100 + rest * 35;
};

const summarizeItems = (items: OrderItem[]) => items.reduce((sum, item) => sum + item.total, 0);

export const createOrder = async (input: {
  notes?: string;
  guisados: Array<{ name: string; quantity: number }>;
  drinks: Partial<Record<DrinkKey, number>>;
}) => {
  await db.read();

  const createdAt = new Date().toISOString();
  const orderItems: OrderItem[] = [];

  for (const guisado of input.guisados) {
    if (guisado.quantity <= 0) continue;
    orderItems.push({
      kind: 'guisado',
      name: guisado.name,
      quantity: guisado.quantity,
      total: calculateGuisadoTotal(guisado.quantity),
    });
  }

  for (const [key, quantity] of Object.entries(input.drinks) as Array<[DrinkKey, number | undefined]>) {
    if (!quantity || quantity <= 0) continue;
    const drink = DRINKS[key];
    orderItems.push({
      kind: 'bebida',
      name: drink.name,
      quantity,
      total: drink.price * quantity,
    });
  }

  const total = summarizeItems(orderItems);
  const order: Order = {
    id: crypto.randomUUID(),
    folio: db.data.counters.nextFolio,
    status: 'pendiente',
    notes: input.notes?.trim() ?? '',
    createdAt,
    updatedAt: createdAt,
    items: orderItems,
    total,
  };

  db.data.orders.unshift(order);
  db.data.counters.nextFolio += 1;

  await db.write();
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
    notes: string;
    guisados: Array<{ name: string; quantity: number }>;
    drinks: Partial<Record<DrinkKey, number>>;
  }>,
) => {
  await db.read();
  const order = db.data.orders.find((item) => item.id === id);
  if (!order) return null;

  if (update.status) {
    order.status = update.status;
  }

  if (typeof update.notes === 'string') {
    order.notes = update.notes.trim();
  }

  if (update.guisados || update.drinks) {
    const guisados = update.guisados ?? [];
    const drinks = update.drinks ?? {};
    const rebuilt: OrderItem[] = [];

    for (const guisado of guisados) {
      if (guisado.quantity <= 0) continue;
      rebuilt.push({
        kind: 'guisado',
        name: guisado.name,
        quantity: guisado.quantity,
        total: calculateGuisadoTotal(guisado.quantity),
      });
    }

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
  return order;
};

export const dailySummary = async () => {
  await db.read();
  const day = today();
  const todayOrders = db.data.orders.filter((order) => order.createdAt.startsWith(day));
  const completed = todayOrders.filter((order) => order.status === 'terminado');
  const cancelled = todayOrders.filter((order) => order.status === 'cancelado');
  const active = todayOrders.filter((order) => !['terminado', 'cancelado'].includes(order.status));

  return {
    day,
    counts: {
      total: todayOrders.length,
      completed: completed.length,
      cancelled: cancelled.length,
      active: active.length,
    },
    revenue: {
      sold: completed.reduce((sum, item) => sum + item.total, 0),
      inProgress: active.reduce((sum, item) => sum + item.total, 0),
    },
  };
};
