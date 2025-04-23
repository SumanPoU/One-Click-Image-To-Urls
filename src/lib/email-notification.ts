"use server";

type NotificationData = {
  subject: string;
  message: string;
  imageInfo?: {
    name: string;
    size: string;
    type: string;
  };
  error?: string;
};

export async function sendAdminNotification(
  data: NotificationData
): Promise<boolean> {
  // Replace with your actual email sending logic
  // This could use Nodemailer, SendGrid, or any other email service

  try {
    // For demonstration purposes, we'll just log the notification
    console.log("ADMIN NOTIFICATION:");
    console.log("Subject:", data.subject);
    console.log("Message:", data.message);

    if (data.imageInfo) {
      console.log("Image Info:", data.imageInfo);
    }

    if (data.error) {
      console.log("Error:", data.error);
    }

    // In a real implementation, you would send an actual email:
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL_FROM,
      to: process.env.ADMIN_EMAIL_TO,
      subject: data.subject,
      html: `
        <h1>${data.subject}</h1>
        <p>${data.message}</p>
        ${data.imageInfo ? `
          <h2>Image Information</h2>
          <ul>
            <li>Name: ${data.imageInfo.name}</li>
            <li>Size: ${data.imageInfo.size}</li>
            <li>Type: ${data.imageInfo.type}</li>
          </ul>
        ` : ''}
        ${data.error ? `
          <h2>Error Details</h2>
          <pre>${data.error}</pre>
        ` : ''}
      `,
    })
    */

    return true;
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    return false;
  }
}
