import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import env from "@/config/env.ts";
import logger from "@/logger.ts";
import { generateOpenApiDocument } from "@/openapi/index.ts";
import notFound from "@/middleware/not-found.ts";
import errorHandler from "@/middleware/error-handler.ts";
import authRouter from "@/routes/auth.routes.ts";
import routerAnnouncements from "@/routes/announcements.routers.ts";

const app = express();

app.use(pinoHttp({ logger }));

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Total-Count"],
    credentials: true,
    maxAge: 86400,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(express.json());

const openApiDocument = generateOpenApiDocument();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/auth", authRouter);
app.use("/announcements", routerAnnouncements);

app.use(notFound);
app.use(errorHandler);

export default app;
