import { iAuthService } from "../../interfaces/service/IAuthService";
import { IUserRepository } from "../../interfaces/repository/IUserRepository";
import { IUser } from "../../models/user/user.model";
import bcrypt from "bcrypt";
import { ITokenService } from "../../interfaces/service/ITokenService";
import { IOtpService } from "../../interfaces/service/IOtpService";
import crypto from "crypto";
import { redisClient } from "../../config/redis";
import { sendResetPasswordEmail } from "../../utils/email.util";
import { AUTH_MESSAGES } from "../../constants/messages";
import { StatusCode } from "../../constants/statusCode";
import { AppError } from "../../errors/AppError";
import {
  RegisterRequestDTO,
  LoginRequestDTO,
  VerifyOtpRequestDTO,
  ResendOtpRequestDTO,
  ForgotPasswordRequestDTO,
  ResetPasswordRequestDTO,
} from "../../dtos/auth.dto";
import { env } from "../../config/env";

export class AuthService implements iAuthService {
  constructor(
    private _userRepository: IUserRepository,
    private _otpService: IOtpService,
    private _tokenService: ITokenService
  ) {}

  async register(data: RegisterRequestDTO): Promise<IUser> {
    const { name, email, password, phone } = data;

    const existingUser = await this._userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        AUTH_MESSAGES.EMAIL_ALREADY_EXISTS,
        StatusCode.CONFILCT
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      env.BCRYPT_SALT_ROUNDS
    );

    const user = await this._userRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      isAuthenticated: false,
    });

    await this._otpService.createOtp(email);

    return user;
  }

  async resendOtp(data: ResendOtpRequestDTO): Promise<boolean> {
    const { email } = data;

    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, StatusCode.NOT_FOUND);
    }

    if (user.isAuthenticated) {
      throw new AppError(
        AUTH_MESSAGES.USER_ALREADY_VERIFIED,
        StatusCode.BAD_REQUEST
      );
    }

    await this._otpService.createOtp(email);

    return true;
  }

  async verifyOtp(data: VerifyOtpRequestDTO): Promise<IUser | null> {
    const { email } = data;

    await this._otpService.verifyOtp(data);

    const user = await this._userRepository.updateAuthenticationStatus(
      email,
      true
    );

    return user;
  }

  async login(data: LoginRequestDTO): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = data;

    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        StatusCode.BAD_REQUEST
      );
    }

    if (!user.isAuthenticated) {
      throw new AppError(
        AUTH_MESSAGES.VERIFY_EMAIL_FIRST,
        StatusCode.UNAUTHORIZED
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        StatusCode.BAD_REQUEST
      );
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this._tokenService.generateAccessToken(payload);
    const refreshToken = this._tokenService.generateRefreshToken(payload);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = await this._tokenService.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenService.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return {
      accessToken,
    };
  }

  async getMe(userId: string): Promise<IUser | null> {
    return await this._userRepository.findById(userId);
  }

  async forgotPassword(
    data: ForgotPasswordRequestDTO
  ): Promise<{ message: string }> {
    const { email } = data;

    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, StatusCode.NOT_FOUND);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await redisClient.getClient().set(
      `password_reset:${resetToken}`,
      user._id.toString(),
      {
        EX: env.PASSWORD_RESET_EXPIRY,
      }
    );

    await sendResetPasswordEmail(user.email, resetToken);

    return {
      message: AUTH_MESSAGES.RESET_LINK_SENT,
    };
  }

  async resetPassword(
    data: ResetPasswordRequestDTO
  ): Promise<{ message: string }> {
    const { token, newPassword } = data;

    const userId = await redisClient
      .getClient()
      .get(`password_reset:${token}`);

    if (!userId) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_RESET_TOKEN,
        StatusCode.BAD_REQUEST
      );
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      env.BCRYPT_SALT_ROUNDS
    );

    await this._userRepository.updateById(userId, {
      password: hashedPassword,
    });

    await redisClient.getClient().del(`password_reset:${token}`);

    return {
      message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
    };
  }
}