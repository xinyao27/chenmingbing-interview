import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg"; //
import * as schema from "./schema";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

process.on("exit", async () => {
  await pool.end();
  console.log("PostgreSQL pool closed.");
});
