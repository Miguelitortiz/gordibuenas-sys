import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { r as createOrder, s as listOrders, t as DRINKS } from "./store_BMUi6e4p.mjs";
import { z } from "zod";
//#region src/pages/api/orders/index.ts
var orders_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var plateItemSchema = z.object({
	kind: z.enum(["guisado", "bebida"]),
	name: z.string().trim().min(1),
	quantity: z.number().int().min(1)
});
var plateSchema = z.object({
	id: z.string(),
	name: z.string().trim().min(1),
	items: z.array(plateItemSchema),
	notes: z.string().optional()
});
var orderSchema = z.object({
	orderType: z.enum([
		"aqui",
		"llevar",
		"domicilio"
	]).default("aqui"),
	table: z.string().optional(),
	customerName: z.string().optional(),
	address: z.string().optional(),
	phone: z.string().optional(),
	accountId: z.string().optional(),
	notes: z.string().optional(),
	plates: z.array(plateSchema).optional(),
	guisados: z.array(z.object({
		name: z.string().trim().min(1),
		quantity: z.number().int().min(0)
	})).optional(),
	drinks: z.object({
		aguaFrescaChica: z.number().int().min(0).optional(),
		aguaFrescaLitro: z.number().int().min(0).optional(),
		cafe: z.number().int().min(0).optional()
	}).optional()
});
var GET = async () => {
	const orders = await listOrders();
	return new Response(JSON.stringify(orders), { headers: { "Content-Type": "application/json" } });
};
var POST = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	const parsed = orderSchema.safeParse(payload);
	if (!parsed.success) return new Response(JSON.stringify({
		error: "Pedido inválido.",
		details: parsed.error.issues
	}), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const { orderType, address, plates, guisados, drinks } = parsed.data;
	if (orderType === "domicilio" && (!address || address.trim().length < 5)) return new Response(JSON.stringify({ error: "La dirección es obligatoria y debe ser detallada para pedidos a domicilio." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	let hasItems = false;
	if (plates && plates.length > 0) hasItems = plates.some((p) => p.items && p.items.length > 0 && p.items.some((i) => i.quantity > 0));
	else hasItems = (guisados ?? []).some((item) => item.quantity > 0) || Object.values(drinks ?? {}).some((value) => (value ?? 0) > 0);
	if (!hasItems) return new Response(JSON.stringify({ error: "El pedido debe tener al menos un producto en algún plato." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const order = await createOrder({
		orderType: parsed.data.orderType,
		table: parsed.data.table,
		customerName: parsed.data.customerName,
		address: parsed.data.address,
		phone: parsed.data.phone,
		accountId: parsed.data.accountId,
		notes: parsed.data.notes,
		plates: parsed.data.plates,
		guisados: parsed.data.guisados,
		drinks: parsed.data.drinks ?? {}
	});
	return new Response(JSON.stringify({
		order,
		drinksCatalog: DRINKS
	}), {
		status: 201,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/orders/index@_@ts
var page = () => orders_exports;
//#endregion
export { page };
