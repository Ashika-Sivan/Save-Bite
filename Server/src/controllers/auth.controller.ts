import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/service/auth/IAuthService";
import { TokenPayload } from "../interfaces/service/auth/ITokenService";
import { StatusCode } from "../constants/statusCode";
import { AUTH_MESSAGES } from "../constants/messages";
import { env } from "../config/env";
import { Logger } from "../utils/logger";
import { AppError } from "../errors/AppError";
import { toUserResponseDTO } from "../mappers/user.mapper";
import { ResponseHelper } from "../utils/ResponseHelper";

type AuthRequest = Request & {
  user?: TokenPayload;
};

export class AuthController {
  constructor(private _authService: IAuthService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      Logger.info("Register controller hit");

      const user = await this._authService.register(req.body);
      const userData = toUserResponseDTO(user);

      ResponseHelper.success(
        res,
        StatusCode.CREATED,
        AUTH_MESSAGES.REGISTER_SUCCESS,
        { user: userData }
      );
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this._authService.resendOtp(req.body);

      ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.OTP_RESENT_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this._authService.verifyOtp(req.body);
      const userData = user ? toUserResponseDTO(user) : null;

      ResponseHelper.success(
        res,
        StatusCode.OK,
        AUTH_MESSAGES.OTP_VERIFIED_SUCCESS,
        { user: userData }
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } =
        await this._authService.login(req.body);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: env.REFRESH_COOKIE_MAX_AGE,
      });

      const userData = user ? toUserResponseDTO(user) : null;

      ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.LOGIN_SUCCESS, {
        user: userData,
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError(
          AUTH_MESSAGES.USER_NOT_AUTHENTICATED,
          StatusCode.UNAUTHORIZED
        );
      }

      const user = await this._authService.getMe(userId);

      ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.USER_FETCHED_SUCCESS, {
        user: user ? toUserResponseDTO(user) : null,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new AppError(
          AUTH_MESSAGES.REFRESH_TOKEN_MISSING,
          StatusCode.UNAUTHORIZED
        );
      }

      const { accessToken } = await this._authService.refreshToken(refreshToken);

      ResponseHelper.success(
        res,
        StatusCode.OK,
        AUTH_MESSAGES.ACCESS_TOKEN_REFRESHED,
        { accessToken }
      );
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this._authService.forgotPassword(req.body);

      ResponseHelper.success(res, StatusCode.OK, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this._authService.resetPassword(req.body);

      ResponseHelper.success(res, StatusCode.OK, result.message);
    } catch (error) {
      next(error);
    }
  }
}