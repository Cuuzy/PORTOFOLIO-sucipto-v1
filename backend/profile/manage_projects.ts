import { api } from "encore.dev/api";
import { profileDB } from "./db";
import { findOrThrow } from "./db_helpers";

export interface CreateProjectRequest {
  title: string;
  description: string;
  technologies?: string;
  demoUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  featured: boolean;
  challenges?: string;
  solutions?: string;
  outcomes?: string;
  galleryImages?: string[];
  client?: string;
  duration?: string;
  role?: string;
}

export interface UpdateProjectRequest {
  id: number;
  title: string;
  description: string;
  technologies?: string;
  demoUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  featured: boolean;
  challenges?: string;
  solutions?: string;
  outcomes?: string;
  galleryImages?: string[];
  client?: string;
  duration?: string;
  role?: string;
}

export interface DeleteProjectRequest {
  id: number;
}

export interface ProjectResponse {
  success: boolean;
}

export const createProject = api<CreateProjectRequest, ProjectResponse>(
  { expose: true, method: "POST", path: "/projects" },
  async (req) => {
    await profileDB.exec`
      INSERT INTO projects (title, description, technologies, demo_url, github_url, image_url, featured, challenges, solutions, outcomes, gallery_images, client, duration, role)
      VALUES (
        ${req.title}, ${req.description}, ${req.technologies ?? null},
        ${req.demoUrl ?? null}, ${req.githubUrl ?? null}, ${req.imageUrl ?? null},
        ${req.featured}, ${req.challenges ?? null}, ${req.solutions ?? null},
        ${req.outcomes ?? null}, ${req.galleryImages ?? null},
        ${req.client ?? null}, ${req.duration ?? null}, ${req.role ?? null}
      )
    `;
    return { success: true };
  }
);

export const updateProject = api<UpdateProjectRequest, ProjectResponse>(
  { expose: true, method: "PUT", path: "/projects/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM projects WHERE id = ${req.id}`,
      "Project"
    );
    await profileDB.exec`
      UPDATE projects
      SET title = ${req.title},
          description = ${req.description},
          technologies = ${req.technologies ?? null},
          demo_url = ${req.demoUrl ?? null},
          github_url = ${req.githubUrl ?? null},
          image_url = ${req.imageUrl ?? null},
          featured = ${req.featured},
          challenges = ${req.challenges ?? null},
          solutions = ${req.solutions ?? null},
          outcomes = ${req.outcomes ?? null},
          gallery_images = ${req.galleryImages ?? null},
          client = ${req.client ?? null},
          duration = ${req.duration ?? null},
          role = ${req.role ?? null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
    `;
    return { success: true };
  }
);

export const deleteProject = api<DeleteProjectRequest, ProjectResponse>(
  { expose: true, method: "DELETE", path: "/projects/:id" },
  async (req) => {
    await findOrThrow(
      profileDB.queryRow`SELECT id FROM projects WHERE id = ${req.id}`,
      "Project"
    );
    await profileDB.exec`
      DELETE FROM projects WHERE id = ${req.id}
    `;
    return { success: true };
  }
);
