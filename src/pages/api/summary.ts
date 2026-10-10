import type { APIRoute } from 'astro';
import { dailySummary } from '../../lib/store';

export const GET: APIRoute = async () => {
  const summary = await dailySummary();
  return new Response(JSON.stringify(summary), {
    headers: { 'Content-Type': 'application/json' },
  });
};
