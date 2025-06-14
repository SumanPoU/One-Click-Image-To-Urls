"use client";

import { useState, useRef } from "react";
import { uploadImages } from "@/app/actions/upload-action";
import {
  UploadCloud,
  X,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ImageIcon,
  LinkIcon,
} from "lucide-react";
import Image from "next/image";

export default function ImageUploader() {
  // Main state for tracking images
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [bulkCopied, setBulkCopied] = useState(null);
  const fileInputRef = useRef(null);

  // ===== FILE HANDLING FUNCTIONS =====

  // Handle file selection from input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  // Process and add files to state
  const addFiles = (files) => {
    const newImages = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: "idle",
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // ===== DRAG AND DROP HANDLERS =====

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  // ===== IMAGE MANAGEMENT FUNCTIONS =====

  // Remove a single image
  const removeImage = (id) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Reset all images
  const resetAll = () => {
    // Release object URLs to prevent memory leaks
    images.forEach((img) => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImages([]);
  };

  // ===== UPLOAD FUNCTIONS =====

  // Upload a single image
  const uploadImage = async (id) => {
    const imageToUpload = images.find((img) => img.id === id);
    if (!imageToUpload) return;

    // Update status to uploading
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, status: "uploading" } : img))
    );

    try {
      const formData = new FormData();
      formData.append("image", imageToUpload.file);

      const result = await uploadImages(formData);

      if (result.success) {
        // Update with successful upload data
        setImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  ...img,
                  status: "success",
                  urls: {
                    originalUrl: result.urls.originalUrl,
                    mediumUrl: result.urls.mediumUrl,
                    thumbnailUrl: result.urls.thumbnailUrl,
                  },
                }
              : img
          )
        );
      } else {
        // Mark as error if upload failed
        setImages((prev) =>
          prev.map((img) => (img.id === id ? { ...img, status: "error" } : img))
        );
      }
    } catch (error) {
      // Handle any exceptions
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, status: "error" } : img))
      );
    }
  };

  // Upload all pending images
  const uploadAllImages = async () => {
    const pendingImages = images.filter((img) => img.status === "idle");
    for (const img of pendingImages) {
      await uploadImage(img.id);
    }
  };

  // ===== URL HANDLING FUNCTIONS =====

  // Get the best available URL based on priority: medium > thumbnail > original
  const getBestUrl = (urls) => {
    if (!urls) return "";
    return urls.mediumUrl || urls.thumbnailUrl || urls.originalUrl || "";
  };

  // Copy a URL to clipboard
  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ===== BULK COPY FUNCTIONS =====

  // Copy all URLs as a simple list
  const copyAllUrls = () => {
    const successfulImages = images.filter(
      (img) => img.status === "success" && img.urls
    );
    if (successfulImages.length === 0) return;

    const urlList = successfulImages
      .map((img) => getBestUrl(img.urls))
      .join("\n");
    navigator.clipboard.writeText(urlList);
    setBulkCopied("plain");
    setTimeout(() => setBulkCopied(null), 2000);
  };

  // Copy all URLs as JSON
  const copyAsJson = () => {
    const successfulImages = images.filter(
      (img) => img.status === "success" && img.urls
    );
    if (successfulImages.length === 0) return;

    const jsonData = successfulImages.map((img) => ({
      filename: img.file.name,
      size: img.file.size,
      type: img.file.type,
      urls: {
        original: img.urls?.originalUrl,
        medium: img.urls?.mediumUrl,
        thumbnail: img.urls?.thumbnailUrl,
        best: getBestUrl(img.urls),
      },
    }));

    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    setBulkCopied("json");
    setTimeout(() => setBulkCopied(null), 2000);
  };

  // Copy for database format (CSV-like)
  const copyForDatabase = () => {
    const successfulImages = images.filter(
      (img) => img.status === "success" && img.urls
    );
    if (successfulImages.length === 0) return;

    const header = "filename,size,type,url\n";
    const rows = successfulImages
      .map(
        (img) =>
          `"${img.file.name}",${img.file.size},"${img.file.type}","${getBestUrl(
            img.urls
          )}"`
      )
      .join("\n");

    navigator.clipboard.writeText(header + rows);
    setBulkCopied("db");
    setTimeout(() => setBulkCopied(null), 2000);
  };

  // Calculate stats for display
  const successfulUploads = images.filter(
    (img) => img.status === "success"
  ).length;
  const totalImages = images.length;

  // ===== COMPONENT RENDERING =====
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent dancing-text">
          Image Uploader
        </h1>
        <p className="text-gray-600 mt-2 poppins-text">
          Upload, share, and manage your images with ease
        </p>
      </div>

      {/* Drop Zone Area */}
      <DropZone
        isDragging={isDragging}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
      />

      {/* Image List and Controls */}
      {images.length > 0 && (
        <div className="space-y-6">
          {/* Control Buttons */}
          <ControlPanel
            images={images}
            successfulUploads={successfulUploads}
            totalImages={totalImages}
            bulkCopied={bulkCopied}
            copyAllUrls={copyAllUrls}
            copyAsJson={copyAsJson}
            copyForDatabase={copyForDatabase}
            uploadAllImages={uploadAllImages}
            resetAll={resetAll}
          />

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                removeImage={removeImage}
                uploadImage={uploadImage}
                getBestUrl={getBestUrl}
                copyToClipboard={copyToClipboard}
                copiedId={copiedId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== SUB-COMPONENTS =====

// Drop Zone Component
function DropZone({
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  fileInputRef,
  handleFileChange,
}) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
        isDragging
          ? "border-purple-500 bg-purple-50 shadow-lg scale-[1.02]"
          : "border-gray-300 hover:border-purple-400 hover:shadow-md"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-full">
          <UploadCloud className="h-12 w-12 text-purple-500" />
        </div>
        <h3 className="text-xl font-medium nunito-text bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
          Drag and drop your images here
        </h3>
        <p className="text-sm text-gray-600 poppins-text">
          or{" "}
          <span className="text-purple-500 font-medium hover:underline">
            browse files
          </span>
        </p>
        <p className="text-xs text-gray-400 poppins-text px-4 py-2 bg-gray-50 rounded-full">
          Supports: JPG, PNG, GIF, WEBP (Max 32MB)
        </p>
      </div>
    </div>
  );
}

// Control Panel Component
function ControlPanel({
  images,
  successfulUploads,
  totalImages,
  bulkCopied,
  copyAllUrls,
  copyAsJson,
  copyForDatabase,
  uploadAllImages,
  resetAll,
}) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg shadow-sm">
      {/* Image Count and Upload Status */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium playfair-text">
          {totalImages} {totalImages === 1 ? "Image" : "Images"}
        </h3>
        {successfulUploads > 0 && (
          <span className="text-sm text-green-600 poppins-text bg-green-50 px-2 py-0.5 rounded-full">
            {successfulUploads}/{totalImages} uploaded
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Bulk Copy Options */}
        {successfulUploads > 0 && (
          <div className="flex gap-2">
            <button
              onClick={copyAllUrls}
              className="px-3 py-1.5 text-sm bg-white hover:bg-gray-50 rounded-md font-medium poppins-text flex items-center gap-1 border border-gray-200 shadow-sm transition-all hover:shadow"
            >
              {bulkCopied === "plain" ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-purple-500" />
                  Copy All URLs
                </>
              )}
            </button>
            <button
              onClick={copyAsJson}
              className="px-3 py-1.5 text-sm bg-white hover:bg-gray-50 rounded-md font-medium poppins-text flex items-center gap-1 border border-gray-200 shadow-sm transition-all hover:shadow"
            >
              {bulkCopied === "json" ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-purple-500" />
                  As JSON
                </>
              )}
            </button>
            <button
              onClick={copyForDatabase}
              className="px-3 py-1.5 text-sm bg-white hover:bg-gray-50 rounded-md font-medium poppins-text flex items-center gap-1 border border-gray-200 shadow-sm transition-all hover:shadow"
            >
              {bulkCopied === "db" ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-purple-500" />
                  For DB
                </>
              )}
            </button>
          </div>
        )}

        {/* Upload and Reset Buttons */}
        <div className="flex gap-2">
          <button
            onClick={uploadAllImages}
            disabled={images.every((img) => img.status !== "idle")}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-md font-medium poppins-text disabled:opacity-50 shadow-sm hover:shadow transition-all hover:translate-y-[-1px]"
          >
            Upload All
          </button>
          <button
            onClick={resetAll}
            className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-md font-medium poppins-text flex items-center gap-1 transition-all hover:shadow"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// Individual Image Card Component
