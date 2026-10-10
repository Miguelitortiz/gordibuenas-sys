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
	const orderItems = [];
	for (const guisado of input.guisados) {
		if (guisado.quantity <= 0) continue;
		orderItems.push({
			kind: "guisado",
			name: guisado.name,
			quantity: guisado.quantity,
			total: calculateGuisadoTotal(guisado.quantity)
		});
	}
	for (const [key, quantity] of Object.entries(input.drinks)) {
		if (!quantity || quantity <= 0) continue;
		const drink = DRINKS[key];
		orderItems.push({
			kind: "bebida",
			name: drink.name,
			quantity,
			total: drink.price * quantity
		});
	}
	const total = summarizeItems(orderItems);
	const order = {
		id: crypto.randomUUID(),
		folio: db.data.counters.nextFolio,
		status: "pendiente",
		notes: input.notes?.trim() ?? "",
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
export { listOrders as a, getConfig as i, createOrder as n, setGuisados as o, dailySummary as r, updateOrder as s, DRINKS as t };
