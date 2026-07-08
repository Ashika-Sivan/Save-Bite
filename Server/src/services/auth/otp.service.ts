import { AUTH_MESSAGES } from "../../constants/messages";
import { StatusCode } from "../../constants/statusCode";
import { VerifyOtpRequestDTO } from "../../dtos/auth.dto";
import { AppError } from "../../errors/AppError";
import { IOtpService } from "../../interfaces/service/IOtpService";
import OtpRepository from "../../repositories/user/otp.repository";
import { generateOtp } from "../../utils/generateOtp";
import EmailServce from "./email.service";

class OtpService implements IOtpService {
  constructor(
    private _otpRepository: OtpRepository,
    private _emailService: EmailServce
  ) {}

  async createOtp(email: string): Promise<boolean> {
    const otp = generateOtp();

    await this._otpRepository.storeOtp(email, otp);
    await this._emailService.sendOtpEmail(email, otp);

    return true;
  }

  async verifyOtp(data: VerifyOtpRequestDTO): Promise<boolean> {
    const { email, otp } = data;

    const storedOtp = await this._otpRepository.getOtp(email);

    if (!storedOtp) {
      throw new AppError(
        `${AUTH_MESSAGES.OTP_EXPIRED} or ${AUTH_MESSAGES.OTP_NOT_FOUND}`,
        StatusCode.BAD_REQUEST
      );
    }

    if (storedOtp !== otp) {
      throw new AppError(
        AUTH_MESSAGES.INVALID_OTP,
        StatusCode.BAD_REQUEST
      );
    }

    await this._otpRepository.deleteOtp(email);

    return true;
  }
}

export default OtpService;