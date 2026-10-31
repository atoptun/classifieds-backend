import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "@/controllers/auth.controller.ts";
import { validateBody } from "@/middleware/validate.ts";
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
} from "@/validators/auth.validator.ts";
import { AuthService } from "@/services/auth.service.ts";
import prisma from "@/db/prisma.ts";
import authenticate from "@/middleware/authenticate.ts";

const authService = new AuthService(prisma);
const authContoller = new AuthController(authService);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const router = Router();

router.use(limiter);

router.post("/register", validateBody(RegisterSchema), authContoller.register);
router.post("/login", validateBody(LoginSchema), authContoller.login);
router.post(
  "/refresh",
  validateBody(RefreshTokenSchema),
  authContoller.refresh,
);
router.post("/logout", authenticate, authContoller.logout);
router.get("/me", authenticate, authContoller.me);

export default router;
