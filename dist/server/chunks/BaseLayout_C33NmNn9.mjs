import { C as createComponent, S as createAstro, f as renderHead, s as renderSlot, u as renderTemplate } from "./server_BRErzoFw.mjs";
import "./compiler_Xme8TSCj.mjs";
//#region src/layouts/BaseLayout.astro
createAstro("https://astro.build");
var $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BaseLayout;
	const { title = "Las Gordibuenas" } = Astro.props;
	return renderTemplate`<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>${title}</title>${renderHead($$result)}</head><body><main class="container">${renderSlot($$result, $$slots["default"])}</main></body></html>`;
}, "/home/runner/work/gordibuenas-sys/gordibuenas-sys/src/layouts/BaseLayout.astro", void 0);
//#endregion
export { $$BaseLayout as t };
