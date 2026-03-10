/**
 * Email Service Utility
 * Supports Resend email service for production
 */

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Send email using Resend service
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error("[Email] RESEND_API_KEY not configured")
      return { success: false, error: "Email service not configured" }
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: options.from || "noreply@sparx.app",
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[Email] Send error:", error)
      return { success: false, error: error.message || "Failed to send email" }
    }

    return { success: true }
  } catch (error) {
    console.error("[Email] Exception:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            display: inline-block; 
            background: linear-gradient(to right, #f97316, #dc2626);
            color: white; 
            padding: 12px 30px; 
            border-radius: 6px; 
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Selamat Datang di SparX!</h1>
          <p>Klik tombol berikut untuk verifikasi email Anda:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verifikasi Email</a>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            Link ini berlaku selama 24 jam.
          </p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Verifikasi Email SparX",
    html,
  })
}
