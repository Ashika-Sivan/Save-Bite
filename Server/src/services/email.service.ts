import { transporter } from "../config/mailer";

class EmailServce{
    async sendOtpEmail(email:string,otp:string){
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to:email,
            subject:"SaveBite OTP Verification",
            html:`
            <h2>SaveBite Email Verfifcation</h2>
            <p>Your OTP is :</p>
            <h1>${otp}</h1>
            <p>This OTP will expire in 5 minutes</p>
            `
        })
    }
}

export default EmailServce