import { api } from "encore.dev/api";
import { profileDB } from "./db";

export interface Profile {
  id: number;
  name: string;
  title: string;
  titleEn?: string;
  bio?: string;
  bioEn?: string;
  location: string;
  email: string;
  phone: string;
  photoUrl?: string;
}

export interface Skill {
  id: number;
  name: string;
  percentage: number;
  category: string;
}

export interface Education {
  id: number;
  institution: string;
  location: string;
  startYear: number;
  endYear: number;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  description?: string;
  issueDate: string;
  imageUrl?: string;
}

export interface Tool {
  id: number;
  name: string;
  iconUrl?: string;
}

export interface SocialMedia {
  id: number;
  platform: string;
  url: string;
  username?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  technologies?: string;
  demoUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  featured: boolean;
}

export interface WorkExperience {
  id: number;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  employmentType?: string;
}

export interface ProfileData {
  profile: Profile;
  skills: Skill[];
  education: Education[];
  certificates: Certificate[];
  tools: Tool[];
  socialMedia: SocialMedia[];
  projects: Project[];
  workExperience: WorkExperience[];
}

export const getProfile = api<void, ProfileData>(
  { expose: true, method: "GET", path: "/profile" },
  async () => {
    const profile = await profileDB.queryRow<Profile>`
      SELECT id, name, title, title_en as "titleEn", bio, bio_en as "bioEn", location, email, phone, photo_url as "photoUrl"
      FROM profiles 
      ORDER BY id DESC 
      LIMIT 1
    `;

    if (!profile) {
      throw new Error("Profile not found");
    }

    const skills = await profileDB.queryAll<Skill>`
      SELECT id, name, percentage, category
      FROM skills 
      ORDER BY percentage DESC
    `;

    const education = await profileDB.queryAll<Education>`
      SELECT id, institution, location, start_year as "startYear", end_year as "endYear"
      FROM education 
      ORDER BY start_year DESC
    `;

    const certificates = await profileDB.queryAll<Certificate>`
      SELECT id, title, issuer, description, issue_date as "issueDate", image_url as "imageUrl"
      FROM certificates 
      ORDER BY id DESC
    `;

    const tools = await profileDB.queryAll<Tool>`
      SELECT id, name, icon_url as "iconUrl"
      FROM tools 
      ORDER BY name
    `;

    const socialMedia = await profileDB.queryAll<SocialMedia>`
      SELECT id, platform, url, username
      FROM social_media 
      ORDER BY id
    `;

    const projects = await profileDB.queryAll<Project>`
      SELECT id, title, description, technologies, demo_url as "demoUrl", github_url as "githubUrl", image_url as "imageUrl", featured
      FROM projects 
      WHERE featured = true
      ORDER BY created_at DESC
    `;

    const workExperience = await profileDB.queryAll<WorkExperience>`
      SELECT 
        id, 
        company, 
        position, 
        location, 
        start_date as "startDate", 
        end_date as "endDate", 
        is_current as "isCurrent",
        description,
        responsibilities,
        achievements,
        employment_type as "employmentType"
      FROM work_experience 
      ORDER BY 
        is_current DESC,
        start_date DESC
    `;

    return {
      profile,
      skills,
      education,
      certificates,
      tools,
      socialMedia,
      projects,
      workExperience,
    };
  }
);
