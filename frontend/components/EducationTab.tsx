import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { ProfileData } from '~backend/profile/get_profile';

interface EducationTabProps {
  profileData: ProfileData;
  onRefresh: () => Promise<void>;
}

export default function EducationTab({ profileData, onRefresh }: EducationTabProps) {
  const { toast } = useToast();

  const handleCreateEducation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await backend.profile.createEducation({
        institution: fd.get('institution') as string,
        location: fd.get('eduLocation') as string,
        startYear: parseInt(fd.get('startYear') as string),
        endYear: parseInt(fd.get('endYear') as string)
      });
      toast({ title: 'Success', description: 'Education added' });
      await onRefresh();
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to add education:', err);
      toast({ title: 'Error', description: 'Failed to add education', variant: 'destructive' });
    }
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await backend.profile.deleteEducation({ id });
      toast({ title: 'Success', description: 'Education deleted' });
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete education:', err);
      toast({ title: 'Error', description: 'Failed to delete education', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Add Education</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateEducation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="institution" className="text-gray-300">Institution</Label>
              <Input id="institution" name="institution" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="eduLocation" className="text-gray-300">Location</Label>
              <Input id="eduLocation" name="eduLocation" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="startYear" className="text-gray-300">Start Year</Label>
              <Input id="startYear" name="startYear" type="number" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="endYear" className="text-gray-300">End Year</Label>
              <Input id="endYear" name="endYear" type="number" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Add Education</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Education History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData.education.map(edu => (
              <div key={edu.id} className="p-4 bg-gray-700/30 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{edu.institution}</h3>
                  <p className="text-gray-400">
                    {edu.location} • {edu.startYear} - {edu.endYear}
                  </p>
                </div>
                <Button onClick={() => handleDeleteEducation(edu.id)} variant="destructive" size="sm">Delete</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
