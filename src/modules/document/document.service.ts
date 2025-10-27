import { CreateDocumentBody, UpdateDocumentBody } from "./document.model";
import { DocumentRepository } from "./document.repository";
import {
  uploadFile,
  deleteFile,
  DOCUMENT_UPLOAD_CONFIG,
} from "../../utils/file-upload";

type CreateDocumentWithFileBody = {
  number: string;
  title: string;
  availability: string;
  project: string;
  discipline: string;
  wp: string;
  lookup: string;
  file: File;
};

type UpdateDocumentWithFileBody = {
  title?: string;
  availability?: string;
  project?: string;
  discipline?: string;
  wp?: string;
  lookup?: string;
  file?: File;
};

export const DocumentService = {
  getAllDocuments: async (params: { page?: string; limit?: string }) => {
    try {
      const { data, error } = await DocumentRepository.getAllDocuments(params);

      if (error) {
        return {
          error,
          statusCode: 500,
        };
      }

      return {
        data,
        statusCode: 200,
      };
    } catch {
      return {
        error: "An unexpected error occurred while fetching documents",
        statusCode: 500,
      };
    }
  },

  getDocumentByNumber: async (number: string) => {
    try {
      const { data, error } =
        await DocumentRepository.getDocumentByNumber(number);

      if (error) {
        return {
          error,
          statusCode: 500,
        };
      }

      if (!data) {
        return {
          error: "Document not found",
          statusCode: 404,
        };
      }

      return {
        data,
        statusCode: 200,
      };
    } catch {
      return {
        error: "An unexpected error occurred while fetching document",
        statusCode: 500,
      };
    }
  },

  createDocument: async (body: CreateDocumentBody) => {
    try {
      const exists = await DocumentRepository.documentExists(body.number);
      if (exists) {
        return {
          error: "Document with this number already exists",
          statusCode: 409,
        };
      }

      const { data, error } = await DocumentRepository.createDocument(body);

      if (error) {
        return {
          error,
          statusCode: 500,
        };
      }

      return {
        data,
        statusCode: 201,
      };
    } catch {
      return {
        error: "An unexpected error occurred while creating document",
        statusCode: 500,
      };
    }
  },

  createDocumentWithFile: async (body: CreateDocumentWithFileBody) => {
    try {
      const exists = await DocumentRepository.documentExists(body.number);
      if (exists) {
        return {
          error: "Document with this number already exists",
          statusCode: 409,
        };
      }

      const uploadResult = await uploadFile(body.file, DOCUMENT_UPLOAD_CONFIG);

      if (!uploadResult.success) {
        return {
          error: uploadResult.error || "Failed to upload file",
          statusCode: 400,
        };
      }

      const documentData: CreateDocumentBody = {
        number: body.number,
        title: body.title,
        availability: body.availability === "true",
        file_path: uploadResult.filePath!,
        project: body.project,
        discipline: body.discipline,
        wp: body.wp,
        lookup: body.lookup,
      };

      const { data, error } =
        await DocumentRepository.createDocument(documentData);

      if (error) {
        await deleteFile(uploadResult.filePath!);
        return {
          error,
          statusCode: 500,
        };
      }

      return {
        data,
        statusCode: 201,
      };
    } catch {
      return {
        error: "An unexpected error occurred while creating document",
        statusCode: 500,
      };
    }
  },

  updateDocument: async (number: string, body: UpdateDocumentBody) => {
    try {
      if (Object.keys(body).length === 0) {
        return {
          error: "No fields to update",
          statusCode: 400,
        };
      }

      const { data, error } = await DocumentRepository.updateDocument(
        number,
        body,
      );

      if (error === "Document not found") {
        return {
          error,
          statusCode: 404,
        };
      }

      if (error) {
        return {
          error,
          statusCode: 500,
        };
      }

      return {
        data,
        statusCode: 200,
      };
    } catch {
      return {
        error: "An unexpected error occurred while updating document",
        statusCode: 500,
      };
    }
  },

  updateDocumentWithFile: async (
    number: string,
    body: UpdateDocumentWithFileBody,
  ) => {
    try {
      const { data: existingDoc, error: getError } =
        await DocumentRepository.getDocumentByNumber(number);

      if (getError || !existingDoc) {
        return {
          error: "Document not found",
          statusCode: 404,
        };
      }

      let filePath = existingDoc.file_path;

      if (body.file) {
        const uploadResult = await uploadFile(
          body.file,
          DOCUMENT_UPLOAD_CONFIG,
        );

        if (!uploadResult.success) {
          return {
            error: uploadResult.error || "Failed to upload file",
            statusCode: 400,
          };
        }

        await deleteFile(existingDoc.file_path);
        filePath = uploadResult.filePath!;
      }

      const updateData: UpdateDocumentBody = {
        ...(body.title && { title: body.title }),
        ...(body.availability && {
          availability: body.availability === "true",
        }),
        ...(body.project && { project: body.project }),
        ...(body.discipline && { discipline: body.discipline }),
        ...(body.wp && { wp: body.wp }),
        ...(body.lookup && { lookup: body.lookup }),
        ...(body.file && { file_path: filePath }),
      };

      if (Object.keys(updateData).length === 0) {
        return {
          error: "No fields to update",
          statusCode: 400,
        };
      }

      const { data, error } = await DocumentRepository.updateDocument(
        number,
        updateData,
      );

      if (error) {
        if (body.file && filePath !== existingDoc.file_path) {
          await deleteFile(filePath);
        }
        return {
          error,
          statusCode: 500,
        };
      }

      return {
        data,
        statusCode: 200,
      };
    } catch {
      return {
        error: "An unexpected error occurred while updating document",
        statusCode: 500,
      };
    }
  },

  deleteDocument: async (number: string) => {
    try {
      const { data: doc, error: getError } =
        await DocumentRepository.getDocumentByNumber(number);

      if (getError || !doc) {
        return {
          error: "Document not found",
          statusCode: 404,
        };
      }

      const { error } = await DocumentRepository.deleteDocument(number);

      if (error) {
        return {
          error,
          statusCode: 500,
        };
      }

      await deleteFile(doc.file_path);

      return {
        data: { message: "Document deleted successfully" },
        statusCode: 200,
      };
    } catch {
      return {
        error: "An unexpected error occurred while deleting document",
        statusCode: 500,
      };
    }
  },
};
