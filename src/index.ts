import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { logger } from "./lib/logger";
import swagger from "@elysiajs/swagger";

const app = new Elysia();

app.use(cors());
app.use(logger());
app.use(
  swagger({
    documentation: {
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  }),
);

app.onError(({ code, error, set, request }) => {
  if (!set.status) set.status = 500;
  switch (code) {
    case "VALIDATION": {
      set.status = 400;
      const cause = Array.isArray(error.cause) ? error.cause : [];
      const fieldsMessage = cause
        .map((e) => `${e.path?.join(".")}: ${e.message}`)
        .join(", ");

      return {
        success: false,
        error: fieldsMessage
          ? `Validation failed: ${fieldsMessage}`
          : "Validation failed",
      };
    }

    case "PARSE": {
      set.status = 400;
      return {
        success: false,
        error: "Invalid JSON format in request body",
      };
    }

    case "NOT_FOUND": {
      set.status = 404;
      return {
        success: false,
        error: `Route ${request.method} ${request.url} not found`,
      };
    }

    case "INTERNAL_SERVER_ERROR": {
      set.status = 500;
      return {
        success: false,
        error: "Internal server error occurred",
      };
    }

    default: {
      const errorMessage =
        error instanceof Error ? error.message : "Unexpected error occurred";

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
});

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log("🦊 Swagger UI available at http://localhost:3000/swagger");
