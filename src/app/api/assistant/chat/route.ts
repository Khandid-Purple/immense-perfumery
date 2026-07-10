import { db, schema } from '@/server/db';
import { streamChatResponse } from '@/server/gemini';
import { toClientProduct } from '@/server/products';
import { apiError } from '@/server/api';

export async function POST(req: Request) {
  let body: { history?: { role: string; text: string }[]; message?: string };
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON body', 400, 'BAD_JSON');
  }
  const message = body.message?.trim();
  if (!message) return apiError('message is required', 422, 'VALIDATION');

  const rows = await db.select().from(schema.product);
  const products = rows.map((r) => toClientProduct(r));

  const stream = streamChatResponse(body.history ?? [], message, products);
  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8' } });
}