function ImageCard({
  image,
  removeImage,
  uploadImage,
  getBestUrl,
  copyToClipboard,
  copiedId,
}) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
      {/* Image Preview */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
        <Image
          src={image.preview || "/placeholder.svg"}
          alt="Preview"
          fill
          className="object-contain"
        />

        {/* Delete Button */}
        <button
          onClick={() => removeImage(image.id)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 border border-gray-200 transition-all hover:scale-105"
          aria-label="Remove image"
        >
          <X className="h-5 w-5 text-red-500" />
        </button>

        {/* File Size Badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md poppins-text">
          {(image.file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      </div>

      {/* Image Details and Actions */}
      <div className="p-4 space-y-3">
        {/* File Name */}
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-purple-500" />
          <p className="text-sm truncate poppins-text font-medium">
            {image.file.name}
          </p>
        </div>

        {/* Status-based UI */}
        {image.status === "idle" && (
          <button
            onClick={() => uploadImage(image.id)}
            className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-md text-sm font-medium poppins-text shadow-sm hover:shadow transition-all hover:translate-y-[-1px]"
          >
            Upload
          </button>
        )}

        {image.status === "uploading" && (
          <div className="flex items-center justify-center py-2 px-3 bg-purple-50 rounded-md">
            <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
            <span className="ml-2 text-sm text-purple-700 poppins-text">
              Uploading...
            </span>
          </div>
        )}

        {image.status === "error" && (
          <div className="flex items-center justify-center py-2 px-3 bg-red-50 rounded-md text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="ml-2 text-sm poppins-text">Upload failed</span>
          </div>
        )}

        {/* URL Display and Copy Options */}
        {image.status === "success" && image.urls && (
          <div className="space-y-3">
            {/* Best URL with Copy Button - Prioritizing Medium URL */}
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 p-1.5 rounded-l-md border border-r-0 border-purple-200">
                <LinkIcon className="h-4 w-4 text-purple-600" />
              </div>
              <input
                type="text"
                value={getBestUrl(image.urls)}
                readOnly
                className="flex-1 text-xs border border-purple-200 py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-purple-300 bg-white"
              />
              <button
                onClick={() =>
                  copyToClipboard(getBestUrl(image.urls), image.id)
                }
                className="bg-gradient-to-r from-purple-500 to-cyan-500 border border-l-0 border-purple-200 rounded-r-md p-1.5 hover:from-purple-600 hover:to-cyan-600 transition-all"
              >
                {copiedId === image.id ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Copy className="h-4 w-4 text-white" />
                )}
              </button>
            </div>

            {/* URL Type Options */}
            <div className="flex space-x-2 text-xs">
              {image.urls.originalUrl && (
                <button
                  onClick={() =>
                    copyToClipboard(image.urls.originalUrl, image.id)
                  }
                  className="px-2 py-1 bg-gray-100 rounded text-gray-700 hover:bg-gray-200 poppins-text transition-colors"
                >
                  Original
                </button>
              )}
              {image.urls.mediumUrl && (
                <button
                  onClick={() =>
                    copyToClipboard(image.urls.mediumUrl, image.id)
                  }
                  className="px-2 py-1 bg-purple-100 rounded text-purple-700 hover:bg-purple-200 poppins-text font-medium transition-colors ring-1 ring-purple-200"
                >
                  Medium
                </button>
              )}
              {image.urls.thumbnailUrl && (
                <button
                  onClick={() =>
                    copyToClipboard(image.urls.thumbnailUrl, image.id)
                  }
                  className="px-2 py-1 bg-gray-100 rounded text-gray-700 hover:bg-gray-200 poppins-text transition-colors"
                >
                  Thumbnail
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
