import { APIError } from "encore.dev/api";

export type Primitive = string | number | boolean | Buffer | Date | null;

interface RawQueryable {
  rawQueryAll<T extends object>(query: string, ...params: any[]): Promise<T[]>;
  rawQueryRow<T extends object>(query: string, ...params: any[]): Promise<T | null>;
}

export async function findOrThrow<T>(
  query: Promise<T | null>,
  resourceName: string
): Promise<T> {
  const row = await query;
  if (!row) {
    throw APIError.notFound(`${resourceName} not found`);
  }
  return row;
}

export async function rawQueryAll<T extends object>(
  db: RawQueryable,
  query: string,
  params: Primitive[]
): Promise<T[]> {
  return db.rawQueryAll<T>(query, ...params);
}

export async function rawQueryRow<T extends object>(
  db: RawQueryable,
  query: string,
  params: Primitive[]
): Promise<T | null> {
  return db.rawQueryRow<T>(query, ...params);
}
