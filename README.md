# 🖼️ One Click Image To URLs

A simple and powerful Next.js API that converts uploaded image files into public image URLs using the [imgbb](https://imgbb.com/) API. Useful for quickly generating sharable image URLs from any file input, and includes automatic fallback notifications when upload fails.

## 🚀 Features

- Upload an image and instantly receive:
  - **Original URL**
  - **Medium-sized URL**
  - **Thumbnail URL**
- Built with **Next.js**
- Integrated with **imgbb API**
- Email notification support for failed uploads (SMTP configurable)

---

## 📦 Usage

If you want to implement this in your own project, simply use the following function:

```ts
export default async function imageToUrl(file) {
  const formData = new FormData();
  formData.append("image", file);

  const API_KEY = "";

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${API_KEY}`,
      {
        method: "POST",
        body: formData,
      }
    );
    const upload = await response.json();

    if (upload.success) {
      return {
        originalUrl: upload.data.image?.url,
        mediumUrl: upload.data.medium?.url,
        thumbnailUrl: upload.data.thumb?.url,
      };
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
```

## 🛠️ Setup

```ts
git clone https://github.com/SumanPoU/One-Click-Image-To-Urls.git
cd One-Click-Image-To-Urls
```

````ts
# SMTP Settings (for failure notifications)
SMTP_HOST=smtp.example.com       # e.g., smtp.gmail.com for Gmail
SMTP_PORT=587                    # Use 465 for secure connections or 587 for unsecure
SMTP_SECURE=false                # Set to true for secure SMTP connections
SMTP_USER=your_smtp_username     # Your SMTP username (e.g., your Gmail address)
SMTP_PASSWORD=your_smtp_password # Your SMTP password (e.g., Gmail app password)

# Notification email settings
ADMIN_EMAIL_FROM="Your App <no-reply@example.com>"  # The "from" email address
ADMIN_EMAIL_TO=admin@example.com                      # The email address to notify on failure

# API Endpoint URL (for Next.js API routes)
NEXT_PUBLIC_API_URL="https://localhost:3000/api/img"  # Local or production URL of your Next.js app


```ts
cp env.example .env
````

```ts
# SMTP Settings (can be Gmail SMTP, Sendinblue, Mailgun, etc.)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password

# Notification email settings
ADMIN_EMAIL_FROM="Your App <no-reply@example.com>"
```
