const SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "gif", "webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export interface DecodeResult {
  buffer: Buffer;
  extension: string;
  contentType: string;
}

export function decodeImageUpload(photoData: string, fileName: string): DecodeResult {
  const base64Data = photoData.replace(/^data:image\/[a-z]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  if (buffer.length > MAX_SIZE) {
    throw new Error("File size exceeds 10MB limit");
  }

  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";

  if (!SUPPORTED_FORMATS.includes(extension)) {
    throw new Error("Unsupported file format. Please use JPG, PNG, GIF, or WebP");
  }

  const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;

  return { buffer, extension, contentType };
}
