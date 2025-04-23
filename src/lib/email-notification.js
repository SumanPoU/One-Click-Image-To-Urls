"use server";

import nodemailer from "nodemailer";



export async function sendAdminNotification(
  data
) {
  try {
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #333;">🚨 Admin Notification</h1>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong><br>${data.message}</p>

        ${data.imageInfo
        ? `
        <hr>
        <h2>🖼️ Image Info</h2>
        <ul>
          <li><strong>Name:</strong> ${data.imageInfo.name}</li>
          <li><strong>Size:</strong> ${data.imageInfo.size}</li>
          <li><strong>Type:</strong> ${data.imageInfo.type}</li>
        </ul>
        `
        : ""
      }

        ${data.error
        ? `
        <hr>
        <h2>❌ Error Details</h2>
        <pre style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;">
${data.error}
        </pre>
        `
        : ""
      }

        <hr>
        <footer style="margin-top: 20px; font-size: 0.9em; color: #888;">
          This is an automated message from your application.
        </footer>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL_FROM,
      to: process.env.ADMIN_EMAIL_TO,
      subject: `🚨 ${data.subject}`,
      html: emailHTML,
    });

    return true;
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    return false;
  }
}
