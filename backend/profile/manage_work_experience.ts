import { api } from "encore.dev/api";
import { profileDB } from "./db";
import { findOrThrow } from "./db_helpers";

export interface WorkExperience {
  id: number;
  company: string;
  position: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  responsibilities: string[] | null;
  achievements: string[] | null;
  employmentType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkExperienceRequest {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  employmentType?: string;
}

export interface UpdateWorkExperienceRequest {
  id: number;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  employmentType?: string;
}

export interface DeleteWorkExperienceRequest {
  id: number;
}

export interface WorkExperienceResponse {
  success: boolean;
}

export const createWorkExperience = api<CreateWorkExperienceRequest, WorkExperienceResponse>(
  { expose: true, method: "POST", path: "/work-experience" },
  async (req) => {
    await profileDB.exec`
      INSERT INTO work_experience (
        company, position, location, start_date, end_date, is_current, 
        description, responsibilities, achievements, employment_type
      )
      VALUES (
        ${req.company}, 
        ${req.position}, 
        ${req.location ?? null}, 
        ${req.startDate}, 
        ${req.endDate ?? null}, 
        ${req.isCurrent ?? false},
        ${req.description ?? null},
        ${req.responsibilities ?? null},
        ${req.achievements ?? null},
        ${req.employmentType ?? null}
      )
    `;
    return { success: true };
  }
);

export const updateWorkExperience = api<UpdateWorkExperienceRequest, WorkExperienceResponse>(
  { expose: true, method: "PUT", path: "/work-experience/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM work_experience WHERE id = ${req.id}`,
      "Work experience"
    );
    await profileDB.exec`
      UPDATE work_experience
      SET company = ${req.company},
          position = ${req.position},
          location = ${req.location ?? null},
          start_date = ${req.startDate},
          end_date = ${req.endDate ?? null},
          is_current = ${req.isCurrent ?? false},
          description = ${req.description ?? null},
          responsibilities = ${req.responsibilities ?? null},
          achievements = ${req.achievements ?? null},
          employment_type = ${req.employmentType ?? null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
    `;
    return { success: true };
  }
);

export const deleteWorkExperience = api<DeleteWorkExperienceRequest, WorkExperienceResponse>(
  { expose: true, method: "DELETE", path: "/work-experience/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM work_experience WHERE id = ${req.id}`,
      "Work experience"
    );
    await profileDB.exec`
      DELETE FROM work_experience WHERE id = ${req.id}
    `;
    return { success: true };
  }
);
