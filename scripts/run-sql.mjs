import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const file = process.argv[2];

if (!file) {
  console.error("Usage: node scripts/run-sql.mjs <path-to-sql-file>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add Railway Postgres DATABASE_URL to your environment.");
  process.exit(1);
}

const sqlPath = path.resolve(process.cwd(), file);
const sql = await readFile(sqlPath, "utf8");
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
});

try {
  await client.connect();
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log(`Applied ${file}`);
} catch (error) {
  await client.query("rollback").catch(() => undefined);
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end();
}
