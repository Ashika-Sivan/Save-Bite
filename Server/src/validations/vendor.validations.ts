import { StatusCode } from "../constants/statusCode";
import { IVerificationDTO } from "../dtos/vendor.dto";
import { AppError } from "../errors/AppError";

export const validateVendorVertification=(
    verification:IVerificationDTO
):void=>{
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  
  const gstRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;


  const fssaiRegex = /^[0-9]{14}$/;


  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;


  const bankAccountRegex = /^[0-9]{9,18}$/;

  if (!panRegex.test(verification.panNumber.toUpperCase())) {
    throw new AppError(
      "Invalid PAN number format",
      StatusCode.BAD_REQUEST
    );
  }

  if (!gstRegex.test(verification.gstNumber.toUpperCase())) {
    throw new AppError(
      "Invalid GST number format",
      StatusCode.BAD_REQUEST
    );
  }

  if (!fssaiRegex.test(verification.fssaiNumber)) {
    throw new AppError(
      "Invalid FSSAI number format",
      StatusCode.BAD_REQUEST
    );
  }

  if (!ifscRegex.test(verification.ifscCode.toUpperCase())) {
    throw new AppError(
      "Invalid IFSC code format",
      StatusCode.BAD_REQUEST
    );
  }

  if (!bankAccountRegex.test(verification.bankAccountNumber)) {
    throw new AppError(
      "Invalid bank account number format",
      StatusCode.BAD_REQUEST
    );
  }
};
    
//ndata validation