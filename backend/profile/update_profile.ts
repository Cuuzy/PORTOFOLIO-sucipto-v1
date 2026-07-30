import { api, APIError } from "encore.dev/api";
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

export const updateProfile = api<UpdateProfileRequest, UpdateProfileResponse>(
  { expose: true, auth: true, method: "PUT", path: "/profile" },
  async (req) => {
    const name = req.name.trim();
    const title = req.title.trim();
    const location = req.location.trim();
    const email = req.email.trim();
    const phone = req.phone.trim();

    if (!name) {
      throw APIError.invalidArgument("Name is required");
    }
    if (!email) {
      throw APIError.invalidArgument("Email is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw APIError.invalidArgument("Invalid email format");
    }
    if (!location) {
      throw APIError.invalidArgument("Location is required");
    }
    if (!phone) {
      throw APIError.invalidArgument("Phone is required");
    }
    const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      throw APIError.invalidArgument("Invalid phone format");
    }

    await profileDB.exec`
      UPDATE profiles 
      SET name = ${name}, 
          title = ${title}, 
          location = ${location}, 
          email = ${email}, 
          phone = ${phone},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM profiles ORDER BY id DESC LIMIT 1)
    `;

    return { success: true };
  }
);
