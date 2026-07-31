import { Readable } from "node:stream";
import { cloudinary } from "./config";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 10;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export function assertValidImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(
      "Only PNG, JPEG, and WEBP images are supported."
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(
      `Each image must be under ${MAX_IMAGE_BYTES / 1024 / 1024}MB.`
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
      }
    );

    Readable.from(buffer).pipe(stream);
  });
}

export async function uploadFiles(
  files: File[],
  folder: string
) {
  return Promise.all(
    files.map((file) => uploadFile(file, folder))
  );
}