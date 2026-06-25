import { transporter } from "../config/mailer";

class EmailServce{
    async sendOtpEmail(email:string,otp:string){
        try {
            const info = await transporter.sendMail({
                from:process.env.EMAIL_USER,
                to:email,
                subject:"SaveBite OTP Verification",
                html:`
                <h2>SaveBite Email Verification</h2>
                <p>Your OTP is :</p>
                <h1>${otp}</h1>
                <p>This OTP will expire in 5 minutes</p>
                `
            })
            console.log('OTP email sent successfully')
        } catch(error:any) {
            console.error(`[Email Error] Failed to send OTP email to ${email}:`, error.message)
            throw error
        }
    }
}

export default EmailServce