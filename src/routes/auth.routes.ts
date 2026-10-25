import { Router } from "express";
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

const router = Router();

router.post("/register", validateBody(RegisterSchema), authContoller.register);
router.post("/login", validateBody(LoginSchema), authContoller.login);
router.post(
  "/refresh",
  validateBody(RefreshTokenSchema),
  authContoller.refresh,
);
router.post("/logout", validateBody(RefreshTokenSchema), authContoller.logout);
router.get("/me", authenticate, authContoller.me);

export default router;
