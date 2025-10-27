// src/modules/document/document.repository.ts (Fixed)
import { eq, and, or, ilike } from "drizzle-orm";
import { db } from "../../db/db";
import { document } from "../../db/schema";
import { CreateDocumentBody, UpdateDocumentBody } from "./document.model";
import { paginate, parsePaginationParams } from "../../utils/pagination";

export const DocumentRepository = {
  getAllDocuments: async (params: {
    page?: string | number;
    limit?: string | number;
    search?: string;
    project?: string;
    discipline?: string;
  }) => {
    try {
      const { page, limit } = parsePaginationParams(params);
      const { search, project, discipline } = params;

      // Build where conditions
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            ilike(document.number, `%${search}%`),
            ilike(document.title, `%${search}%`),
            ilike(document.lookup, `%${search}%`),
          ),
        );
      }

      if (project) {
        conditions.push(eq(document.project, project));
      }

      if (discipline) {
        conditions.push(eq(document.discipline, discipline));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Use paginate utility
      const result = await paginate({
        table: document,
        page,
        limit,
        where: whereClause,
        orderBy: document.created_at,
      });

      if (result.error) {
        return { error: result.error };
      }

      return {
        error: null,
        data: {
          documents: result.data,
          pagination: result.meta,
        },
      };
    } catch (error) {
      console.error("Failed to get all documents:", error);
      return { error: "Failed to retrieve documents" };
    }
  },

  getDocumentByNumber: async (number: string) => {
    try {
      const result = await db
        .select()
        .from(document)
        .where(eq(document.number, number))
        .limit(1);

      return { error: null, data: result?.[0] };
    } catch (error) {
      console.error("Failed to get document by number:", error);
      return { error: "Failed to retrieve document" };
    }
  },

  createDocument: async (data: CreateDocumentBody) => {
    try {
      const result = await db.insert(document).values(data).returning();

      return { error: null, data: result?.[0] };
    } catch (error) {
      console.error("Failed to create document:", error);

      if (error instanceof Error && error.message.includes("unique")) {
        return { error: "Document number already exists" };
      }

      return { error: "Failed to create document" };
    }
  },

  updateDocument: async (number: string, data: UpdateDocumentBody) => {
    try {
      const result = await db
        .update(document)
        .set(data)
        .where(eq(document.number, number))
        .returning();

      if (result.length === 0) {
        return { error: "Document not found" };
      }

      return { error: null, data: result?.[0] };
    } catch (error) {
      console.error("Failed to update document:", error);
      return { error: "Failed to update document" };
    }
  },

  deleteDocument: async (number: string) => {
    try {
      const result = await db
        .delete(document)
        .where(eq(document.number, number))
        .returning();

      if (result.length === 0) {
        return { error: "Document not found" };
      }

      return { error: null, data: result?.[0] };
    } catch (error) {
      console.error("Failed to delete document:", error);
      return { error: "Failed to delete document" };
    }
  },

  documentExists: async (number: string): Promise<boolean> => {
    try {
      const result = await db
        .select({ number: document.number })
        .from(document)
        .where(eq(document.number, number))
        .limit(1);

      return result.length > 0;
    } catch {
      return false;
    }
  },
};
