import { transporter } from "../config/mailer";

export const sendResetPasswordEmail=async(
    email:string,
    token:string
)=>{
    const resetLink=`http://localhost:5173/reset-password?token=${token}`
    await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:email,
        subject:"Reset Your Password",
        html:`
        <h2>Reset Password</h2>
        <p>Click the link below to reset your password.</p>

      <a href="${resetLink}">
        Reset Password
      </a>

      <p>This link expires in 15 minutes.</p>
    
        `,
    })
}