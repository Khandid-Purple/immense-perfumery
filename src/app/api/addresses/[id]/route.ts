import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/server/db';
import { requireApiUser, withRoute, json, parseBody, ApiError } from '@/server/api';
import { z } from 'zod';

const addressInput = z.object({
  label: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(1),
  digitalAddress: z.string().optional(),
  region: z.string().min(1),
  city: z.string().min(1),
  zip: z.string().optional(),
  phone: z.string().min(1),
});

export const PATCH = withRoute(async (req, { params }) => {
  const user = await requireApiUser();
  const { id } = await params;
  const data = await parseBody(req, addressInput);
  const [existing] = await db.select().from(schema.address).where(eq(schema.address.id, id));
  if (!existing || existing.userId !== user.id) throw new ApiError('Address not found', 404, 'NOT_FOUND');
  const [row] = await db.update(schema.address).set(data).where(eq(schema.address.id, id)).returning();
  return json(row);
});

export const DELETE = withRoute(async (_req, { params }) => {
  const user = await requireApiUser();
  const { id } = await params;
  const [existing] = await db.select().from(schema.address).where(eq(schema.address.id, id));
  if (!existing || existing.userId !== user.id) throw new ApiError('Address not found', 404, 'NOT_FOUND');
  await db.delete(schema.address).where(and(eq(schema.address.id, id), eq(schema.address.userId, user.id)));
  return json({ ok: true });
});
