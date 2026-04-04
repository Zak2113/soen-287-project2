// drizzle.config.js
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.js',    // Where your blueprint lives
  out: './db/migrations',      // Where Drizzle saves its history
  dialect: 'sqlite',           // Tell it we are using SQLite
  dbCredentials: {
    url: 'file:./noodle.db',   // Where the actual DB file is
  },
});