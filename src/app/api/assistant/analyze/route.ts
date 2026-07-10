import { db, schema } from '@/server/db';
import { analyzeImage } from '@/server/gemini';
import { toClientProduct } from '@/server/products';
import { withRoute, json, parseBody } from '@/server/api';
import { z } from 'zod';

const input = z.object({ imageBase64: z.string().min(1), mimeType: z.string().min(1) });

export const POST = withRoute(async (req) => {
  const { imageBase64, mimeType } = await parseBody(req, input);
  const rows = await db.select().from(schema.product);
  const products = rows.map((r) => toClientProduct(r));
  const result = await analyzeImage(imageBase64, mimeType, products);
  return json(result);
});
