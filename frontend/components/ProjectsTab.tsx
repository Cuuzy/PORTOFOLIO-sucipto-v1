import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { ProfileData } from '~backend/profile/get_profile';

interface ProjectsTabProps {
  profileData: ProfileData;
  onRefresh: () => Promise<void>;
}

export default function ProjectsTab({ profileData, onRefresh }: ProjectsTabProps) {
  const { toast } = useToast();

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await backend.profile.createProject({
        title: fd.get('projectTitle') as string,
        description: fd.get('projectDescription') as string,
        technologies: (fd.get('projectTechnologies') as string) || undefined,
        demoUrl: (fd.get('projectDemoUrl') as string) || undefined,
        githubUrl: (fd.get('projectGithubUrl') as string) || undefined,
        imageUrl: (fd.get('projectImageUrl') as string) || undefined,
        featured: (fd.get('projectFeatured') as string) === 'on'
      });
      toast({ title: 'Success', description: 'Project added' });
      await onRefresh();
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to add project:', err);
      toast({ title: 'Error', description: 'Failed to add project', variant: 'destructive' });
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await backend.profile.deleteProject({ id });
      toast({ title: 'Success', description: 'Project deleted' });
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Add New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="projectTitle" className="text-gray-300">Project Title</Label>
              <Input id="projectTitle" name="projectTitle" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="projectDescription" className="text-gray-300">Description</Label>
              <Textarea id="projectDescription" name="projectDescription" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="projectTechnologies" className="text-gray-300">Technologies (comma separated)</Label>
              <Input id="projectTechnologies" name="projectTechnologies" className="bg-gray-700 border-gray-600 text-white" placeholder="React, Node.js, MongoDB" />
            </div>
            <div>
              <Label htmlFor="projectImageUrl" className="text-gray-300">Image URL</Label>
              <Input id="projectImageUrl" name="projectImageUrl" className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div>
              <Label htmlFor="projectDemoUrl" className="text-gray-300">Demo URL</Label>
              <Input id="projectDemoUrl" name="projectDemoUrl" className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div>
              <Label htmlFor="projectGithubUrl" className="text-gray-300">GitHub URL</Label>
              <Input id="projectGithubUrl" name="projectGithubUrl" className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="projectFeatured" name="projectFeatured" className="rounded border-gray-600 bg-gray-700" />
                <Label htmlFor="projectFeatured" className="text-gray-300">Featured Project</Label>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Add Project</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData.projects.map(project => (
              <div key={project.id} className="p-4 bg-gray-700/30 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{project.title}</h3>
                  <p className="text-gray-400 text-sm">{project.description}</p>
                  {project.technologies && <p className="text-teal-400 text-xs mt-1">{project.technologies}</p>}
                  <p className="text-gray-500 text-xs mt-1">Featured: {project.featured ? 'Yes' : 'No'}</p>
                </div>
                <Button onClick={() => handleDeleteProject(project.id)} variant="destructive" size="sm">Delete</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
