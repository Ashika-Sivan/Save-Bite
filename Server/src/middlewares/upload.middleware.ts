
//storing the uploaded file in the memory
//recieveing the file from the frontend =>after the req is complete data is released from tge memory (req.file.buffer)=>save the image data in the s3 bucket

import multer from "multer";
import { AppError } from "../errors/AppError";
import { StatusCode } from "../constants/statusCode";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = ( 
  req,
  file,
  cb
) => {
  const imageTypes = [
    "image/jpeg",
    "image/png",
  ];

  const documentTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
  ];

  // Business image → only image
  if (file.fieldname === "businessImage") {
    if (!imageTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          "Business image must be JPG or PNG",
          StatusCode.BAD_REQUEST
        )
      );
    }
  }

  //certi to pdf or image
  else {
    if (!documentTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          "Documents must be JPG, PNG or PDF",
          StatusCode.BAD_REQUEST
        )
      );
    }
  }

  cb(null, true);
};

export const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },

  fileFilter, 
});