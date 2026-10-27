import { HttpError } from "@/errors/http.error.ts";
import { NextFunction, Request, Response } from "express";

const errorHandler = (
  err: Error & { type?: string; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Validation failed",
      details: {
        body: ["Invalid JSON format in request body"],
      },
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Prisma errors
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ error: "Unique constraint violation" });
  }

  if (err.code === "P2003") {
    return res.status(400).json({ error: "Foreign key constraint failed" });
  }

  // Unhandled errors
  res.status(500).json({ error: "Internal server error" });
};

export default errorHandler;
