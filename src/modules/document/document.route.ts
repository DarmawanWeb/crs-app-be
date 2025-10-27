// src/modules/document/document.route.ts (Fixed - import t from elysia)
import { Elysia, t } from "elysia";
import { DocumentModel } from "./document.model";
import {
  ResponseError,
  ResponseSuccess,
  ResponsePaginationSuccess,
} from "../../lib/response";
import { DocumentService } from "./document.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/rbac.middleware";

export const DocumentRoutes = (app: Elysia) =>
  app.group("/documents", (doc) => {
    // GET /documents
    doc.use(authMiddleware).get(
      "/",
      async ({ query, set }) => {
        const { data, error, statusCode } =
          await DocumentService.getAllDocuments(query);

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error,
          };
        }

        set.status = statusCode || 200;
        return {
          success: true,
          data: data?.documents,
          meta: data?.pagination,
        };
      },
      {
        tags: ["Documents"],
        query: DocumentModel.getAllDocumentsQuery,
        response: {
          200: ResponsePaginationSuccess(DocumentModel.documentResponse),
          400: ResponseError,
          401: ResponseError,
          500: ResponseError,
        },
        detail: {
          summary: "Get all documents",
          description:
            "Retrieve all documents with pagination and filtering. Available to all authenticated users.",
        },
      },
    );

    // GET /documents/:number
    doc.use(authMiddleware).get(
      "/:number",
      async ({ params, set }) => {
        const { data, error, statusCode } =
          await DocumentService.getDocumentByNumber(params.number);

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error,
          };
        }

        set.status = statusCode || 200;
        return {
          success: true,
          data,
        };
      },
      {
        tags: ["Documents"],
        params: t.Object({
          number: t.String(),
        }),
        response: {
          200: ResponseSuccess(DocumentModel.documentResponse),
          401: ResponseError,
          404: ResponseError,
          500: ResponseError,
        },
        detail: {
          summary: "Get document by number",
          description:
            "Retrieve a specific document by its number. Available to all authenticated users.",
        },
      },
    );

    // POST /documents/upload
    doc.use(requireAdmin()).post(
      "/upload",
      async ({ body, set }) => {
        const { data, error, statusCode } =
          await DocumentService.createDocumentWithFile(body);

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error,
          };
        }

        set.status = statusCode || 201;
        return {
          success: true,
          data,
        };
      },
      {
        tags: ["Documents"],
        body: DocumentModel.createDocumentWithFileBody,
        response: {
          201: ResponseSuccess(DocumentModel.documentResponse),
          400: ResponseError,
          401: ResponseError,
          403: ResponseError,
          409: ResponseError,
          500: ResponseError,
        },
        detail: {
          summary: "Create document with file upload",
          description:
            "Create a new document with file upload. Requires admin or superadmin role. Use multipart/form-data.",
        },
      },
    );

    // POST /documents
    doc.use(requireAdmin()).post(
      "/",
      async ({ body, set }) => {
        const { data, error, statusCode } =
          await DocumentService.createDocument(body);

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error,
          };
        }

        set.status = statusCode || 201;
        return {
          success: true,
          data,
        };
      },
      {
        tags: ["Documents"],
        body: DocumentModel.createDocumentBody,
        response: {
          201: ResponseSuccess(DocumentModel.documentResponse),
          401: ResponseError,
          403: ResponseError,
          409: ResponseError,
          500: ResponseError,
        },
        detail: {
          summary: "Create document (without file)",
          description:
            "Create a new document with existing file path. Requires admin or superadmin role.",
        },
      },
    );

    // PUT /documents/:number/upload
    doc.use(requireAdmin()).put(
      "/:number/upload",
      async ({ params, body, set }) => {
        const { data, error, statusCode } =
          await DocumentService.updateDocumentWithFile(params.number, body);

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error,
          };
        }

        set.status = statusCode || 200;
        return {
          success: true,
          data,
        };
      },
      {
        tags: ["Documents"],
        params: t.Object({
          number: t.String(),
        }),
        body: DocumentModel.updateDocumentWithFileBody,
        response: {
          200: ResponseSuccess(DocumentModel.documentResponse),
          400: ResponseError,
          401: ResponseError,
          403: ResponseError,
          404: ResponseError,
          500: ResponseError,
        },
        detail: {
          summary: "Update document with file upload",
          description:
            "Update document and optionally replace file. Requires admin or superadmin role. Use multipart/form-data.",
        },
      },
    );

    // PUT /documents/:number
    doc.use(requireAdmin()).put(
      "/:number",
      async ({ params, body, set }) => {
        const { data, error, statusCode } =
          await DocumentService.updateDocument(params.number, body);

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error,
          };
        }

        set.status = statusCode || 200;
        return {
          success: true,
          data,
        };
      },
      {
        tags: ["Documents"],
        params: t.Object({
          number: t.String(),
        }),
        body: DocumentModel.updateDocumentBody,
        response: {
          200: ResponseSuccess(DocumentModel.documentResponse),
          400: ResponseError,
          401: ResponseError,
          403: ResponseError,
          404: ResponseError,
          500: ResponseError,
        },
        detail: {
          summary: "Update document (without file)",
          description:
            "Update document fields. Requires admin or superadmin role.",
        },
      },
    );

    // DELETE /documents/:number
    doc.use(requireAdmin()).delete(
      "/:number",
      async ({ params, set }) => {
        const { data, error, statusCode } =
          await DocumentService.deleteDocument(params.number);

        if (error) {
          set.status = statusCode || 500;
          return {
            success: false,
            error,
          };
        }

        set.status = statusCode || 200;
        return {
          success: true,
          data,
        };
      },
      {
        tags: ["Documents"],
        params: t.Object({
          number: t.String(),
        }),
        response: {
          200: ResponseSuccess(DocumentModel.deleteDocumentResponse),
          401: ResponseError,
          403: ResponseError,
          404: ResponseError,
          500: ResponseError,
        },
        detail: {
          summary: "Delete document",
          description:
            "Delete a document and its associated file. Requires admin or superadmin role.",
        },
      },
    );

    return doc;
  });
