import { SQLDatabase } from "encore.dev/storage/sqldb";

export const profileDB = new SQLDatabase("profile", {
  migrations: "./migrations",
});
