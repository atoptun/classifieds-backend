import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "@/errors/http.error.ts";
import env from "@/config/env.ts";

declare module "express-serve-static-core" {
  interface Request {
    user?: jwt.JwtPayload;
  }
}

const authenticate = (
  req: Request<{}, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedError("Authentication required");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded as jwt.JwtPayload;
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
};

export default authenticate;
