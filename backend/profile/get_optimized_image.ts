import { api } from "encore.dev/api";

export interface GetOptimizedImageRequest {
  baseFileName: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "original";
  format?: "webp" | "avif" | "jpeg";
}

export interface GetOptimizedImageResponse {
  urls: {
    webp: string;
    avif: string;
    jpeg: string;
  };
  srcset: {
    webp: string;
    avif: string;
    jpeg: string;
  };
}

const API_BASE = process.env.ENCORE_API_BASE_URL || "";

export const getOptimizedImage = api<
  GetOptimizedImageRequest,
  GetOptimizedImageResponse
>(
  { expose: true, method: "GET", path: "/profile/image/optimized/:baseFileName" },
  async (req) => {
    const size = req.size || "original";
    const suffix = size === "original" ? "" : `-${size}`;
    const fileName = `${req.baseFileName}${suffix}`;

    const bucketBase = `${API_BASE}/profile-photos`;

    const urls = {
      webp: `${bucketBase}/${fileName}.webp`,
      avif: `${bucketBase}/${fileName}.avif`,
      jpeg: `${bucketBase}/${fileName}.jpg`,
    };

    const sizes = ["xs", "sm", "md", "lg", "xl"];
    const widths = { xs: 320, sm: 640, md: 1024, lg: 1920, xl: 3840 };

    const buildSrcset = (format: string) => {
      return sizes
        .map((s) => {
          const sizeFileName =
            s === "original"
              ? req.baseFileName
              : `${req.baseFileName}-${s}`;
          return `${bucketBase}/${sizeFileName}.${format} ${widths[s as keyof typeof widths]}w`;
        })
        .join(", ");
    };

    const srcset = {
      webp: buildSrcset("webp"),
      avif: buildSrcset("avif"),
      jpeg: buildSrcset("jpg"),
    };

    return {
      urls,
      srcset,
    };
  }
);
