import { OAuth2Client } from "google-auth-library";
import { IAuthService } from "../../interfaces/service/auth/IAuthService";
import { IUserRepository } from "../../interfaces/repository/IUserRepository";
import { IUser } from "../../models/user/user.model";
import { ITokenService } from "../../interfaces/service/auth/ITokenService";
import { IOtpService } from "../../interfaces/service/auth/IOtpService";
import { AUTH_MESSAGES } from "../../constants/messages";
import { StatusCode } from "../../constants/statusCode";
import { AppError } from "../../errors/AppError";
import {
  IRegisterRequestDTO,
  ILoginRequestDTO,
  IVerifyOtpRequestDTO,
  IResendOtpRequestDTO,
  IForgotPasswordRequestDTO,
  IResetPasswordRequestDTO,
  ILoginServiceResult,
} from "../../dtos/auth.dto";
import { IPasswordHasher } from "../../interfaces/service/auth/IPasswordHasher";
import { IPasswordResetTokenService } from "../../interfaces/service/auth/IPasswordResetTokenService";
import { IEmailService } from "../../interfaces/service/auth/IEmailService";
import { Logger } from "../../utils/logger";

export class AuthService implements IAuthService {
  constructor(
    private _userRepository: IUserRepository,
    private _otpService: IOtpService,
    private _tokenService: ITokenService,
    private _passwordHasher: IPasswordHasher,
    private _resetTokenService: IPasswordResetTokenService,
    private _emailService: IEmailService
  ) {}

  async register(data: IRegisterRequestDTO): Promise<IUser> {
    const { name, email, password, phone } = data;

    const existingUser = await this._userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        AUTH_MESSAGES.EMAIL_ALREADY_EXISTS,
        StatusCode.CONFILCT
      );
    }

    const hashedPassword = await this._passwordHasher.hash(password);

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

  async resendOtp(data: IResendOtpRequestDTO): Promise<boolean> {
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

  async verifyOtp(data: IVerifyOtpRequestDTO): Promise<IUser | null> {
    const { email } = data;

    await this._otpService.verifyOtp(data);

    const user = await this._userRepository.updateAuthenticationStatus(
      email,
      true
    );

    return user;
  }
  

  async login(data: ILoginRequestDTO): Promise<ILoginServiceResult> {
    const { email, password } = data;

    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      Logger.error(`[LOGIN FAIL] No user found with email: "${email}"`);
      throw new AppError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        StatusCode.BAD_REQUEST
      );
    }

    if (!user.isAuthenticated) {
      Logger.error(`[LOGIN FAIL] User "${email}" is not authenticated (isAuthenticated: false)`);
      throw new AppError(
        AUTH_MESSAGES.VERIFY_EMAIL_FIRST,
        StatusCode.UNAUTHORIZED
      );
    }

    if (!user.password) {
      Logger.error(`[LOGIN FAIL] User "${email}" has no password (Google Auth)`);
      throw new AppError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        StatusCode.BAD_REQUEST
      );
    }

    const passwordMatch = await this._passwordHasher.compare(
      password,
      user.password
    );


    if (!passwordMatch) {
      Logger.error(`[LOGIN FAIL] Password mismatch for email: "${email}"`);
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

  async googleLogin(idToken: string): Promise<ILoginServiceResult> {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new AppError("Invalid Google token payload", StatusCode.BAD_REQUEST);
      }

      const { email, name, sub: googleId } = payload;
      let user = await this._userRepository.findByEmail(email);

      if (!user) {
        user = await this._userRepository.create({
          name: name || "Google User",
          email,
          authProvider: "google",
          isAuthenticated: true,
        });
      }

      if (!user.isActive) {
        throw new AppError(AUTH_MESSAGES.ACCESS_DENIED, StatusCode.FORBIDDEN);
      }

      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = this._tokenService.generateAccessToken(tokenPayload);
      const refreshToken = this._tokenService.generateRefreshToken(tokenPayload);

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      Logger.error("Google Auth Error:", error);
      throw new AppError("Google Authentication Failed", StatusCode.UNAUTHORIZED);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = await this._tokenService.verifyRefreshToken(refreshToken);

    const user = await this._userRepository.findById(payload.userId);
    if (!user) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, StatusCode.NOT_FOUND);
    }

    const accessToken = this._tokenService.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
    };
  }

  async getMe(userId: string): Promise<IUser | null> {
    return await this._userRepository.findById(userId);
  }

  async forgotPassword( data: IForgotPasswordRequestDTO): Promise<{ message: string }> {
   
    const { email } = data;

    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, StatusCode.NOT_FOUND);
    }

    const resetToken = await this._resetTokenService.generateAndStore(
      user._id.toString()
    );



    await this._emailService.sendResetPasswordEmail(user.email, resetToken);

    return {
      message: AUTH_MESSAGES.RESET_LINK_SENT,
    };
  }

  async resetPassword( data: IResetPasswordRequestDTO): Promise<{ message: string }> {
    const { token, newPassword } = data;

    const userId = await this._resetTokenService.resolve(token);

    if (!userId) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_RESET_TOKEN,
        StatusCode.BAD_REQUEST
      );
    }

    const hashedPassword = await this._passwordHasher.hash(newPassword);

    await this._userRepository.updateById(userId, {
      password: hashedPassword,
    });

    await this._resetTokenService.invalidate(token);

    return {
      message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
    };
  }
}