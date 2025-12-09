"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  File,
  FileText,
  Image,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "success" | "error";
  progress: number;
  errorMessage?: string;
}

interface DocumentUploadProps {
  userEmail: string;
  bookingId?: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function DocumentUpload({
  userEmail,
  bookingId,
  onUploadComplete,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-purple-500" />;
    }
    if (type.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-blue-500" />;
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Check file type
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.some((type) => extension === type.toLowerCase())) {
      return `File type not accepted. Allowed: ${acceptedTypes.join(", ")}`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<void> => {
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setFiles((prev) => [
        ...prev,
        {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          status: "error",
          progress: 0,
          errorMessage: validationError,
        },
      ]);
      return;
    }

    // Add file to state with uploading status
    setFiles((prev) => [
      ...prev,
      {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0,
      },
    ]);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", userEmail);
      if (bookingId) {
        formData.append("bookingId", bookingId);
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId && f.progress < 90
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      // Upload file
      const response = await fetch("/api/client-portal/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (response.ok) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: "success", progress: 100 } : f
          )
        );
      } else {
        const error = await response.json();
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: "error", errorMessage: error.error || "Upload failed" }
              : f
          )
        );
      }
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", errorMessage: "Network error. Please try again." }
            : f
        )
      );
    }
  };

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      // Check max files limit
      const currentCount = files.length;
      const availableSlots = maxFiles - currentCount;

      if (availableSlots <= 0) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const filesToUpload = Array.from(newFiles).slice(0, availableSlots);

      for (const file of filesToUpload) {
        uploadFile(file);
      }
    },
    [files.length, maxFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const successfulFiles = files.filter((f) => f.status === "success");

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-tiffany bg-tiffany/5"
            : "border-gray-300 hover:border-tiffany/50 hover:bg-gray-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <CloudUpload
          className={`h-12 w-12 mx-auto mb-4 ${
            isDragOver ? "text-tiffany" : "text-gray-400"
          }`}
        />
        <p className="text-gray-700 font-medium mb-1">
          {isDragOver ? "Drop files here" : "Drag and drop files here"}
        </p>
        <p className="text-sm text-gray-500 mb-3">
          or <span className="text-tiffany">browse</span> to select files
        </p>
        <p className="text-xs text-gray-400">
          Max {maxSizeMB}MB per file. Accepted: {acceptedTypes.join(", ")}
        </p>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  file.status === "error"
                    ? "bg-red-50 border-red-200"
                    : file.status === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {/* File Icon */}
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                  {getFileIcon(file.type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    {file.status === "uploading" && (
                      <span className="text-xs text-tiffany">{file.progress}%</span>
                    )}
                    {file.status === "error" && (
                      <span className="text-xs text-red-600">{file.errorMessage}</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {file.status === "uploading" && (
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tiffany transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status/Action */}
                <div className="flex-shrink-0">
                  {file.status === "uploading" && (
                    <Loader2 className="h-5 w-5 text-tiffany animate-spin" />
                  )}
                  {file.status === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {file.status === "error" && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {file.status !== "error" && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded ml-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Summary */}
      {successfulFiles.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-gray-600">
            {successfulFiles.length} file{successfulFiles.length !== 1 ? "s" : ""} uploaded
          </span>
          {onUploadComplete && (
            <button
              onClick={() => {
                onUploadComplete(successfulFiles);
                setFiles([]);
              }}
              className="text-sm text-tiffany hover:text-tiffany-dark font-medium"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
