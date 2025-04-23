"use server"

import { sendAdminNotification } from "@/lib/email-notification"

// Array of API keys for ImgBB
const API_KEYS = [
  "496d0c4c403e38ef049922f3c3e73f08", // Primary key
  "2nd_api_key_here",
  "3rd_api_key_here",
  "4th_api_key_here",
  "5th_api_key_here",
  "6th_api_key_here",
  "7th_api_key_here",
  "8th_api_key_here",
  "9th_api_key_here",
  "10th_api_key_here",
  "11th_api_key_here",
  // Add more API keys as needed
]

type UploadResult = {
  success: boolean
  urls: {
    originalUrl?: string
    mediumUrl?: string
    thumbnailUrl?: string
  }
  message?: string
}

export async function uploadImages(formData: FormData): Promise<UploadResult> {
  const image = formData.get("image") as File

  if (!image) {
    return {
      success: false,
      urls: {},
      message: "No image provided",
    }
  }

  // Try each API key until one works
  for (let i = 0; i < API_KEYS.length; i++) {
    const currentKey = API_KEYS[i]

    try {
      const result = await uploadWithKey(image, currentKey, i)

      if (result.success) {
        return result
      }

      // If we're on the last key and still failing, notify admin
      if (i === API_KEYS.length - 1) {
        await sendAdminNotification({
          subject: "All ImgBB API keys failed",
          message: `Failed to upload image "${image.name}" with all available API keys. Please check API key validity.`,
          imageInfo: {
            name: image.name,
            size: `${(image.size / 1024 / 1024).toFixed(2)} MB`,
            type: image.type,
          },
        })
      }
    } catch (error) {
      console.error(`Error with API key ${i + 1}:`, error)

      // If this is the last key, notify admin about complete failure
      if (i === API_KEYS.length - 1) {
        await sendAdminNotification({
          subject: "Critical: Image Upload System Failure",
          message: `All API keys failed when trying to upload "${image.name}". System requires immediate attention.`,
          imageInfo: {
            name: image.name,
            size: `${(image.size / 1024 / 1024).toFixed(2)} MB`,
            type: image.type,
          },
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  // If we get here, all keys failed
  return {
    success: false,
    urls: {},
    message: "All upload attempts failed",
  }
}

async function uploadWithKey(image: File, apiKey: string, keyIndex: number): Promise<UploadResult> {
  const formData = new FormData()
  formData.append("image", image)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  })

  const upload = await response.json()

  if (upload.success) {
    return {
      success: true,
      urls: {
        originalUrl: upload.data.image?.url,
        mediumUrl: upload.data.medium?.url,
        thumbnailUrl: upload.data.thumb?.url,
      },
    }
  } else {
    // Notify admin about this specific key failure
    await sendAdminNotification({
      subject: `ImgBB API Key #${keyIndex + 1} Failed`,
      message: `API key #${keyIndex + 1} failed when uploading "${image.name}". Error: ${upload.error?.message || "Unknown error"}`,
      imageInfo: {
        name: image.name,
        size: `${(image.size / 1024 / 1024).toFixed(2)} MB`,
        type: image.type,
      },
    })

    return {
      success: false,
      urls: {},
      message: upload.error?.message || "Upload failed",
    }
  }
}
