import nodemailer from "nodemailer";

/**
 * NEXS EMAIL UTILITY
 * Configures Gmail SMTP and handles template selection.
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * sendEmail function
 * @param {Object} params - { name, email, token, type, ticketTitle, priority, status, adminName }
 */
const sendEmail = async ({
  name,
  email,
  token,
  type,
  ticketTitle,
  priority,
  status,
  adminName,
}) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    let subject = "";
    let bodyTitle = "";
    let bodyText = "";
    let buttonText = "View in Nexus";
    let actionUrl = `${frontendUrl}/dashboard`;
    let accentColor = "#0f172a"; // Default Dark

    // 1. Template Selection Logic
    if (type === "signup") {
      subject = "Welcome to Nexus - Let's Get Started";
      bodyTitle = `Welcome aboard, ${name}!`;
      bodyText =
        "Your account has been created successfully. You can now join your team and start managing tickets.";
      buttonText = "Login to Nexus";
      actionUrl = `${frontendUrl}/login`;
      accentColor = "#2563eb";
    } else if (type === "otp") {
      subject = "Nexus: Your Verification Code";
      bodyTitle = "Email Verification";
      bodyText = `Hey ${name}, your 6-digit verification code is: <h2 style="letter-spacing: 5px; text-align: center; color: #0f172a;">${token}</h2> This code is valid for 10 minutes.`;
      buttonText = "Verify Account";
      actionUrl = `${frontendUrl}/verify-email?email=${email}`;
      accentColor = "#2563eb";
    } else if (type === "reset") {
      subject = "Nexus: Password Reset Request";
      bodyTitle = "Password Reset";
      bodyText =
        "We received a request to reset your password. This link is valid for 10 minutes.";
      buttonText = "Reset Password";
      actionUrl = `${frontendUrl}/reset-password/${token}`;
      } else if (type === "assignment") {
        subject = `Task Assigned: ${ticketTitle}`;
        bodyTitle = "New Ticket Assigned";
        bodyText = `Hey ${name}, <b>${adminName}</b> has assigned you a new ticket: <b>${ticketTitle}</b>. Priority: <span style="color: #dc2626; font-weight: bold;">${priority}</span>.`;
        accentColor = "#2563eb";
      } else if (type === "statusUpdate") {
        subject = `Status Update: ${ticketTitle}`;
        bodyTitle = "Ticket Progress";
        bodyText = `Your ticket <b>${ticketTitle}</b> has been moved to <b>${status}</b>.`;
        accentColor = status === "DONE" ? "#10b981" : "#f59e0b"; // Green if Done, Yellow otherwise
      } else if (type === "teamInvite") {
      subject = `Invitation to Join: ${adminName}'s Team`;
      bodyTitle = "Team Invitation";
      bodyText = `Hey ${name}, <b>${adminName}</b> has invited you to join their team in Nexus. Click the button below to accept the invitation and start collaborating.`;
      buttonText = "Accept Invitation";
      actionUrl = `${frontendUrl}/invitation/accept/${token}`;
      accentColor = "#7c3aed"; // Purple for Teams/Community
    }
    else if (type === "teamJoined") {
      subject = `Welcome to Team: ${ticketTitle}`; // Using ticketTitle as a generic 'name' holder
      bodyTitle = "Successfully Joined!";
      bodyText = `Hey ${name}, you are now an official member of the team: <b>${ticketTitle}</b>. You can now start viewing and managing tickets for this team.`;
      accentColor = "#10b981"; // Success Green
    }
    else if (type === "teamRemoved") {
      subject = `Nexus: Team Membership Update`;
      bodyTitle = "Membership Revoked";
      bodyText = `Hey ${name}, this is to inform you that you have been removed from the team: <b>${ticketTitle}</b>. You will no longer have access to the tickets or stats for this team.`;
      accentColor = "#64748b"; // Neutral Slate
      buttonText = "Contact Support";
    }
    else {
      throw new Error("Invalid email type provided.");
    }
    // 2. Build the HTML Template
    const htmlContent = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 4px;">N E X U S</h1>
        </div>
        <div style="padding: 40px 30px; color: #1e293b; line-height: 1.6;">
          <h2 style="font-size: 20px; margin-top: 0; color: ${accentColor};">${bodyTitle}</h2>
          <p style="margin-bottom: 30px; font-size: 16px;">${bodyText}</p>
          <div style="text-align: center;">
            <a href="${actionUrl}" style="background-color: ${accentColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">${buttonText}</a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          &copy; 2026 Nexus Ticket Systems. Work smarter, not harder.
        </div>
      </div>
    `;

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
    throw new Error("Email delivery failed.");
  }
};

export { sendEmail };
