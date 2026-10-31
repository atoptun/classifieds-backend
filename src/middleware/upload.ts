import { NextFunction, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { BadRequestError } from "@/errors/http.error.ts";

const destination = resolve("tmp", "uploads");

const allowMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

await mkdir(destination, { recursive: true });

const storage = multer.diskStorage({
  destination,
  filename(_req, file, cb) {
    const prefix = `${Date.now()}_${Math.round(Math.random() * 10000)}`;
    const fileName = `${prefix}_${file.originalname}`;
    cb(null, fileName);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (!file.mimetype) {
    return cb(new BadRequestError("File corrupted"));
  }
  if (!allowMimeTypes.includes(file.mimetype)) {
    return cb(new BadRequestError("Only jpeg, png and webp allowed"));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits,
  fileFilter,
});

export const uploadSingle =
  (field: string) => (req: Request<{}>, res: Response, next: NextFunction) =>
    upload.single(field)(req as Request, res, next);
