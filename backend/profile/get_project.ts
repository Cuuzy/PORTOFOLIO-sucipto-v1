import { api, APIError } from "encore.dev/api";
import { profileDB } from "./db";

export interface ProjectDetail {
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
  galleryImages: string[];
  client?: string;
  duration?: string;
  role?: string;
  createdAt: string;
}

export interface GetProjectRequest {
  id: number;
}

export interface GetProjectsResponse {
  projects: ProjectDetail[];
}

export const getProject = api<GetProjectRequest, ProjectDetail>(
  { expose: true, method: "GET", path: "/projects/:id" },
  async (req) => {
    const row = await profileDB.queryRow<{
      id: number;
      title: string;
      description: string;
      technologies: string | null;
      demoUrl: string | null;
      githubUrl: string | null;
      imageUrl: string | null;
      featured: boolean;
      challenges: string | null;
      solutions: string | null;
      outcomes: string | null;
      galleryImages: string[] | null;
      client: string | null;
      duration: string | null;
      role: string | null;
      createdAt: string;
    }>`
      SELECT 
        id,
        title,
        description,
        technologies,
        demo_url as "demoUrl",
        github_url as "githubUrl",
        image_url as "imageUrl",
        featured,
        challenges,
        solutions,
        outcomes,
        gallery_images as "galleryImages",
        client,
        duration,
        role,
        created_at as "createdAt"
      FROM projects
      WHERE id = ${req.id}
    `;

    if (!row) {
      throw APIError.notFound("Project not found");
    }

    return {
      ...row,
      technologies: row.technologies ?? undefined,
      demoUrl: row.demoUrl ?? undefined,
      githubUrl: row.githubUrl ?? undefined,
      imageUrl: row.imageUrl ?? undefined,
      challenges: row.challenges ?? undefined,
      solutions: row.solutions ?? undefined,
      outcomes: row.outcomes ?? undefined,
      galleryImages: row.galleryImages ?? [],
      client: row.client ?? undefined,
      duration: row.duration ?? undefined,
      role: row.role ?? undefined,
    };
  }
);

export const getAllProjects = api<void, GetProjectsResponse>(
  { expose: true, method: "GET", path: "/projects" },
  async () => {
    const rows = await profileDB.queryAll<{
      id: number;
      title: string;
      description: string;
      technologies: string | null;
      demoUrl: string | null;
      githubUrl: string | null;
      imageUrl: string | null;
      featured: boolean;
      challenges: string | null;
      solutions: string | null;
      outcomes: string | null;
      galleryImages: string[] | null;
      client: string | null;
      duration: string | null;
      role: string | null;
      createdAt: string;
    }>`
      SELECT 
        id,
        title,
        description,
        technologies,
        demo_url as "demoUrl",
        github_url as "githubUrl",
        image_url as "imageUrl",
        featured,
        challenges,
        solutions,
        outcomes,
        gallery_images as "galleryImages",
        client,
        duration,
        role,
        created_at as "createdAt"
      FROM projects
      ORDER BY created_at DESC
    `;

    return {
      projects: rows.map((row) => ({
        ...row,
        technologies: row.technologies ?? undefined,
        demoUrl: row.demoUrl ?? undefined,
        githubUrl: row.githubUrl ?? undefined,
        imageUrl: row.imageUrl ?? undefined,
        challenges: row.challenges ?? undefined,
        solutions: row.solutions ?? undefined,
        outcomes: row.outcomes ?? undefined,
        galleryImages: row.galleryImages ?? [],
        client: row.client ?? undefined,
        duration: row.duration ?? undefined,
        role: row.role ?? undefined,
      })),
    };
  }
);
