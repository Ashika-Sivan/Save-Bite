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
import {
  IRegisterRequestDTO,
  ILoginRequestDTO,
  IVerifyOtpRequestDTO,
  IResendOtpRequestDTO,
  IForgotPasswordRequestDTO,
  IResetPasswordRequestDTO,
  IUpdatePasswordRequestDTO
} from "../dtos/auth.dto";
import { catchAsync } from "../utils/catchAsync";

type AuthRequest = Request & {
  user?: TokenPayload;
};

export class AuthController {
  constructor(private _authService: IAuthService) { }

  register = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    Logger.info("Register controller hit");
    const data: IRegisterRequestDTO = req.body;
    const user = await this._authService.register(data);
    const userData = toUserResponseDTO(user);
    ResponseHelper.success(
      res,
      StatusCode.CREATED,
      AUTH_MESSAGES.REGISTER_SUCCESS,
      { user: userData }
    );
  });
  resendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data: IResendOtpRequestDTO = req.body;
    await this._authService.resendOtp(data);
    ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.OTP_RESENT_SUCCESS);
  });
  verifyOtp = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data: IVerifyOtpRequestDTO = req.body;
    const { user, accessToken, refreshToken } = await this._authService.verifyOtp(data);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: env.REFRESH_COOKIE_MAX_AGE,
      path: '/'
    });
    const userData = user ? toUserResponseDTO(user) : null;
    ResponseHelper.success(
      res,
      StatusCode.OK,
      AUTH_MESSAGES.OTP_VERIFIED_SUCCESS,
      { user: userData, accessToken }
    );
  });
  login = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data: ILoginRequestDTO = req.body;
    const { user, accessToken, refreshToken } = await this._authService.login(data);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: env.REFRESH_COOKIE_MAX_AGE,
      path: '/'
    });
    const userData = user ? toUserResponseDTO(user) : null;
    ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.LOGIN_SUCCESS, {
      user: userData,
      accessToken,
    });
  });
  googleLogin = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { idToken } = req.body;
    if (!idToken) {
      throw new AppError(AUTH_MESSAGES.TOKEN_MISSING, StatusCode.BAD_REQUEST);
    }
    const { user, accessToken, refreshToken } =
      await this._authService.googleLogin(idToken);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: env.REFRESH_COOKIE_MAX_AGE,
      path: '/'
    });
    const userData = user ? toUserResponseDTO(user) : null;
    ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.LOGIN_SUCCESS, {
      user: userData,
      accessToken,
    });
  });
  logout = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.LOGOUT_SUCCESS);
  });
  getMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
  });
  refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;
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
  });
  forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data: IForgotPasswordRequestDTO = req.body;
    const result = await this._authService.forgotPassword(data);
    ResponseHelper.success(res, StatusCode.OK, result.message);
  });
  resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data: IResetPasswordRequestDTO = req.body;
    const result = await this._authService.resetPassword(data);
    ResponseHelper.success(res, StatusCode.OK, result.message);
  });
  updatePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_AUTHENTICATED, StatusCode.UNAUTHORIZED);
    }
    const data: IUpdatePasswordRequestDTO = {
      userId: req.user.userId,
      ...req.body
    };
    const result = await this._authService.updatePassword(data);
    ResponseHelper.success(res, StatusCode.OK, result.message);
  });
}