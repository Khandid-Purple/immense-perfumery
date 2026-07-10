import { runSeed } from '@/server/db/seed';
import { apiError, json } from '@/server/api';

async function handle(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret') ?? req.headers.get('x-seed-secret');
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return apiError('Forbidden — bad or missing seed secret', 403, 'FORBIDDEN');
  }
  try {
    const result = await runSeed();
    return json(result);
  } catch (e) {
    console.error('[seed]', e);
    return apiError(`Seed failed: ${e instanceof Error ? e.message : 'unknown'}`, 500);
  }
}

export const POST = handle;
export const GET = handle; // dev convenience: hit in browser with ?secret=
