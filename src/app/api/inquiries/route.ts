import { db, schema } from '@/server/db';
import { getSessionUser, withRoute, json, parseBody } from '@/server/api';
import { z } from 'zod';

const input = z.object({
  type: z.enum(['contact', 'wholesale', 'newsletter']),
  name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
  volumeRange: z.string().optional(),
});

export const POST = withRoute(async (req) => {
  const data = await parseBody(req, input);
  const user = await getSessionUser();
  const [row] = await db.insert(schema.inquiry).values({ ...data, userId: user?.id }).returning();
  return json(row, 201);
});
