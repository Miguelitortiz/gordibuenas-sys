import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { i as getConfig, o as setGuisados } from "./store_Bxc9GfBk.mjs";
import { z } from "zod";
//#region src/pages/api/config.ts
var config_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	PUT: () => PUT
});
var configSchema = z.object({ guisadosDelDia: z.array(z.string().trim().min(1)).min(1) });
var GET = async () => {
	const config = await getConfig();
	return new Response(JSON.stringify(config), { headers: { "Content-Type": "application/json" } });
};
var PUT = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	const parsed = configSchema.safeParse(payload);
	if (!parsed.success) return new Response(JSON.stringify({ error: "Guisados inválidos." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const updated = await setGuisados(Array.from(new Set(parsed.data.guisadosDelDia.map((item) => item.trim()))));
	return new Response(JSON.stringify(updated), { headers: { "Content-Type": "application/json" } });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/config@_@ts
var page = () => config_exports;
//#endregion
export { page };
