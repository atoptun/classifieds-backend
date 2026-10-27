import type { Request, Response } from "express";
import { AuthService } from "@/services/auth.service.ts";
import type {
  RegisterBody,
  LoginBody,
  RefreshTokenBody,
} from "@/validators/auth.validator.ts";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const user = await this.authService.register(req.body);
    const { accessToken, refreshToken } = await this.authService.createTokens(
      user.id,
    );

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  };

  login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const user = await this.authService.login(req.body);
    const { accessToken, refreshToken } = await this.authService.createTokens(
      user.id,
    );

    res.status(200).json({
      user,
      accessToken,
      refreshToken,
    });
  };

  refresh = async (req: Request<{}, {}, RefreshTokenBody>, res: Response) => {
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      req.body.refreshToken,
    );

    return res.status(200).json({
      accessToken,
      refreshToken,
    });
  };

  logout = async (req: Request, res: Response) => {
    await this.authService.logout(Number(req.user!.sub));

    res.status(204).end();
  };

  me = async (req: Request, res: Response) => {
    const user = await this.authService.findUserById(Number(req.user!.sub));

    res.status(200).json(user);
  };
}
