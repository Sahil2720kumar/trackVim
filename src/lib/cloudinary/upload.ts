import { Readable } from "node:stream";
import { cloudinary } from "./config";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 10;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/jpg",
  "image/gif",
]);

export function assertValidImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Only PNG, JPEG, JPG, GIF and WEBP images are supported.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `Each image must be under ${MAX_IMAGE_BYTES / 1024 / 1024}MB.`,
    );
  }
}

export async function uploadFile(
  file: File,
  folder: string,
  resourceType: "image" | "video" = "image",
): Promise<string> {
  if (resourceType === "image") {
    assertValidImage(file);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation: [
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }

        resolve(result.secure_url);
      },
    );

    Readable.from(buffer).pipe(stream);
  });
}

/**
 * Delete a Cloudinary uploaded file using its secure URL.
 */
export async function deleteFile(
  secureUrl: string,
  resourceType: "image" | "video" = "image",
): Promise<void> {
  if (!secureUrl) return;

  try {
    const url = new URL(secureUrl);

    /*
     * Cloudinary URL example:
     *
     * https://res.cloudinary.com/demo/image/upload/v1234567890/
     * trackVim/gyms/user123/logo/abc123.jpg
     *
     * We need:
     *
     * trackVim/gyms/user123/logo/abc123
     */

    const parts = url.pathname.split("/");

    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary URL.");
    }

    // Everything after "upload"
    let publicIdParts = parts.slice(uploadIndex + 1);

    /*
     * Remove transformation/version segments.
     *
     * Example:
     *
     * /image/upload/q_auto,f_auto/v123/trackVim/gyms/...
     *
     * or:
     *
     * /image/upload/v123/trackVim/gyms/...
     */

    if (publicIdParts[0] && publicIdParts[0].startsWith("v")) {
      publicIdParts = publicIdParts.slice(1);
    } else {
      /*
       * If transformations exist, find the version segment.
       */
      const versionIndex = publicIdParts.findIndex((part) =>
        /^v\d+$/.test(part),
      );

      if (versionIndex !== -1) {
        publicIdParts = publicIdParts.slice(versionIndex + 1);
      }
    }

    if (!publicIdParts.length) {
      throw new Error("Could not determine Cloudinary public_id.");
    }

    /*
     * Remove file extension.
     *
     * abc123.jpg → abc123
     */
    const lastPart = publicIdParts[publicIdParts.length - 1];

    publicIdParts[publicIdParts.length - 1] = lastPart.replace(/\.[^/.]+$/, "");

    const publicId = publicIdParts.join("/");

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }
  } catch (error) {
    console.error("Cloudinary deleteFile failed:", error);

    throw error;
  }
}

export async function uploadFiles(files: File[], folder: string) {
  return Promise.all(files.map((file) => uploadFile(file, folder)));
}
