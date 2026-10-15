import type { APIRoute } from 'astro';
import { subscribeAudioMessages, getAudioMessagesSince } from '../../../lib/audioStore';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const sinceParam = url.searchParams.get('since');
  const sinceTimestamp = sinceParam ? parseInt(sinceParam, 10) : undefined;

  let unsubscribe: (() => void) | null = null;
  let keepAliveInterval: any = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Enviar evento de conexión inicial
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Si el cliente reconecta con un timestamp reciente, enviar audios que hayan entrado durante la reconexión
      if (sinceTimestamp && !Number.isNaN(sinceTimestamp)) {
        const recentMessages = getAudioMessagesSince(sinceTimestamp);
        for (const msg of recentMessages) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
          } catch (_) {}
        }
      }

      // Suscribirse a mensajes en tiempo real (< 100ms)
      unsubscribe = subscribeAudioMessages((msg) => {
        try {
          const data = `data: ${JSON.stringify(msg)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (_) {}
      });

      // Keep-alive heartbeat cada 8 segundos para mantener viva la radio móvil con pantalla bloqueada
      keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch (_) {}
      }, 8000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (keepAliveInterval) clearInterval(keepAliveInterval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Evita buffering en proxies Nginx/Cloudflare
    },
  });
};
