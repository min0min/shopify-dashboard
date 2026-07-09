// Applies a Prisma migration.sql file to a Turso database over HTTP,
// avoiding the native libsql binding (useful on platforms like Windows ARM64
// where that binding isn't published).
//
// Usage: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/apply-turso-schema.mjs <path-to-migration.sql>
import { createClient } from "@libsql/client/web";
import { readFileSync } from "node:fs";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN env vars");
  process.exit(1);
}

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("Usage: node scripts/apply-turso-schema.mjs <path-to-migration.sql>");
  process.exit(1);
}

const client = createClient({ url, authToken });
const sql = readFileSync(sqlPath, "utf-8");

await client.executeMultiple(sql);

const tables = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
);
console.log(
  "Tables now in Turso DB:",
  tables.rows.map((r) => r.name)
);

client.close();
