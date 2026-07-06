import { transporter } from '../../config/mailer'

class EmailService {
  async sendOtpEmail(email: string, otp: string) {
    try {
      await transporter.sendMail({
        from: `"SaveBite" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your SaveBite verification code",
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>SaveBite OTP</title>
          </head>
          <body style="margin:0;padding:0;background-color:#f4f7f2;font-family:'Helvetica Neue',Arial,sans-serif;color:#1f2d24;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7f2;padding:40px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(34,84,52,0.08);border:1px solid #e6ede6;">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#2f7d4f 0%,#4ea96b 100%);padding:28px 32px;text-align:left;">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background:rgba(255,255,255,0.18);width:42px;height:42px;border-radius:50%;text-align:center;vertical-align:middle;font-size:22px;">🌿</td>
                            <td style="padding-left:12px;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;font-family:Georgia,'Times New Roman',serif;">
                              SaveBite
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:36px 32px 8px 32px;">
                        <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#4ea96b;font-weight:600;">
                          Email verification
                        </p>
                        <h1 style="margin:0 0 12px 0;font-size:26px;line-height:1.3;color:#1f2d24;font-family:Georgia,'Times New Roman',serif;font-weight:600;">
                          Confirm it's you
                        </h1>
                        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#5b6b60;">
                          Use the code below to verify your email and start saving great food near you.
                        </p>

                        <!-- OTP box -->
                        <div style="background:#f1f8f3;border:1px dashed #b6d7bf;border-radius:14px;padding:22px;text-align:center;margin:8px 0 28px 0;">
                          <div style="font-size:34px;font-weight:700;letter-spacing:10px;color:#2f7d4f;font-family:'Courier New',monospace;">
                            ${otp}
                          </div>
                          <div style="margin-top:8px;font-size:12px;color:#7a8a7f;">
                            Expires in 5 minutes
                          </div>
                        </div>

                        <p style="margin:0 0 6px 0;font-size:13px;color:#7a8a7f;line-height:1.6;">
                          Didn't request this? You can safely ignore this email — no changes will be made to your account.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:24px 32px 28px 32px;border-top:1px solid #eef2ee;">
                        <p style="margin:0;font-size:12px;color:#9aa89e;text-align:center;line-height:1.6;">
                          © ${new Date().getFullYear()} SaveBite · Rescuing good food, one bite at a time.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        `,
      });
      console.log("OTP email sent successfully");
    } catch (error: any) {
      console.error(`[Email Error] Failed to send OTP email to ${email}:`, error.message);
      throw error;
    }
  }

  async sendResetPasswordEmail(email:string,token:string):Promise<void>{
    const resetLink=`http://localhost:5173/reset-password?token=${token}`;
    await transporter.sendMail({
      from:process.env.EMAIL_USER,
      to:email,
      subject:'Reset your savebite password',
      html:`
         <h2>Reset Password</h2>
        <p>Click the link below to reset your password.</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `
    })
  }
}

export default EmailService;
