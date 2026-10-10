import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { C as createComponent, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_BRErzoFw.mjs";
import { t as renderScript } from "./script_MwKP0DqM.mjs";
import "./compiler_Xme8TSCj.mjs";
import { t as $$BaseLayout } from "./BaseLayout_C33NmNn9.mjs";
//#region src/pages/host.astro
var host_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Host,
	file: () => $$file,
	url: () => $$url
});
var $$Host = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Host · Las Gordibuenas" }, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="grid" style="gap: 1rem;"><div class="row between"><h1>Panel host</h1><nav><a href="/">Inicio</a><a class="active" href="/host">Host</a><a href="/mesero">Mesero</a><a href="/cocina">Cocina</a></nav></div><section class="card"><h2>Guisados del día</h2><p class="muted">Separados por coma. Ejemplo: Chicharrón, Deshebrada, Frijoles.</p><textarea id="guisados" rows="3"></textarea><div class="row"><button id="guardar" class="btn">Guardar</button><span id="mensaje" class="muted"></span></div></section><section class="grid cols-3" id="resumen"></section></div>${renderScript($$result, "/home/runner/work/gordibuenas-sys/gordibuenas-sys/src/pages/host.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/home/runner/work/gordibuenas-sys/gordibuenas-sys/src/pages/host.astro", void 0);
var $$file = "/home/runner/work/gordibuenas-sys/gordibuenas-sys/src/pages/host.astro";
var $$url = "/host";
//#endregion
//#region \0virtual:astro:page:src/pages/host@_@astro
var page = () => host_exports;
//#endregion
export { page };
