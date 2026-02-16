import nodemailer from "nodemailer";

/**
 * NEXUS EMAIL UTILITY
 * Configures Gmail SMTP and handles template selection.
 * Logic: One function to rule them all based on the 'type' parameter.
 */

// 1. Configure the Transporter
// Use Gmail with App Passwords (16-character code)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * sendEmail function
 * @param {Object} params - { name, email, token, type }
 */
const sendEmail = async ({ name, email, token, type }) => {
  try {
    // Define Frontend URL (This is where the user actually interacts)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    let subject = "";
    let bodyTitle = "";
    let bodyText = "";
    let buttonText = "";
    let actionUrl = "";
    let accentColor = "#2563eb"; // Default Blue

    // 2. Template Selection Logic
    if (type === "signup") {
      subject = "Welcome to Nexus - Let's Get Started";
      bodyTitle = `Welcome aboard, ${name}!`;
      bodyText =
        "Your account has been created successfully. You can now join your team and start managing tickets in the Nexus ecosystem.";
      buttonText = "Login to Nexus";
      actionUrl = `${frontendUrl}/login`;
    } else if (type === "reset") {
      subject = "Nexus: Password Reset Request";
      bodyTitle = "Password Reset";
      bodyText =
        "We received a request to reset your password. If you didn't make this request, ignore this email. This link is valid for 10 minutes.";
      buttonText = "Reset Password";
      actionUrl = `${frontendUrl}/reset-password/${token}`;
      accentColor = "#dc2626"; // Security Red
    } else {
      throw new Error("Invalid email type provided.");
    }

    // 3. Build the HTML Template (Inline CSS for maximum compatibility)
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">N E X U S</h1>
        </div>
        <div style="padding: 40px 30px; color: #1e293b; line-height: 1.6;">
          <h2 style="font-size: 20px; margin-top: 0; color: ${accentColor};">${bodyTitle}</h2>
          <p style="margin-bottom: 30px;">${bodyText}</p>
          <div style="text-align: center;">
            <a href="${actionUrl}" style="background-color: ${accentColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">${buttonText}</a>
          </div>
          <p style="margin-top: 30px; font-size: 13px; color: #64748b;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${actionUrl}" style="color: #2563eb;">${actionUrl}</a>
            <p>${token}</p>
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          &copy; 2026 Nexus Systems. This is a system-generated email.
        </div>
      </div>
    `;

    // 4. Send the Mail
    const info = await transporter.sendMail({
      from: `"Nexus System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: htmlContent,
    });

    console.log(`Email sent: ${type} to ${email}`);
    return info;
  } catch (error) {
    console.error("Nodemailer Error:", error);
    // Don't leak SMTP details to the client, but throw so the controller can handle it
    throw new Error("Email delivery failed. Check server logs.");
  }
};

export { sendEmail };
