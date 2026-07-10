// ─────────────────────────────────────────────────────────────
// API helpers — response contract + authz.
//   json()            → success body
//   apiError()        → { error, code? } with status
//   parseBody()       → zod-validate a request body (422 on fail)
//   requireApiUser()  → session.user or throws 401
//   requireApiRole()  → role gate or throws 403
//   ApiError          → thrown by guards, caught by withRoute()
//   withRoute()       → wraps a handler, turns thrown ApiError /
//                       ZodError / unknown into the standard shape
// ─────────────────────────────────────────────────────────────
import { headers as nextHeaders } from 'next/headers';
import { ZodError, type ZodSchema } from 'zod';
import { auth } from './auth';

type Role = 'customer' | 'admin';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: Role;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function apiError(message: string, status = 400, code?: string): Response {
  return Response.json({ error: message, ...(code ? { code } : {}) }, { status });
}

export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError('Invalid JSON body', 400, 'BAD_JSON');
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new ApiError(
      first ? `${first.path.join('.') || 'body'}: ${first.message}` : 'Validation failed',
      422,
      'VALIDATION',
    );
  }
  return result.data;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await nextHeaders() });
  if (!session?.user) return null;
  const u = session.user as unknown as Record<string, unknown>;
  return {
    id: String(u.id),
    email: String(u.email ?? ''),
    name: String(u.name ?? ''),
    image: (u.image as string | null) ?? null,
    role: (u.role as Role) ?? 'customer',
  };
}

export async function requireApiUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new ApiError('You must be signed in', 401, 'UNAUTHENTICATED');
  return user;
}

export async function requireApiRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireApiUser();
  if (!roles.includes(user.role)) throw new ApiError('Forbidden', 403, 'FORBIDDEN');
  return user;
}

/** Wrap a route handler so thrown errors become the standard contract. */
export function withRoute(
  handler: (req: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
) {
  return async (req: Request, ctx: { params: Promise<Record<string, string>> }): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) return apiError(e.message, e.status, e.code);
      if (e instanceof ZodError) {
        const first = e.issues[0];
        return apiError(first?.message ?? 'Validation failed', 422, 'VALIDATION');
      }
      console.error('[api]', e);
      return apiError('Something went wrong. Please try again.', 500, 'INTERNAL');
    }
  };
}
