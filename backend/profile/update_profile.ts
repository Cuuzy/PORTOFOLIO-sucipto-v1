import { api } from "encore.dev/api";
import { profileDB } from "./db";

export interface UpdateProfileRequest {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
}

export interface UpdateProfileResponse {
  success: boolean;
}

// Updates the profile information
export const updateProfile = api<UpdateProfileRequest, UpdateProfileResponse>(
  { expose: true, method: "PUT", path: "/profile" },
  async (req) => {
    await profileDB.exec`
      UPDATE profiles 
      SET name = ${req.name}, 
          title = ${req.title}, 
          location = ${req.location}, 
          email = ${req.email}, 
          phone = ${req.phone},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM profiles ORDER BY id DESC LIMIT 1)
    `;

    return { success: true };
  }
);
