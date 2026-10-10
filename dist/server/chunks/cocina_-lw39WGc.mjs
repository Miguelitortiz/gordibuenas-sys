import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { C as createComponent, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_BRErzoFw.mjs";
import { t as renderScript } from "./script_MwKP0DqM.mjs";
import "./compiler_Xme8TSCj.mjs";
import { t as $$BaseLayout } from "./BaseLayout_C33NmNn9.mjs";
//#region src/pages/cocina.astro
var cocina_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Cocina,
	file: () => $$file,
	url: () => $$url
});
var $$Cocina = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Cocina · Las Gordibuenas" }, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="grid" style="gap: 1rem;"><div class="row between"><h1>Panel cocina</h1><nav><a href="/">Inicio</a><a href="/host">Host</a><a href="/mesero">Mesero</a><a class="active" href="/cocina">Cocina</a></nav></div><section class="card"><h2>Próximo pedido</h2><div id="nextOrder" class="empty">Sin pedidos pendientes.</div></section><section class="card"><h2>Cola de cocina</h2><div id="queue" class="list"></div></section></div>${renderScript($$result, "/home/runner/work/gordibuenas-sys/gordibuenas-sys/src/pages/cocina.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/home/runner/work/gordibuenas-sys/gordibuenas-sys/src/pages/cocina.astro", void 0);
var $$file = "/home/runner/work/gordibuenas-sys/gordibuenas-sys/src/pages/cocina.astro";
var $$url = "/cocina";
//#endregion
//#region \0virtual:astro:page:src/pages/cocina@_@astro
var page = () => cocina_exports;
//#endregion
export { page };
