import { t, type TSchema } from "elysia";

const PaginationMeta = t.Object({
  total: t.Number(),
  total_pages: t.Number(),
  current_page: t.Number(),
  per_page: t.Number(),
});

export const ResponsePaginationSuccess = (data: TSchema): TSchema =>
  t.Object({
    success: t.Literal(true),
    data,
    meta: t.Optional(PaginationMeta),
  });

export const ResponseSuccess = (data: TSchema): TSchema =>
  t.Object({
    success: t.Literal(true),
    data,
  });

export const ResponseError = t.Object({
  success: t.Literal(false),
  error: t.String(),
});
