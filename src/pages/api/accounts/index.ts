import type { APIRoute } from 'astro';
import { listOpenAccounts, closeAccountById } from '../../../lib/store';

export const GET: APIRoute = async () => {
  const accounts = await listOpenAccounts();
  return new Response(JSON.stringify(accounts), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.json().catch(() => null);
  const accountId = payload?.accountId;

  if (!accountId || typeof accountId !== 'string') {
    return new Response(JSON.stringify({ error: 'ID de cuenta requerido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const success = await closeAccountById(accountId);

  return new Response(JSON.stringify({ success, message: success ? 'Cuenta cerrada y cobrada.' : 'No se encontró la cuenta.' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
