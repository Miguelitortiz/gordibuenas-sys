import type { APIRoute } from 'astro';
import { getConfig, setGuisados } from '../../lib/store';
import { z } from 'zod';

const configSchema = z.object({
  guisadosDelDia: z.array(z.string().trim().min(1)).min(1),
});

export const GET: APIRoute = async () => {
  const config = await getConfig();
  return new Response(JSON.stringify(config), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ request }) => {
  const payload = await request.json().catch(() => null);
  const parsed = configSchema.safeParse(payload);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Guisados inválidos.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const updated = await setGuisados(
    Array.from(new Set(parsed.data.guisadosDelDia.map((item) => item.trim()))),
  );

  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
};
