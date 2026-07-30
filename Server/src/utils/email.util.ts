
import { transporter } from "../config/mailer";

export const sendResetPasswordEmail = async (
  email: string,
  token: string
): Promise<void> => {
  // Keep the original working link unchanged
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your SaveBite Password",
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <body style="
          margin: 0;
          padding: 0;
          background-color: #f3f7f4;
          font-family: Arial, Helvetica, sans-serif;
        ">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="padding: 40px 15px;"
          >
            <tr>
              <td align="center">
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="
                    max-width: 520px;
                    overflow: hidden;
                    background-color: #ffffff;
                    border: 1px solid #dcfce7;
                    border-radius: 16px;
                    box-shadow: 0 8px 25px rgba(22, 101, 52, 0.1);
                  "
                >
                  <tr>
                    <td
                      align="center"
                      style="
                        padding: 30px;
                        background-color: #15803d;
                      "
                    >
                      <h1 style="
                        margin: 0;
                        color: #ffffff;
                        font-size: 30px;
                      ">
                        SaveBite
                      </h1>

                      <p style="
                        margin: 8px 0 0;
                        color: #dcfce7;
                        font-size: 14px;
                      ">
                        Save food. Save money. Save the planet.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding: 40px 32px;">
                      <h2 style="
                        margin: 0 0 15px;
                        color: #166534;
                        font-size: 24px;
                      ">
                        Reset your password
                      </h2>

                      <p style="
                        margin: 0;
                        color: #4b5563;
                        font-size: 15px;
                        line-height: 24px;
                      ">
                        Click the button below to create a new password for
                        your SaveBite account.
                      </p>

                      <table
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="margin: 30px auto;"
                      >
                        <tr>
                          <td
                            align="center"
                            style="
                              background-color: #16a34a;
                              border-radius: 10px;
                            "
                          >
                            <a
                              href="${resetLink}"
                              style="
                                display: inline-block;
                                padding: 14px 30px;
                                color: #ffffff;
                                font-size: 15px;
                                font-weight: bold;
                                text-decoration: none;
                              "
                            >
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="
                        padding: 14px;
                        color: #166534;
                        background-color: #f0fdf4;
                        border: 1px solid #bbf7d0;
                        border-radius: 10px;
                        font-size: 13px;
                      ">
                        This link expires in <strong>15 minutes</strong>.
                      </div>

                      <p style="
                        margin: 24px 0 0;
                        color: #9ca3af;
                        font-size: 12px;
                        line-height: 18px;
                      ">
                        If you did not request a password reset, you can safely
                        ignore this email.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td
                      align="center"
                      style="
                        padding: 20px;
                        background-color: #f0fdf4;
                        border-top: 1px solid #dcfce7;
                      "
                    >
                      <p style="
                        margin: 0;
                        color: #15803d;
                        font-size: 12px;
                      ">
                        © ${new Date().getFullYear()} SaveBite
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
};