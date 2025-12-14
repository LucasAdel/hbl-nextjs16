/**
 * Signed URL Utility for Supabase Storage
 *
 * Creates time-limited signed URLs for private storage objects.
 * Use this to provide secure access to client-uploaded documents.
 *
 * SECURITY:
 * - URLs expire after 1 hour by default
 * - Never expose permanent URLs to private files
 * - Admin access should still verify authorization
 */

import { createServiceRoleClient } from "@/lib/supabase/server";

// Default expiry: 1 hour
const DEFAULT_SIGNED_URL_EXPIRY = 60 * 60;

// Extended expiry for admin review: 24 hours
const ADMIN_SIGNED_URL_EXPIRY = 60 * 60 * 24;

export interface SignedUrlResult {
  url: string | null;
  error: string | null;
}

export interface SignedUrlsResult {
  urls: Record<string, string>;
  errors: string[];
}

/**
 * Create a signed URL for a single file
 *
 * @param storagePath - Path within the bucket
 * @param bucket - Storage bucket name (default: 'client-uploads')
 * @param expiresIn - Expiry in seconds (default: 1 hour)
 *
 * @example
 * const { url, error } = await createSignedUrl(
 *   'user123/booking456/1702500000-document.pdf'
 * );
 * if (url) {
 *   // Use URL in email or response
 * }
 */
export async function createSignedUrl(
  storagePath: string,
  bucket = "client-uploads",
  expiresIn = DEFAULT_SIGNED_URL_EXPIRY
): Promise<SignedUrlResult> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      console.error("[Storage] Failed to create signed URL:", error.message);
      return { url: null, error: error.message };
    }

    return { url: data.signedUrl, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Storage] Signed URL creation error:", message);
    return { url: null, error: message };
  }
}

/**
 * Create signed URLs for multiple files
 *
 * @param paths - Array of storage paths
 * @param bucket - Storage bucket name (default: 'client-uploads')
 * @param expiresIn - Expiry in seconds (default: 1 hour)
 *
 * @example
 * const { urls, errors } = await createSignedUrls([
 *   'user123/booking456/doc1.pdf',
 *   'user123/booking456/doc2.pdf'
 * ]);
 * // urls: { 'path1': 'signed-url-1', 'path2': 'signed-url-2' }
 */
export async function createSignedUrls(
  paths: string[],
  bucket = "client-uploads",
  expiresIn = DEFAULT_SIGNED_URL_EXPIRY
): Promise<SignedUrlsResult> {
  if (paths.length === 0) {
    return { urls: {}, errors: [] };
  }

  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls(paths, expiresIn);

    if (error) {
      console.error("[Storage] Failed to create signed URLs:", error.message);
      return { urls: {}, errors: [error.message] };
    }

    const urls: Record<string, string> = {};
    const errors: string[] = [];

    for (const item of data || []) {
      if (item.signedUrl && item.path) {
        urls[item.path] = item.signedUrl;
      } else if (item.error) {
        errors.push(`${item.path || "unknown"}: ${item.error}`);
      }
    }

    return { urls, errors };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Storage] Signed URLs creation error:", message);
    return { urls: {}, errors: [message] };
  }
}

/**
 * Create an admin-duration signed URL (24 hours)
 * Use for admin review emails where longer access is needed
 */
export async function createAdminSignedUrl(
  storagePath: string,
  bucket = "client-uploads"
): Promise<SignedUrlResult> {
  return createSignedUrl(storagePath, bucket, ADMIN_SIGNED_URL_EXPIRY);
}

/**
 * Upload a file to storage and return metadata
 *
 * @param file - File or Buffer to upload
 * @param storagePath - Destination path in bucket
 * @param bucket - Storage bucket name
 * @param options - Additional upload options
 */
export async function uploadFile(
  file: File | Buffer,
  storagePath: string,
  bucket = "client-uploads",
  options?: {
    contentType?: string;
    upsert?: boolean;
  }
): Promise<{
  path: string | null;
  error: string | null;
}> {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase.storage.from(bucket).upload(
      storagePath,
      file,
      {
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      }
    );

    if (error) {
      console.error("[Storage] Upload failed:", error.message);
      return { path: null, error: error.message };
    }

    return { path: data.path, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Storage] Upload error:", message);
    return { path: null, error: message };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  storagePath: string,
  bucket = "client-uploads"
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = createServiceRoleClient();

    const { error } = await supabase.storage.from(bucket).remove([storagePath]);

    if (error) {
      console.error("[Storage] Delete failed:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Storage] Delete error:", message);
    return { success: false, error: message };
  }
}

/**
 * Generate a safe storage path for client uploads
 * Format: {user_id}/{booking_id}/{timestamp}-{sanitized_filename}
 */
export function generateStoragePath(
  userId: string,
  bookingId: string,
  originalFilename: string
): string {
  // Sanitize filename: remove special chars, keep extension
  const sanitized = originalFilename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/__+/g, "_")
    .toLowerCase();

  const timestamp = Date.now();

  return `${userId}/${bookingId}/${timestamp}-${sanitized}`;
}
