import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { s as updateOrder } from "./store_Bxc9GfBk.mjs";
import { z } from "zod";
//#region src/pages/api/orders/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({ PATCH: () => PATCH });
var patchSchema = z.object({
	status: z.enum([
		"pendiente",
		"en_preparacion",
		"terminado",
		"cancelado"
	]).optional(),
	notes: z.string().optional(),
	guisados: z.array(z.object({
		name: z.string().trim().min(1),
		quantity: z.number().int().min(0)
	})).optional(),
	drinks: z.object({
		aguaFrescaChica: z.number().int().min(0).optional(),
		aguaFrescaLitro: z.number().int().min(0).optional(),
		cafe: z.number().int().min(0).optional()
	}).optional()
}).refine((value) => Object.keys(value).length > 0, "Sin cambios");
var PATCH = async ({ params, request }) => {
	const id = params.id;
	if (!id) return new Response(JSON.stringify({ error: "ID inválido." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const payload = await request.json().catch(() => null);
	const parsed = patchSchema.safeParse(payload);
	if (!parsed.success) return new Response(JSON.stringify({ error: "Actualización inválida." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	if (parsed.data.guisados || parsed.data.drinks) {
		if (!((parsed.data.guisados ?? []).some((item) => item.quantity > 0) || Object.values(parsed.data.drinks ?? {}).some((value) => (value ?? 0) > 0))) return new Response(JSON.stringify({ error: "El pedido no puede quedar vacío." }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
	const order = await updateOrder(id, parsed.data);
	if (!order) return new Response(JSON.stringify({ error: "Pedido no encontrado." }), {
		status: 404,
		headers: { "Content-Type": "application/json" }
	});
	return new Response(JSON.stringify(order), { headers: { "Content-Type": "application/json" } });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/orders/[id]@_@ts
var page = () => _id__exports;
//#endregion
export { page };
