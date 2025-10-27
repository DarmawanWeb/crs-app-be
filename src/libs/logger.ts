import logixlysia from "logixlysia";

export const logger = () =>
  logixlysia({
    config: {
      showStartupMessage: false,
      logFilePath: "./logs/app.log",
      logRotation: {
        maxSize: "10m",
        maxFiles: "7d",
        compress: true,
      },
      ip: true,
      timestamp: {
        translateTime: "dd-mm-yyyy HH:MM:ss",
      },
      pino: {
        level: "error",
        prettyPrint: true,
        redact: ["password", "token"],
      },
    },
  });
