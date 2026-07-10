import { eq } from 'drizzle-orm';
import { db, schema } from '@/server/db';
import { requireApiRole, withRoute, json, parseBody } from '@/server/api';
import { z } from 'zod';
import type { Settings } from '@/lib/types';

function toClientSettings(row: typeof schema.settings.$inferSelect): Settings {
  return {
    heroProductId: row.heroProductId,
    freeShippingThreshold: Number(row.freeShippingThreshold),
    standardShippingRate: Number(row.standardShippingRate),
    expressShippingRate: Number(row.expressShippingRate),
    giftWrapRate: Number(row.giftWrapRate),
  };
}

const settingsInput = z.object({
  heroProductId: z.string().nullable().optional(),
  freeShippingThreshold: z.number().nonnegative().optional(),
  standardShippingRate: z.number().nonnegative().optional(),
  expressShippingRate: z.number().nonnegative().optional(),
  giftWrapRate: z.number().nonnegative().optional(),
});

export const GET = withRoute(async () => {
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.id, 'settings'));
  return json(row ? toClientSettings(row) : {
    heroProductId: null, freeShippingThreshold: 3000, standardShippingRate: 45, expressShippingRate: 80, giftWrapRate: 25,
  });
});

export const PATCH = withRoute(async (req) => {
  await requireApiRole('admin');
  const data = await parseBody(req, settingsInput);
  const [row] = await db.update(schema.settings).set({
    ...(data.heroProductId !== undefined ? { heroProductId: data.heroProductId } : {}),
    ...(data.freeShippingThreshold !== undefined ? { freeShippingThreshold: String(data.freeShippingThreshold) } : {}),
    ...(data.standardShippingRate !== undefined ? { standardShippingRate: String(data.standardShippingRate) } : {}),
    ...(data.expressShippingRate !== undefined ? { expressShippingRate: String(data.expressShippingRate) } : {}),
    ...(data.giftWrapRate !== undefined ? { giftWrapRate: String(data.giftWrapRate) } : {}),
    updatedAt: new Date(),
  }).where(eq(schema.settings.id, 'settings')).returning();
  return json(toClientSettings(row));
});
