import pino, { type TransportTargetOptions } from "pino";
import env from "@/config/env.ts";

const devTargets: TransportTargetOptions[] = [
  // Console
  {
    target: "pino-pretty",
    level: "debug",
    options: {
      colorize: true,
    },
  },
  // File
  {
    target: "pino/file",
    level: "debug",
    options: {
      destination: "./logs/app.log",
      mkdir: true,
    },
  },
];

const logger = pino({
  level: env.IS_DEV ? "debug" : "info",
  transport: env.IS_DEV
    ? {
        targets: devTargets,
      }
    : undefined,
});

export default logger;
