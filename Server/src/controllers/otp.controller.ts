import { Request, Response, NextFunction } from "express";
import { StatusCode } from "../constants/statusCode";
import { AUTH_MESSAGES } from "../constants/messages";
import { ResponseHelper } from "../utils/ResponseHelper";
import { IOtpService } from "../interfaces/service/auth/IOtpService";
import { catchAsync } from "../utils/catchAsync";

class OtpController {
  constructor(private _otpService: IOtpService) { }

  sendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;
    await this._otpService.createOtp(email);
    ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.OTP_GENERATED_SUCCESS);
  });

  verifyOtp = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this._otpService.verifyOtp(req.body);
    ResponseHelper.success(res, StatusCode.OK, AUTH_MESSAGES.OTP_VERIFIED_SUCCESS);
  });
}

export default OtpController;