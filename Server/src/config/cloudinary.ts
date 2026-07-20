import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv"

dotenv.config()//load value from doten

cloudinary.config({//use this account when the image upload
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

export default cloudinary

//connecting our app with cloudinary account