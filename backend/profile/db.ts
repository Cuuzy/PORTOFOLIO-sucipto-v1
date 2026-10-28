import { SQLDatabase } from "encore.dev/storage/sqldb";

const SLOW_QUERY_THRESHOLD_MS = 500;

type Row = Record<string, any>;

function buildQueryString(strings: TemplateStringsArray, params: any[]): string {
  return strings.reduce((acc: string, str: string, i: number) => {
    return acc + str + (i < params.length ? `$${i + 1}` : "");
  }, "");
}

function logSlowQuery(sql: string, durationMs: number): void {
  console.warn(`[SLOW QUERY] ${durationMs}ms | ${sql.replace(/\s+/g, " ").trim()}`);
}

const _db = new SQLDatabase("profile", {
  migrations: "./migrations",
});

class ProfileDB {
  async queryRow<T extends Row = Row>(
    strings: TemplateStringsArray,
    ...params: any[]
  ): Promise<T | null> {
    const start = Date.now();
    const result = await _db.queryRow<T>(strings, ...params);
    const ms = Date.now() - start;
    if (ms >= SLOW_QUERY_THRESHOLD_MS) logSlowQuery(buildQueryString(strings, params), ms);
    return result;
  }

  async queryAll<T extends Row = Row>(
    strings: TemplateStringsArray,
    ...params: any[]
  ): Promise<T[]> {
    const start = Date.now();
    const result = await _db.queryAll<T>(strings, ...params);
    const ms = Date.now() - start;
    if (ms >= SLOW_QUERY_THRESHOLD_MS) logSlowQuery(buildQueryString(strings, params), ms);
    return result;
  }

  async *query<T extends Row = Row>(
    strings: TemplateStringsArray,
    ...params: any[]
  ): AsyncGenerator<T> {
    const start = Date.now();
    for await (const row of _db.query<T>(strings, ...params)) {
      yield row;
    }
    const ms = Date.now() - start;
    if (ms >= SLOW_QUERY_THRESHOLD_MS) logSlowQuery(buildQueryString(strings, params), ms);
  }

  async exec(strings: TemplateStringsArray, ...params: any[]): Promise<void> {
    const start = Date.now();
    await _db.exec(strings, ...params);
    const ms = Date.now() - start;
    if (ms >= SLOW_QUERY_THRESHOLD_MS) logSlowQuery(buildQueryString(strings, params), ms);
  }

  async rawQueryAll<T extends Row = Row>(query: string, ...params: any[]): Promise<T[]> {
    const start = Date.now();
    const result = await _db.rawQueryAll<T>(query, ...params);
    const ms = Date.now() - start;
    if (ms >= SLOW_QUERY_THRESHOLD_MS) {
      console.warn(`[SLOW QUERY] ${ms}ms | ${query.replace(/\s+/g, " ").trim()} | params: ${JSON.stringify(params)}`);
    }
    return result;
  }

  async rawQueryRow<T extends Row = Row>(query: string, ...params: any[]): Promise<T | null> {
    const start = Date.now();
    const result = await _db.rawQueryRow<T>(query, ...params);
    const ms = Date.now() - start;
    if (ms >= SLOW_QUERY_THRESHOLD_MS) {
      console.warn(`[SLOW QUERY] ${ms}ms | ${query.replace(/\s+/g, " ").trim()} | params: ${JSON.stringify(params)}`);
    }
    return result;
  }

  async rawExec(query: string, ...params: any[]): Promise<void> {
    const start = Date.now();
    await _db.rawExec(query, ...params);
    const ms = Date.now() - start;
    if (ms >= SLOW_QUERY_THRESHOLD_MS) {
      console.warn(`[SLOW QUERY] ${ms}ms | ${query.replace(/\s+/g, " ").trim()} | params: ${JSON.stringify(params)}`);
    }
  }

  get connectionString(): string {
    return _db.connectionString;
  }

  begin = _db.begin.bind(_db);
}

export const profileDB = new ProfileDB();
