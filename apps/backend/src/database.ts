import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openDatabase(databasePath: string): DatabaseSync {
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON");
  database.exec("PRAGMA journal_mode = WAL");
  return database;
}

export function initializeDatabase(database: DatabaseSync): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      image_path TEXT NOT NULL,
      image_filename TEXT NOT NULL,
      image_mime_type TEXT NOT NULL,
      image_size_bytes INTEGER NOT NULL,
      extracted_text TEXT,
      extracted_merchant_name TEXT,
      extracted_purchased_at TEXT,
      extracted_total_amount_cents INTEGER,
      category TEXT NOT NULL DEFAULT 'Unclassified',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}
