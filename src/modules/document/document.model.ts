import { t } from "elysia";

export const DocumentModel = {
  createDocumentWithFileBody: t.Object({
    number: t.String({ minLength: 1 }),
    title: t.String({ minLength: 1 }),
    availability: t.String({ pattern: "^(true|false)$" }),
    project: t.String({ minLength: 1 }),
    discipline: t.String({ minLength: 1 }),
    wp: t.String({ minLength: 1 }),
    lookup: t.String({ minLength: 1 }),
    file: t.File(),
  }),

  createDocumentBody: t.Object({
    number: t.String({ minLength: 1 }),
    title: t.String({ minLength: 1 }),
    availability: t.Boolean(),
    file_path: t.String({ minLength: 1 }),
    project: t.String({ minLength: 1 }),
    discipline: t.String({ minLength: 1 }),
    wp: t.String({ minLength: 1 }),
    lookup: t.String({ minLength: 1 }),
  }),

  updateDocumentBody: t.Object({
    title: t.Optional(t.String({ minLength: 1 })),
    availability: t.Optional(t.Boolean()),
    file_path: t.Optional(t.String({ minLength: 1 })),
    project: t.Optional(t.String({ minLength: 1 })),
    discipline: t.Optional(t.String({ minLength: 1 })),
    wp: t.Optional(t.String({ minLength: 1 })),
    lookup: t.Optional(t.String({ minLength: 1 })),
  }),

  updateDocumentWithFileBody: t.Object({
    title: t.Optional(t.String({ minLength: 1 })),
    availability: t.Optional(t.String({ pattern: "^(true|false)$" })),
    project: t.Optional(t.String({ minLength: 1 })),
    discipline: t.Optional(t.String({ minLength: 1 })),
    wp: t.Optional(t.String({ minLength: 1 })),
    lookup: t.Optional(t.String({ minLength: 1 })),
    file: t.Optional(t.File()),
  }),

  documentResponse: t.Object({
    number: t.String(),
    title: t.String(),
    availability: t.Boolean(),
    file_path: t.String(),
    project: t.String(),
    discipline: t.String(),
    wp: t.String(),
    lookup: t.String(),
    created_at: t.String(),
  }),

  getAllDocumentsQuery: t.Object({
    page: t.Optional(t.String({ pattern: "^[0-9]+$" })),
    limit: t.Optional(t.String({ pattern: "^[0-9]+$" })),
  }),

  deleteDocumentResponse: t.Object({
    message: t.String(),
  }),
} as const;

export type CreateDocumentBody = typeof DocumentModel.createDocumentBody.static;
export type UpdateDocumentBody = typeof DocumentModel.updateDocumentBody.static;
export type GetAllDocumentsQuery =
  typeof DocumentModel.getAllDocumentsQuery.static;
