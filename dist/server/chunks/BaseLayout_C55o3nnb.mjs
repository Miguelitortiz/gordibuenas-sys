import { C as createComponent, S as createAstro, f as renderHead, p as addAttribute, s as renderSlot, u as renderTemplate } from "./server_BRErzoFw.mjs";
import "./compiler_Xme8TSCj.mjs";
//#region src/layouts/BaseLayout.astro
createAstro("https://astro.build");
var $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BaseLayout;
	const { title = "Las Gordibuenas", fullWidth = false } = Astro.props;
	return renderTemplate`<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"><title>${title}</title>${renderHead($$result)}</head><body${addAttribute(fullWidth ? "body-fullwidth" : "", "class")}>${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "/Users/miguelito/Documents/Projects/gordibuenas-sys/src/layouts/BaseLayout.astro", void 0);
//#endregion
export { $$BaseLayout as t };
