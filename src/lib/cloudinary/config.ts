import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Temporarily add this before the upload call
console.log("Cloudinary config:", {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key,
  // don't log api_secret in prod
  has_secret: !!cloudinary.config().api_secret,
});

export { cloudinary };
