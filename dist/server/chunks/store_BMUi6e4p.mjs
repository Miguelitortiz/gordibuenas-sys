import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { JSONFilePreset } from "lowdb/node";
//#region src/lib/store.ts
var DRINKS = {
	aguaFrescaChica: {
		name: "Agua fresca chica",
		price: 25
	},
	aguaFrescaLitro: {
		name: "Agua fresca 1 L",
		price: 45
	},
	cafe: {
		name: "Café",
		price: 35
	}
};
var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var dataDir = join(process.cwd(), "data");
var dataPath = join(dataDir, "db.json");
await mkdir(dataDir, { recursive: true });
var db = await JSONFilePreset(dataPath, {
	config: {
		guisadosDelDia: [
			"Deshebrada",
			"Chicharrón",
			"Frijoles"
		],
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	},
	counters: { nextFolio: 1 },
	orders: []
});
var getConfig = async () => {
	await db.read();
	return db.data.config;
};
var setGuisados = async (guisadosDelDia) => {
	await db.read();
	db.data.config = {
		guisadosDelDia,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	await db.write();
	return db.data.config;
};
var calculateGuisadoTotal = (quantity) => {
	const packs = Math.floor(quantity / 3);
	const rest = quantity % 3;
	return packs * 100 + rest * 35;
};
var summarizeItems = (items) => items.reduce((sum, item) => sum + item.total, 0);
var createOrder = async (input) => {
	await db.read();
	const createdAt = (/* @__PURE__ */ new Date()).toISOString();
	const orderType = input.orderType || "aqui";
	const customerName = input.customerName?.trim() || (orderType === "aqui" ? "Comensal en sala" : "Cliente");
	let accountId = input.accountId;
	let round = 1;
	let isAdditional = false;
	const existingOpenAccount = accountId ? db.data.orders.find((o) => (o.accountId === accountId || o.id === accountId) && o.accountClosed !== true && o.status !== "cancelado") : db.data.orders.find((o) => o.customerName === customerName && o.accountClosed !== true && o.status !== "cancelado");
	if (existingOpenAccount) {
		accountId = existingOpenAccount.accountId || existingOpenAccount.id;
		round = db.data.orders.filter((o) => (o.accountId === accountId || o.id === accountId) && o.status !== "cancelado").length + 1;
		isAdditional = true;
	} else accountId = crypto.randomUUID();
	const orderItems = [];
	if (input.plates && input.plates.length > 0) {
		const guisadoTotals = {};
		const drinkTotals = {};
		for (const plate of input.plates) for (const it of plate.items) {
			if (it.quantity <= 0) continue;
			if (it.kind === "guisado") guisadoTotals[it.name] = (guisadoTotals[it.name] || 0) + it.quantity;
			else drinkTotals[it.name] = (drinkTotals[it.name] || 0) + it.quantity;
		}
		for (const [name, qty] of Object.entries(guisadoTotals)) orderItems.push({
			kind: "guisado",
			name,
			quantity: qty,
			total: calculateGuisadoTotal(qty)
		});
		for (const [name, qty] of Object.entries(drinkTotals)) {
			const drinkEntry = Object.values(DRINKS).find((d) => d.name === name);
			const price = drinkEntry ? drinkEntry.price : 25;
			orderItems.push({
				kind: "bebida",
				name,
				quantity: qty,
				total: price * qty
			});
		}
	} else {
		for (const guisado of input.guisados ?? []) {
			if (guisado.quantity <= 0) continue;
			orderItems.push({
				kind: "guisado",
				name: guisado.name,
				quantity: guisado.quantity,
				total: calculateGuisadoTotal(guisado.quantity)
			});
		}
		for (const [key, quantity] of Object.entries(input.drinks ?? {})) {
			if (!quantity || quantity <= 0) continue;
			const drink = DRINKS[key];
			orderItems.push({
				kind: "bebida",
				name: drink.name,
				quantity,
				total: drink.price * quantity
			});
		}
	}
	const total = summarizeItems(orderItems);
	const order = {
		id: crypto.randomUUID(),
		folio: db.data.counters.nextFolio,
		status: "pendiente",
		orderType,
		table: input.table?.trim(),
		customerName,
		address: input.address?.trim(),
		phone: input.phone?.trim(),
		accountId,
		round,
		isAdditional,
		accountClosed: false,
		notes: input.notes?.trim() ?? "",
		plates: input.plates,
		createdAt,
		updatedAt: createdAt,
		items: orderItems,
		total
	};
	db.data.orders.unshift(order);
	db.data.counters.nextFolio += 1;
	await db.write();
	return order;
};
var listOrders = async () => {
	await db.read();
	return db.data.orders;
};
var updateOrder = async (id, update) => {
	await db.read();
	const order = db.data.orders.find((item) => item.id === id);
	if (!order) return null;
	if (update.status) order.status = update.status;
	if (typeof update.accountClosed === "boolean") {
		order.accountClosed = update.accountClosed;
		if (order.accountId) {
			for (const o of db.data.orders) if (o.accountId === order.accountId) o.accountClosed = update.accountClosed;
		}
	}
	if (typeof update.table === "string") order.table = update.table.trim();
	if (typeof update.notes === "string") order.notes = update.notes.trim();
	if (update.guisados || update.drinks) {
		const guisados = update.guisados ?? [];
		const drinks = update.drinks ?? {};
		const rebuilt = [];
		for (const guisado of guisados) {
			if (guisado.quantity <= 0) continue;
			rebuilt.push({
				kind: "guisado",
				name: guisado.name,
				quantity: guisado.quantity,
				total: calculateGuisadoTotal(guisado.quantity)
			});
		}
		for (const [key, quantity] of Object.entries(drinks)) {
			if (!quantity || quantity <= 0) continue;
			const drink = DRINKS[key];
			rebuilt.push({
				kind: "bebida",
				name: drink.name,
				quantity,
				total: drink.price * quantity
			});
		}
		order.items = rebuilt;
		order.total = summarizeItems(rebuilt);
	}
	order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	await db.write();
	return order;
};
var closeAccountById = async (accountId) => {
	await db.read();
	let count = 0;
	for (const o of db.data.orders) if (o.accountId === accountId || o.id === accountId) {
		o.accountClosed = true;
		count += 1;
	}
	if (count > 0) await db.write();
	return count > 0;
};
var listOpenAccounts = async () => {
	await db.read();
	const openOrders = db.data.orders.filter((o) => o.accountClosed !== true && o.status !== "cancelado");
	const accountsMap = /* @__PURE__ */ new Map();
	for (const order of openOrders) {
		const accId = order.accountId || order.id;
		if (!accountsMap.has(accId)) accountsMap.set(accId, {
			accountId: accId,
			orderType: order.orderType,
			table: order.table,
			customerName: order.customerName,
			address: order.address,
			ordersCount: 0,
			totalAmount: 0,
			orders: []
		});
		const acc = accountsMap.get(accId);
		acc.ordersCount += 1;
		acc.totalAmount += order.total;
		acc.orders.push(order);
	}
	return Array.from(accountsMap.values());
};
var dailySummary = async () => {
	await db.read();
	const day = today();
	const todayOrders = db.data.orders.filter((order) => order.createdAt.startsWith(day));
	const completed = todayOrders.filter((order) => order.status === "terminado");
	const cancelled = todayOrders.filter((order) => order.status === "cancelado");
	const active = todayOrders.filter((order) => !["terminado", "cancelado"].includes(order.status));
	return {
		day,
		counts: {
			total: todayOrders.length,
			completed: completed.length,
			cancelled: cancelled.length,
			active: active.length
		},
		revenue: {
			sold: completed.reduce((sum, item) => sum + item.total, 0),
			inProgress: active.reduce((sum, item) => sum + item.total, 0)
		}
	};
};
//#endregion
export { getConfig as a, setGuisados as c, dailySummary as i, updateOrder as l, closeAccountById as n, listOpenAccounts as o, createOrder as r, listOrders as s, DRINKS as t };
