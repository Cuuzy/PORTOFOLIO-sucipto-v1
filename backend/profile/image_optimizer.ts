export interface ImageVariant {
  width: number;
  suffix: string;
}

export const IMAGE_VARIANTS: ImageVariant[] = [
  { width: 320, suffix: "xs" },
  { width: 640, suffix: "sm" },
  { width: 1024, suffix: "md" },
  { width: 1920, suffix: "lg" },
  { width: 3840, suffix: "xl" },
];

export interface OptimizedImage {
  format: string;
  buffer: Buffer;
  width: number;
  height: number;
}

export interface ProcessedImageSet {
  original: {
    width: number;
    height: number;
  };
  variants: {
    [key: string]: {
      webp: Buffer;
      avif: Buffer;
      jpeg: Buffer;
    };
  };
}

export async function processImage(
  inputBuffer: Buffer
): Promise<ProcessedImageSet> {
  const sharp = (await import("sharp")).default;
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to read image dimensions");
  }

  const result: ProcessedImageSet = {
    original: {
      width: metadata.width,
      height: metadata.height,
    },
    variants: {},
  };

  for (const variant of IMAGE_VARIANTS) {
    if (variant.width >= metadata.width) {
      continue;
    }

    const resized = image.clone().resize(variant.width, undefined, {
      withoutEnlargement: true,
      fit: "inside",
    });

    const [webp, avif, jpeg] = await Promise.all([
      resized
        .clone()
        .webp({ quality: 85, effort: 4 })
        .toBuffer(),
      resized
        .clone()
        .avif({ quality: 80, effort: 4 })
        .toBuffer(),
      resized
        .clone()
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer(),
    ]);

    result.variants[variant.suffix] = { webp, avif, jpeg };
  }

  const fullSizeImage = image.clone();
  const [webp, avif, jpeg] = await Promise.all([
    fullSizeImage
      .clone()
      .webp({ quality: 90, effort: 4 })
      .toBuffer(),
    fullSizeImage
      .clone()
      .avif({ quality: 85, effort: 4 })
      .toBuffer(),
    fullSizeImage
      .clone()
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer(),
  ]);

  result.variants["original"] = { webp, avif, jpeg };

  return result;
}

export async function optimizeSingleImage(
  inputBuffer: Buffer,
  maxWidth?: number,
  quality = 85
): Promise<{
  webp: Buffer;
  avif: Buffer;
  jpeg: Buffer;
  metadata: { width: number; height: number };
}> {
  const sharp = (await import("sharp")).default;
  let image = sharp(inputBuffer);

  if (maxWidth) {
    image = image.resize(maxWidth, undefined, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  const metadata = await image.metadata();

  const [webp, avif, jpeg] = await Promise.all([
    image
      .clone()
      .webp({ quality, effort: 4 })
      .toBuffer(),
    image
      .clone()
      .avif({ quality: quality - 5, effort: 4 })
      .toBuffer(),
    image
      .clone()
      .jpeg({ quality, mozjpeg: true })
      .toBuffer(),
  ]);

  return {
    webp,
    avif,
    jpeg,
    metadata: {
      width: metadata.width || 0,
      height: metadata.height || 0,
    },
  };
}
