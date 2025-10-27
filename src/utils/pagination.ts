import { SQL, sql } from "drizzle-orm";
import { PgTable, TableConfig, PgColumn } from "drizzle-orm/pg-core";
import { db } from "../db/db";

export type PaginationParams = {
  page?: string | number;
  limit?: string | number;
};

export type PaginationMeta = {
  total: number;
  total_pages: number;
  current_page: number;
  per_page: number;
  has_next_page: boolean;
  has_prev_page: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginationMeta;
};

export function parsePaginationParams(params: PaginationParams) {
  const page = Math.max(1, parseInt(String(params.page || 1)));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(params.limit || 10))),
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const total_pages = Math.ceil(total / limit);

  return {
    total,
    total_pages,
    current_page: page,
    per_page: limit,
    has_next_page: page < total_pages,
    has_prev_page: page > 1,
  };
}

export async function paginate<T extends PgTable<TableConfig>>(params: {
  table: T;
  page: number;
  limit: number;
  where?: SQL;
  orderBy?: SQL | SQL[] | PgColumn | PgColumn[] | any; // eslint-disable-line @typescript-eslint/no-explicit-any
  select?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}): Promise<
  | { data: any[]; meta: PaginationMeta; error: null } // eslint-disable-line @typescript-eslint/no-explicit-any
  | { error: string; data?: never; meta?: never }
> {
  try {
    const { table, page, limit, where, orderBy, select } = params;
    const offset = (page - 1) * limit;

    // Count total
    const countQueryBase = db
      .select({ count: sql<number>`count(*)::int` })
      .from(table as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const countQuery = where ? countQueryBase.where(where) : countQueryBase;

    const [{ count: total }] = await countQuery;

    // Get data
    const dataQueryBase = select
      ? db.select(select).from(table as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      : db.select().from(table as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const dataQueryWithWhere = where
      ? dataQueryBase.where(where)
      : dataQueryBase;

    const dataQuery = orderBy
      ? Array.isArray(orderBy)
        ? dataQueryWithWhere.orderBy(...orderBy)
        : dataQueryWithWhere.orderBy(orderBy)
      : dataQueryWithWhere;

    const data = await dataQuery.limit(limit).offset(offset);

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
      error: null,
    };
  } catch (error) {
    console.error("Pagination error:", error);
    return { error: "Failed to paginate data" };
  }
}

export function paginationResponse<T>(data: T[], meta: PaginationMeta) {
  return {
    success: true,
    data,
    meta,
  };
}
