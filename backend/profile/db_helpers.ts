import { APIError } from "encore.dev/api";

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
