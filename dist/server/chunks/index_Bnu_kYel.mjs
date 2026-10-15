import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { C as createComponent, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_BRErzoFw.mjs";
import "./compiler_Xme8TSCj.mjs";
import { t as $$BaseLayout } from "./BaseLayout_C55o3nnb.mjs";
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Las Gordibuenas · Sistema de comandas" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="grid" style="gap: 1.25rem;"><h1>Las Gordibuenas</h1><p class="muted">Sistema de comandas en red local para host, mesero y cocina.</p><nav><a href="/host">Host</a><a href="/mesero">Mesero</a><a href="/cocina">Cocina</a></nav><section class="grid cols-3"><article class="card"><h2>Host</h2><p>Define guisados del día y revisa resumen de pedidos diarios.</p></article><article class="card"><h2>Mesero</h2><p>Registra, modifica o cancela pedidos en tiempo real.</p></article><article class="card"><h2>Cocina</h2><p>Visualiza la cola de trabajo y marca pedidos como terminados.</p></article></section></div>` })}`;
}, "/Users/miguelito/Documents/Projects/gordibuenas-sys/src/pages/index.astro", void 0);
var $$file = "/Users/miguelito/Documents/Projects/gordibuenas-sys/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
