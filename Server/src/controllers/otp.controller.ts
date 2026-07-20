import { Request, Response, NextFunction } from "express";
import OtpService from "../services/auth/otp.service";
import { StatusCode } from "../constants/statusCode";
import { AUTH_MESSAGES } from "../constants/messages";

class OtpController {
  constructor(private _otpService: OtpService) {}

  sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      await this._otpService.createOtp(email);

      return res.status(StatusCode.OK).json({
        success: true,
        message: AUTH_MESSAGES.OTP_GENERATED_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const { email, otp } = req.body;

      const result = await this._otpService.verifyOtp(req.body);

      return res.status(StatusCode.OK).json({
        success: result,
        message: AUTH_MESSAGES.OTP_VERIFIED_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default OtpController;