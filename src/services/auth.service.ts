import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Prisma, PrismaClient } from "@db/client";
import {
  LoginBody,
  PublicUser,
  RegisterBody,
} from "@/validators/auth.validator.ts";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@/errors/http.error.ts";
import {
  ACCESS_TOKEN_LIFETIME,
  REFRESH_TOKEN_LIFETIME,
} from "@/constants/time.ts";
import env from "@/config/env.ts";

export const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  createdAt: true,
} as const satisfies Prisma.UserSelect;

export interface AccessTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private db: PrismaClient) {}

  findUserById = async (userId: number): Promise<PublicUser> => {
    const user = await this.db.user.findUnique({
      where: {
        id: userId,
      },
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  };

  register = async (params: RegisterBody): Promise<PublicUser> => {
    const { email, name, password, username } = params;

    const existUser = await this.db.user.findFirst({
      select: { id: true },
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existUser) {
      throw new ConflictError("Username or email already taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
      },
      select: publicUserSelect,
    });

    return user;
  };

  login = async (params: LoginBody): Promise<PublicUser> => {
    const { username, password } = params;

    const user = await this.db.user.findUnique({
      where: { username },
      // select: publicUserSelect,
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const { password: safePassword, ...safeUser } = user;

    return safeUser;
  };

  refreshTokens = async (refreshToken?: string): Promise<AccessTokens> => {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token not provided");
    }

    const storedToken = await this.db.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (new Date() > storedToken.expiresAt) {
      await this.db.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedError("Refresh token expired");
    }

    await this.db.refreshToken.delete({
      where: { id: storedToken.id },
    });

    const tokens = await this.createTokens(storedToken.userId);

    return tokens;
  };

  logout = async (refreshToken?: string): Promise<void> => {
    if (refreshToken) {
      await this.db.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }
  };

  createTokens = async (userId: number): Promise<AccessTokens> => {
    const accessToken = jwt.sign({ sub: String(userId) }, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_LIFETIME / 1000,
    });

    const refreshToken = crypto.randomBytes(40).toString("hex");

    await this.db.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME),
      },
    });

    return { accessToken, refreshToken };
  };
}
