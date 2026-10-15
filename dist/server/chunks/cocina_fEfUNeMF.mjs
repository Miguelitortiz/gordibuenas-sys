import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { C as createComponent, d as maybeRenderHead, i as renderComponent, u as renderTemplate } from "./server_BRErzoFw.mjs";
import { t as renderScript } from "./script_MwKP0DqM.mjs";
import "./compiler_Xme8TSCj.mjs";
import { t as $$BaseLayout } from "./BaseLayout_C55o3nnb.mjs";
//#region src/pages/cocina.astro
var cocina_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Cocina,
	file: () => $$file,
	url: () => $$url
});
var $$Cocina = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": "Cocina KDS · Las Gordibuenas",
		"fullWidth": true
	}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<div class="kds-container"><!-- Header KDS Estilo Suizo para Tablet (Sin emojis) --><header class="kds-header"><div class="row" style="gap: 1.25rem;"><div><div class="swiss-label" style="color: #a1a1aa;">SISTEMA KDS · TERMINAL COCINA</div><h1 style="font-size: 1.6rem; color: #ffffff; margin-top: 2px;">LAS GORDIBUENAS</h1></div><div id="liveClock" style="font-size: 1.5rem; font-weight: 900; color: #f43f5e; font-variant-numeric: tabular-nums; border-left: 2px solid #3f3f46; padding-left: 1.25rem;">--:--</div></div><div class="row" style="gap: 0.5rem; flex-wrap: wrap;"><!-- Walkie Talkie --><button id="wtButton" class="walkie-btn" style="background: #18181b; color: #fff; border-color: #3f3f46;" title="Hablar con Meseros"><span id="wtLabel">WALKIE A MESEROS</span><span id="wtTimer" style="display:none; font-variant-numeric: tabular-nums; margin-left: 4px;">0:00</span></button><!-- Toggle Sonido --><button id="soundToggleBtn" class="btn secondary" style="min-height: 38px; padding: 0.35rem 0.75rem; font-size: 0.75rem; background: #27272a; color: #fff; border-color: #3f3f46;">SONIDO ON</button><!-- Pantalla Completa --><button id="fullscreenBtn" class="btn secondary" style="min-height: 38px; padding: 0.35rem 0.75rem; font-size: 0.75rem; background: #27272a; color: #fff; border-color: #3f3f46;">PANTALLA COMPLETA</button><nav><a href="/mesero" style="color: #cbd5e1; border-color: #52525b; background: transparent; font-size: 0.75rem; min-height: 38px;">MESERO</a><a href="/host" style="color: #cbd5e1; border-color: #52525b; background: transparent; font-size: 0.75rem; min-height: 38px;">HOST</a></nav></div></header><!-- Banner flotante de audio entrante del Mesero --><div id="incomingAudioBanner" class="audio-notification-banner" style="display: none; background: #18181b; border: 1px solid #3f3f46;"><span id="incomingAudioText">MENSAJE DE VOZ DE MESERO</span><div class="row" style="gap: 0.4rem;"><button id="replayAudioBtn" class="btn secondary" style="min-height: 26px; padding: 0.15rem 0.45rem; font-size: 0.7rem;">REPETIR</button><button id="dismissAudioBtn" style="background:transparent; border:none; color:#fff; cursor:pointer; font-weight:900;">X</button></div></div><!-- MONITOR DE PLANCHA / COMAL (TOTALIZADOR ACUMULADO) --><section class="kds-summary-bar"><div class="kds-summary-title">TOTAL EN COMAL (SUMA ACTIVA):</div><div class="kds-summary-chips" id="comalSummaryContainer"><span class="muted" style="color: #71717a;">Sin ordenes activas en plancha.</span></div></section><!-- COLA DE TICKETS KDS CON DESGLOSE POR PLATO --><main style="flex: 1; min-height: 0; display: flex; flex-direction: column;"><div class="row between" style="margin-bottom: 0.5rem; flex-shrink: 0;"><h2 style="color: #a1a1aa; font-size: 0.85rem;">COMANDAS EN COLA (<span id="queueCount">0</span>)</h2><span class="muted" style="color: #71717a; font-size: 0.75rem;">ACTUALIZACION CADA 2.5 SEG</span></div><div class="kds-grid" id="kdsQueue"><div class="empty" style="grid-column: 1 / -1; color: #a1a1aa; border-color: #27272a; padding: 3rem 1rem;">NO HAY COMANDAS PENDIENTES EN COCINA.</div></div></main></div>${renderScript($$result, "/Users/miguelito/Documents/Projects/gordibuenas-sys/src/pages/cocina.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Users/miguelito/Documents/Projects/gordibuenas-sys/src/pages/cocina.astro", void 0);
var $$file = "/Users/miguelito/Documents/Projects/gordibuenas-sys/src/pages/cocina.astro";
var $$url = "/cocina";
//#endregion
//#region \0virtual:astro:page:src/pages/cocina@_@astro
var page = () => cocina_exports;
//#endregion
export { page };
