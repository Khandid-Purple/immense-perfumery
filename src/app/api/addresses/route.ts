import { eq } from 'drizzle-orm';
import { db, schema } from '@/server/db';
import { requireApiUser, withRoute, json, parseBody } from '@/server/api';
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

export const GET = withRoute(async () => {
  const user = await requireApiUser();
  const rows = await db.select().from(schema.address).where(eq(schema.address.userId, user.id));
  return json(rows);
});

export const POST = withRoute(async (req) => {
  const user = await requireApiUser();
  const data = await parseBody(req, addressInput);
  const [row] = await db.insert(schema.address).values({ ...data, userId: user.id }).returning();
  return json(row, 201);
});
