import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { z } from "zod";
//#region src/lib/audioStore.ts
var MAX_MESSAGES = 25;
var messages = [];
var addAudioMessage = (msg) => {
	const audioMessage = {
		id: crypto.randomUUID(),
		sender: msg.sender,
		audioData: msg.audioData,
		duration: msg.duration,
		timestamp: Date.now(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	messages.unshift(audioMessage);
	if (messages.length > MAX_MESSAGES) messages.pop();
	return audioMessage;
};
var getAudioMessagesSince = (sinceTimestamp) => {
	if (!sinceTimestamp || Number.isNaN(sinceTimestamp)) return messages.slice(0, 3);
	return messages.filter((m) => m.timestamp > sinceTimestamp);
};
//#endregion
//#region src/pages/api/audio/index.ts
var audio_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
var audioPostSchema = z.object({
	sender: z.enum(["Mesero", "Cocina"]),
	audioData: z.string().min(10),
	duration: z.number().optional()
});
var GET = async ({ url }) => {
	const sinceParam = url.searchParams.get("since");
	const messages = getAudioMessagesSince(sinceParam ? Number(sinceParam) : void 0);
	return new Response(JSON.stringify({
		messages,
		serverTime: Date.now()
	}), { headers: { "Content-Type": "application/json" } });
};
var POST = async ({ request }) => {
	const payload = await request.json().catch(() => null);
	const parsed = audioPostSchema.safeParse(payload);
	if (!parsed.success) return new Response(JSON.stringify({ error: "Datos de audio inválidos." }), {
		status: 400,
		headers: { "Content-Type": "application/json" }
	});
	const message = addAudioMessage({
		sender: parsed.data.sender,
		audioData: parsed.data.audioData,
		duration: parsed.data.duration
	});
	return new Response(JSON.stringify(message), {
		status: 201,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/audio/index@_@ts
var page = () => audio_exports;
//#endregion
export { page };
