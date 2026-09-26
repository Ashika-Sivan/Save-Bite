import { z } from "zod";

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i;
const fssaiRegex = /^[0-9]{14}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
const bankAccountRegex = /^[0-9]{9,18}$/;

const verificationObject = z.object({
  panNumber: z.string().toUpperCase().regex(panRegex, "Invalid PAN number format"),
  gstNumber: z.string().toUpperCase().regex(gstRegex, "Invalid GST number format"),
  fssaiNumber: z.string().regex(fssaiRegex, "Invalid FSSAI number format"),
  ifscCode: z.string().toUpperCase().regex(ifscRegex, "Invalid IFSC code format"),
  bankAccountNumber: z.string().regex(bankAccountRegex, "Invalid bank account number format"),
});

export const vendorVerificationSchema = z.object({
  body: z.object({
    verification: z.string().transform((val) => {
      try {
        return JSON.parse(val);
      } catch {
        throw new Error("Invalid JSON in verification");
      }
    }).pipe(verificationObject),
  })
});