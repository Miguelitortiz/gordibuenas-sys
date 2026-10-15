import type { APIRoute } from 'astro';
import { updateOrder } from '../../../lib/store';
import { z } from 'zod';

const plateItemSchema = z.object({
  kind: z.enum(['guisado', 'bebida']),
  name: z.string().trim().min(1),
  quantity: z.number().int().min(1),
});

const plateSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  items: z.array(plateItemSchema),
  notes: z.string().optional(),
});

const patchSchema = z
  .object({
    status: z.enum(['pendiente', 'en_preparacion', 'terminado', 'cancelado']).optional(),
    table: z.string().optional(),
    customerName: z.string().optional(),
    notes: z.string().optional(),
    plates: z.array(plateSchema).optional(),
    guisados: z
      .array(
        z.object({
          name: z.string().trim().min(1),
          quantity: z.number().int().min(0),
        }),
      )
      .optional(),
    drinks: z
      .object({
        aguaFrescaChica: z.number().int().min(0).optional(),
        aguaFrescaLitro: z.number().int().min(0).optional(),
        cafe: z.number().int().min(0).optional(),
      })
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Sin cambios');

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(payload);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Actualización inválida.', details: parsed.error.issues }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (parsed.data.plates) {
    const hasAnyItem = parsed.data.plates.some(
      (p) => p.items && p.items.length > 0 && p.items.some((i) => i.quantity > 0),
    );
    if (!hasAnyItem) {
      return new Response(JSON.stringify({ error: 'El pedido no puede quedar vacío.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (parsed.data.guisados || parsed.data.drinks) {
    const hasAnyItem =
      (parsed.data.guisados ?? []).some((item) => item.quantity > 0) ||
      Object.values(parsed.data.drinks ?? {}).some((value) => (value ?? 0) > 0);

    if (!hasAnyItem) {
      return new Response(JSON.stringify({ error: 'El pedido no puede quedar vacío.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const order = await updateOrder(id, parsed.data);

    if (!order) {
      return new Response(JSON.stringify({ error: 'Pedido no encontrado.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(order), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    if (err?.message === 'NO_MODIFICABLE_TERMINADO') {
      return new Response(
        JSON.stringify({
          error: 'Esta comanda ya fue terminada por cocina y no puede modificarse. Usa "Agregar a la cuenta" para enviar una nueva tarjeta a cocina.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    return new Response(JSON.stringify({ error: 'Error al actualizar comanda.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { deleteOrderById } = await import('../../../lib/store');
  const deleted = await deleteOrderById(id);

  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Pedido no encontrado.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, message: 'Pedido eliminado correctamente.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
