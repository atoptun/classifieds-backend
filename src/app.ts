import express from "express";
import swaggerUi from "swagger-ui-express";
import authRouter from "@/routes/auth.routes.ts";
import notFound from "@/middleware/not-found.ts";
import errorHandler from "@/middleware/error-handler.ts";
import { generateOpenApiDocument } from "@/openapi.ts";

const app = express();

app.use(express.json());

const openApiDocument = generateOpenApiDocument();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/api/auth", authRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
