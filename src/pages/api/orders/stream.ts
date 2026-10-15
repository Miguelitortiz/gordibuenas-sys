import type { APIRoute } from 'astro';
import { subscribeOrderEvents } from '../../../lib/store';

export const GET: APIRoute = async () => {
  let unsubscribe: (() => void) | null = null;
  let keepAliveInterval: any = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Enviar evento de conexión inicial
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Suscribirse a eventos de órdenes y cuentas en tiempo real
      unsubscribe = subscribeOrderEvents((event) => {
        try {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (_) {}
      });

      // Keep-alive heartbeat cada 8 segundos para mantener la conexión viva
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
      'X-Accel-Buffering': 'no',
    },
  });
};
