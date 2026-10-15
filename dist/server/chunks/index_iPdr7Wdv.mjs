import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { n as closeAccountById, o as listOpenAccounts } from "./store_BMUi6e4p.mjs";
//#region src/pages/api/accounts/index.ts
var accounts_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var GET = async () => {
	const accounts = await listOpenAccounts();
	return new Response(JSON.stringify(accounts), { headers: { "Content-Type": "application/json" } });
};
var POST = async ({ request }) => {
	const accountId = (await request.json().catch(() => null))?.accountId;
	if (!accountId || typeof accountId !== "string") return new Response(JSON.stringify({ error: "ID de cuenta requerido." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const success = await closeAccountById(accountId);
	return new Response(JSON.stringify({
		success,
		message: success ? "Cuenta cerrada y cobrada." : "No se encontró la cuenta."
	}), { headers: { "Content-Type": "application/json" } });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/accounts/index@_@ts
var page = () => accounts_exports;
//#endregion
export { page };
