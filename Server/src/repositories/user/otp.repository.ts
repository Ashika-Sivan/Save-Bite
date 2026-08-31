import { RedisClientType } from "@redis/client";
export const OTP_EXPIRY_SECONDS = Number(process.env.OTP_EXPIRY_SECONDS);
//get otp
//save otp
//delete otp
//heppen otp related database operations

//first we need to get the type in a redis so we imported redisClientType and make it private.only used inn the class.and if use in the entire class we passed the redisClient to constructor.now we get the get,set,delete

class OtpRepository{
    private _redisClient:RedisClientType;//importing the type of redisclient from redis library so that is redisclientType:-set,get,del


    constructor(redisClient:RedisClientType){//when create the class we pass a redis client.it get stored in the class
        this._redisClient=redisClient
    }
    async storeOtp(email:string,otp:string){//set
        await this._redisClient.set(`otp:${email}`,otp,{//storing the data in a key value pair
             EX:OTP_EXPIRY_SECONDS //5 minutes.after 5 min redis automatically remove otp
        })
    }
    async getOtp(email:string){
        return await this._redisClient.get(`otp:${email}`)
    }

    async deleteOtp(email:string){
        await this._redisClient.del(`otp:${email}`)
    }
}
export default OtpRepository
