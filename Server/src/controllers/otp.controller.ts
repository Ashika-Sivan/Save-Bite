import { Request, Response, NextFunction } from "express";
import { StatusCode } from "../constants/statusCode";
import { AUTH_MESSAGES } from "../constants/messages";
import { ResponseHelper } from "../utils/ResponseHelper";
import { IOtpService } from "../interfaces/service/auth/IOtpService";

class OtpController {
  constructor(private _otpService: IOtpService) {}

  sendOtp = async ( req: Request, res: Response,next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      await this._otpService.createOtp(email);

      ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.OTP_GENERATED_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async ( req: Request, res: Response,next: NextFunction ): Promise<void> => {
    try {
      await this._otpService.verifyOtp(req.body);

      ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.OTP_VERIFIED_SUCCESS);
    } catch (error) {
      next(error);
    }
  };
}

export default OtpController;