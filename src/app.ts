import express from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocument } from "./openapi/index.ts";
import notFound from "@/middleware/not-found.ts";
import errorHandler from "@/middleware/error-handler.ts";
import authRouter from "@/routes/auth.routes.ts";

const app = express();

app.use(express.json());

const openApiDocument = generateOpenApiDocument();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/auth", authRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
