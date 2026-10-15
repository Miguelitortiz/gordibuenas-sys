import type { APIRoute } from 'astro';
import { addAudioMessage, getAudioMessagesSince } from '../../../lib/audioStore';
import { z } from 'zod';

const audioPostSchema = z.object({
  sender: z.enum(['Mesero', 'Cocina']),
  audioData: z.string().min(10), // Base64 data URL
  duration: z.number().optional(),
});

export const GET: APIRoute = async ({ url }) => {
  const sinceParam = url.searchParams.get('since');
  const sinceTimestamp = sinceParam ? Number(sinceParam) : undefined;
  const messages = getAudioMessagesSince(sinceTimestamp);

  return new Response(JSON.stringify({ messages, serverTime: Date.now() }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.json().catch(() => null);
  const parsed = audioPostSchema.safeParse(payload);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Datos de audio inválidos.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const message = addAudioMessage({
    sender: parsed.data.sender,
    audioData: parsed.data.audioData,
    duration: parsed.data.duration,
  });

  return new Response(JSON.stringify(message), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
