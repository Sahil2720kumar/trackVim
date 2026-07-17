import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless"; 
import { Pool } from "@neondatabase/serverless";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing environment variable: DATABASE_URL");
}

const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool);