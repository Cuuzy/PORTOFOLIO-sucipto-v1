import { api } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";
import { profileDB } from "./db";
import { decodeImageUpload } from "./image_upload";

const profilePhotos = new Bucket("profile-photos", {
  public: true,
});

export interface UploadPhotoRequest {
  photoData: string;
  fileName: string;
}

export interface UploadPhotoResponse {
  success: boolean;
  photoUrl: string;
}

export const uploadPhoto = api<UploadPhotoRequest, UploadPhotoResponse>(
  { expose: true, auth: true, method: "POST", path: "/profile/photo" },
  async (req) => {
    const { buffer, extension, contentType } = decodeImageUpload(req.photoData, req.fileName);

    const uniqueFileName = `profile-hd-${Date.now()}.${extension}`;
    await profilePhotos.upload(uniqueFileName, buffer, { contentType });
    const photoUrl = profilePhotos.publicUrl(uniqueFileName);

    await profileDB.exec`
      UPDATE profiles 
      SET photo_url = ${photoUrl},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM profiles ORDER BY id DESC LIMIT 1)
    `;

    return { success: true, photoUrl };
  }
);
