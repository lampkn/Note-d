import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

/** Get or create the singleton DB connection */
export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:noted.db");
  }
  return db;
}

/** Log all tables and their row counts to the console */
export async function logTables(): Promise<void> {
  const database = await getDb();

  // Get all table names
  const tables = await database.select<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_sqlx_%'"
  );

  console.log("📋 Database tables found:", tables.length);
}
