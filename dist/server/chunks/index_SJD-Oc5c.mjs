import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { a as listOrders, n as createOrder, t as DRINKS } from "./store_Bxc9GfBk.mjs";
import { z } from "zod";
//#region src/pages/api/orders/index.ts
var orders_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var orderSchema = z.object({
	notes: z.string().optional(),
	guisados: z.array(z.object({
		name: z.string().trim().min(1),
		quantity: z.number().int().min(0)
	})),
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
	if (!parsed.success) return new Response(JSON.stringify({ error: "Pedido inválido." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	if (!(parsed.data.guisados.some((item) => item.quantity > 0) || Object.values(parsed.data.drinks ?? {}).some((value) => (value ?? 0) > 0))) return new Response(JSON.stringify({ error: "Selecciona al menos un producto." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const order = await createOrder({
		notes: parsed.data.notes,
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
