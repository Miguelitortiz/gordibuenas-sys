import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { i as dailySummary } from "./store_BMUi6e4p.mjs";
//#region src/pages/api/summary.ts
var summary_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async () => {
	const summary = await dailySummary();
	return new Response(JSON.stringify(summary), { headers: { "Content-Type": "application/json" } });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/summary@_@ts
var page = () => summary_exports;
//#endregion
export { page };
