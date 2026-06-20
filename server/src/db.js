import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool, types } = pg;

// Return DATE columns (type OID 1082) as plain "YYYY-MM-DD" strings instead of
// JS Date objects, so timezones don't shift the day.
types.setTypeParser(1082, (value) => value);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
