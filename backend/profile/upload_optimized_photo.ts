import { api } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";
import { profileDB } from "./db";
import { processImage } from "./image_optimizer";

const optimizedPhotos = new Bucket("optimized-photos", {
  public: true,
});

export interface UploadOptimizedPhotoRequest {
  photoData: string;
  fileName: string;
}

export interface ImageVariantInfo {
  webp: string;
  avif: string;
  jpeg: string;
}

export interface UploadOptimizedPhotoResponse {
  success: boolean;
  baseFileName: string;
  variants: {
    [key: string]: ImageVariantInfo;
  };
  metadata: {
    width: number;
    height: number;
  };
}

export const uploadOptimizedPhoto = api<
  UploadOptimizedPhotoRequest,
  UploadOptimizedPhotoResponse
>(
  { expose: true, auth: true, method: "POST", path: "/profile/photo/optimized" },
  async (req) => {
    const base64Data = req.photoData.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const maxSize = 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }

    const timestamp = Date.now();
    const baseFileName = `profile-${timestamp}`;

    const processed = await processImage(buffer);

    const uploadPromises: Promise<void>[] = [];
    const variants: { [key: string]: ImageVariantInfo } = {};

    for (const [suffix, formats] of Object.entries(processed.variants)) {
      const variantName = suffix === "original" ? baseFileName : `${baseFileName}-${suffix}`;

      const webpPromise = optimizedPhotos.upload(
        `${variantName}.webp`,
        formats.webp,
        { contentType: "image/webp" }
      ).then(() => {});

      const avifPromise = optimizedPhotos.upload(
        `${variantName}.avif`,
        formats.avif,
        { contentType: "image/avif" }
      ).then(() => {});

      const jpegPromise = optimizedPhotos.upload(
        `${variantName}.jpg`,
        formats.jpeg,
        { contentType: "image/jpeg" }
      ).then(() => {});

      uploadPromises.push(webpPromise, avifPromise, jpegPromise);

      variants[suffix] = {
        webp: optimizedPhotos.publicUrl(`${variantName}.webp`),
        avif: optimizedPhotos.publicUrl(`${variantName}.avif`),
        jpeg: optimizedPhotos.publicUrl(`${variantName}.jpg`),
      };
    }

    await Promise.all(uploadPromises);

    const primaryPhotoUrl = variants["original"]?.webp || variants["original"]?.jpeg;

    await profileDB.exec`
      UPDATE profiles 
      SET photo_url = ${primaryPhotoUrl},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM profiles ORDER BY id DESC LIMIT 1)
    `;

    return {
      success: true,
      baseFileName,
      variants,
      metadata: processed.original,
    };
  }
);
