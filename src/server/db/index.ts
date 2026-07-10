// ─────────────────────────────────────────────────────────────
// Drizzle client over Neon serverless.
//
//  • Lazy `db` proxy so `next build` succeeds without DATABASE_URL.
//  • Using WebSocket Pool instead of neon-http to avoid fetch timeouts
//    in the local Node environment.
// ─────────────────────────────────────────────────────────────
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema';

// WebSocket constructor for the pooled (transaction) driver in Node.
neonConfig.webSocketConstructor = ws;

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _pool: Pool | null = null;
let _db: DB | null = null;

function init(): DB {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example → .env.local and add your Neon connection string.',
    );
  }
  _pool = new Pool({ connectionString: url });
  return drizzle(_pool, { schema, casing: 'snake_case' });
}

// Lazy proxy: the client is only constructed on first real DB access,
// so importing this module during build (no secrets) is safe.
export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    if (!_db) _db = init();
    // @ts-expect-error — dynamic forward to the real client
    return _db[prop];
  },
});

/**
 * Run a set of writes inside a single transaction.
 * Uses a short-lived WebSocket Pool and always closes it.
 */
export async function withTransaction<T>(
  fn: (tx: Parameters<Parameters<DB['transaction']>[0]>[0]) => Promise<T>,
): Promise<T> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  const pool = new Pool({ connectionString: url });
  try {
    const tdb = drizzle(pool, { schema, casing: 'snake_case' });
    return await tdb.transaction(fn);
  } finally {
    await pool.end();
  }
}

export { schema };
