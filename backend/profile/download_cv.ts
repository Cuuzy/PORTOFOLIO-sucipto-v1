import { api } from "encore.dev/api";
import { profileDB } from "./db";

// Downloads the CV/Resume as a PDF file.
export const downloadCV = api<void, void>(
  { expose: true, method: "GET", path: "/profile/cv/download" },
  async () => {
    // Fetch profile data
    const profile = await profileDB.queryRow<{
      name: string;
      title: string;
      location: string;
      email: string;
      phone: string;
    }>`
      SELECT name, title, location, email, phone
      FROM profiles 
      ORDER BY id DESC 
      LIMIT 1
    `;

    if (!profile) {
      throw new Error("Profile not found");
    }

    const skills = await profileDB.queryAll<{ name: string; percentage: number; category: string }>`
      SELECT name, percentage, category
      FROM skills 
      ORDER BY category, percentage DESC
    `;

    const education = await profileDB.queryAll<{
      institution: string;
      location: string;
      startYear: number;
      endYear: number;
    }>`
      SELECT institution, location, start_year as "startYear", end_year as "endYear"
      FROM education 
      ORDER BY start_year DESC
    `;

    const workExperience = await profileDB.queryAll<{
      company: string;
      position: string;
      location?: string;
      startDate: string;
      endDate?: string;
      isCurrent: boolean;
      description?: string;
    }>`
      SELECT 
        company, 
        position, 
        location, 
        start_date as "startDate", 
        end_date as "endDate", 
        is_current as "isCurrent",
        description
      FROM work_experience 
      ORDER BY is_current DESC, start_date DESC
    `;

    const certificates = await profileDB.queryAll<{
      title: string;
      issuer: string;
      issueDate: string;
    }>`
      SELECT title, issuer, issue_date as "issueDate"
      FROM certificates 
      ORDER BY issue_date DESC
    `;

    // Generate HTML CV
    const html = generateCVHTML(profile, skills, education, workExperience, certificates);

    // Set response headers for HTML download
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${profile.name.replace(/\s+/g, "_")}_CV.html"`,
      },
    }) as unknown as void;
  }
);

function generateCVHTML(
  profile: { name: string; title: string; location: string; email: string; phone: string },
  skills: { name: string; percentage: number; category: string }[],
  education: { institution: string; location: string; startYear: number; endYear: number }[],
  workExperience: {
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
  }[],
  certificates: { title: string; issuer: string; issueDate: string }[]
): string {
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.name} - CV</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #0ea5e9; font-size: 2.5em; margin-bottom: 5px; }
        .header h2 { color: #666; font-size: 1.3em; font-weight: normal; margin-bottom: 15px; }
        .contact-info { display: flex; gap: 20px; flex-wrap: wrap; font-size: 0.95em; color: #555; }
        .contact-info span { display: flex; align-items: center; gap: 5px; }
        .section { margin-bottom: 30px; }
        .section h3 { color: #0ea5e9; font-size: 1.5em; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
        .work-item, .edu-item, .cert-item { margin-bottom: 20px; }
        .work-item h4, .edu-item h4, .cert-item h4 { color: #333; font-size: 1.1em; margin-bottom: 5px; }
        .work-item .meta, .edu-item .meta, .cert-item .meta { color: #666; font-size: 0.9em; margin-bottom: 8px; }
        .work-item p, .cert-item p { color: #555; line-height: 1.7; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .skill-category h4 { color: #0ea5e9; font-size: 1em; margin-bottom: 10px; }
        .skill-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95em; }
        .skill-item span:first-child { color: #333; }
        .skill-item span:last-child { color: #0ea5e9; font-weight: 600; }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${profile.name}</h1>
            <h2>${profile.title}</h2>
            <div class="contact-info">
                <span>📍 ${profile.location}</span>
                <span>📧 ${profile.email}</span>
                <span>📱 ${profile.phone}</span>
            </div>
        </div>

        ${
          workExperience.length > 0
            ? `
        <div class="section">
            <h3>Work Experience</h3>
            ${workExperience
              .map(
                (work) => `
            <div class="work-item">
                <h4>${work.position} - ${work.company}</h4>
                <div class="meta">${work.location ? work.location + " | " : ""}${work.startDate} - ${
                  work.isCurrent ? "Present" : work.endDate
                }</div>
                ${work.description ? `<p>${work.description}</p>` : ""}
            </div>
            `
              )
              .join("")}
        </div>
        `
            : ""
        }

        ${
          education.length > 0
            ? `
        <div class="section">
            <h3>Education</h3>
            ${education
              .map(
                (edu) => `
            <div class="edu-item">
                <h4>${edu.institution}</h4>
                <div class="meta">${edu.location} | ${edu.startYear} - ${edu.endYear}</div>
            </div>
            `
              )
              .join("")}
        </div>
        `
            : ""
        }

        ${
          Object.keys(skillsByCategory).length > 0
            ? `
        <div class="section">
            <h3>Skills</h3>
            <div class="skills-grid">
                ${Object.entries(skillsByCategory)
                  .map(
                    ([category, categorySkills]) => `
                <div class="skill-category">
                    <h4>${category}</h4>
                    ${categorySkills
                      .map(
                        (skill) => `
                    <div class="skill-item">
                        <span>${skill.name}</span>
                        <span>${skill.percentage}%</span>
                    </div>
                    `
                      )
                      .join("")}
                </div>
                `
                  )
                  .join("")}
            </div>
        </div>
        `
            : ""
        }

        ${
          certificates.length > 0
            ? `
        <div class="section">
            <h3>Certificates</h3>
            ${certificates
              .map(
                (cert) => `
            <div class="cert-item">
                <h4>${cert.title}</h4>
                <div class="meta">${cert.issuer} | ${cert.issueDate}</div>
            </div>
            `
              )
              .join("")}
        </div>
        `
            : ""
        }
    </div>
</body>
</html>`;
}
