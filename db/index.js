// db/index.js
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// This automatically creates a physical file named "noodle.db" in your root folder
const sqlite = new Database('noodle.db');

// Export the database instance so your Next.js routes can use it
export const db = drizzle(sqlite, { schema });