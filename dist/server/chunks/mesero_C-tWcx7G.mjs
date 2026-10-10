import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { C as createComponent, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_BRErzoFw.mjs";
import { t as renderScript } from "./script_MwKP0DqM.mjs";
import "./compiler_Xme8TSCj.mjs";
import { t as $$BaseLayout } from "./BaseLayout_C33NmNn9.mjs";
//#region src/pages/mesero.astro
var mesero_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Mesero,
	file: () => $$file,
	url: () => $$url
});
var $$Mesero = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Mesero · Las Gordibuenas" }, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="grid" style="gap: 1rem;"><div class="row between"><h1>Panel mesero</h1><nav><a href="/">Inicio</a><a href="/host">Host</a><a class="active" href="/mesero">Mesero</a><a href="/cocina">Cocina</a></nav></div><section class="card"><h2>Nueva comanda</h2><div class="grid cols-3" id="guisadosGrid"></div><fieldset><legend>Bebidas</legend><div class="grid cols-3"><label>Agua fresca chica <input type="number" min="0" value="0" id="aguaFrescaChica"></label><label>Agua fresca 1 L <input type="number" min="0" value="0" id="aguaFrescaLitro"></label><label>Café <input type="number" min="0" value="0" id="cafe"></label></div></fieldset><label>Notas</label><textarea id="notes" rows="2" placeholder="Sin cebolla, extra salsa..."></textarea><div class="row"><button class="btn" id="crearPedido">Enviar a cocina</button><span class="muted" id="statusMsg"></span></div></section><section class="card"><h2>Pedidos del día</h2><div id="ordersList" class="list"></div></section></div>${renderScript($$result, "/home/runner/work/gordibuenas-sys/gordibuenas-sys/src/pages/mesero.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/home/runner/work/gordibuenas-sys/gordibuenas-sys/src/pages/mesero.astro", void 0);
var $$file = "/home/runner/work/gordibuenas-sys/gordibuenas-sys/src/pages/mesero.astro";
var $$url = "/mesero";
//#endregion
//#region \0virtual:astro:page:src/pages/mesero@_@astro
var page = () => mesero_exports;
//#endregion
export { page };
