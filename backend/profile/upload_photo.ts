import { api } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";
import { profileDB } from "./db";

const profilePhotos = new Bucket("profile-photos", {
  public: true,
});

export interface UploadPhotoRequest {
  photoData: string; // base64 encoded image data
  fileName: string;
}

export interface UploadPhotoResponse {
  success: boolean;
  photoUrl: string;
}

// Uploads a new profile photo with higher quality support
export const uploadPhoto = api<UploadPhotoRequest, UploadPhotoResponse>(
  { expose: true, method: "POST", path: "/profile/photo" },
  async (req) => {
    // Convert base64 to buffer
    const base64Data = req.photoData.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    // Validate file size (max 10MB for HD quality)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.length > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const extension = req.fileName.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Ensure we support common image formats
    const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!supportedFormats.includes(extension)) {
      throw new Error("Unsupported file format. Please use JPG, PNG, GIF, or WebP");
    }
    
    const uniqueFileName = `profile-hd-${timestamp}.${extension}`;
    
    // Determine content type
    let contentType = `image/${extension}`;
    if (extension === 'jpg') {
      contentType = 'image/jpeg';
    }
    
    // Upload to bucket with optimized settings for HD images
    await profilePhotos.upload(uniqueFileName, buffer, {
      contentType: contentType,
    });
    
    // Get public URL
    const photoUrl = profilePhotos.publicUrl(uniqueFileName);
    
    // Update profile in database
    await profileDB.exec`
      UPDATE profiles 
      SET photo_url = ${photoUrl},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM profiles ORDER BY id DESC LIMIT 1)
    `;
    
    return {
      success: true,
      photoUrl,
    };
  }
);
