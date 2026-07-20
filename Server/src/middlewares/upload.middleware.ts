import multer from "multer";

const storage=multer.memoryStorage();
export const upload=multer({
    storage,
    limits:{
        fileSize:5*1024*1024
    }
})
//storing the uploaded file in the memory
//recieveing the file from the frontend =>after the req is complete data is released from tge memory (req.file.buffer)=>save the image data in the s3 bucket
