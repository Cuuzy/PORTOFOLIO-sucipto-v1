import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { ProfileData } from '~backend/profile/get_profile';

interface WorkExperienceTabProps {
  profileData: ProfileData;
  onRefresh: () => Promise<void>;
}

export default function WorkExperienceTab({ profileData, onRefresh }: WorkExperienceTabProps) {
  const { toast } = useToast();

  const handleCreateWorkExperience = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const responsibilities = (fd.get('workResponsibilities') as string)
        .split('\n')
        .filter(r => r.trim().length > 0);
      const achievements = (fd.get('workAchievements') as string)
        .split('\n')
        .filter(a => a.trim().length > 0);

      await backend.profile.createWorkExperience({
        company: fd.get('workCompany') as string,
        position: fd.get('workPosition') as string,
        location: (fd.get('workLocation') as string) || undefined,
        startDate: fd.get('workStartDate') as string,
        endDate: (fd.get('workEndDate') as string) || undefined,
        isCurrent: (fd.get('workIsCurrent') as string) === 'on',
        description: (fd.get('workDescription') as string) || undefined,
        responsibilities: responsibilities.length > 0 ? responsibilities : undefined,
        achievements: achievements.length > 0 ? achievements : undefined,
        employmentType: (fd.get('workEmploymentType') as string) || undefined
      });
      toast({ title: 'Success', description: 'Work experience added' });
      await onRefresh();
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to add work experience:', err);
      toast({ title: 'Error', description: 'Failed to add work experience', variant: 'destructive' });
    }
  };

  const handleDeleteWorkExperience = async (id: number) => {
    try {
      await backend.profile.deleteWorkExperience({ id });
      toast({ title: 'Success', description: 'Work experience deleted' });
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete work experience:', err);
      toast({ title: 'Error', description: 'Failed to delete work experience', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Add Work Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateWorkExperience} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="workCompany" className="text-gray-300">Company Name</Label>
              <Input id="workCompany" name="workCompany" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="workPosition" className="text-gray-300">Position</Label>
              <Input id="workPosition" name="workPosition" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="workLocation" className="text-gray-300">Location</Label>
              <Input id="workLocation" name="workLocation" className="bg-gray-700 border-gray-600 text-white" placeholder="e.g. Jakarta, Indonesia" />
            </div>
            <div>
              <Label htmlFor="workEmploymentType" className="text-gray-300">Employment Type</Label>
              <select id="workEmploymentType" name="workEmploymentType" className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2">
                <option value="">Select type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div>
              <Label htmlFor="workStartDate" className="text-gray-300">Start Date</Label>
              <Input id="workStartDate" name="workStartDate" placeholder="e.g. Jan 2020" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="workEndDate" className="text-gray-300">End Date</Label>
              <Input id="workEndDate" name="workEndDate" placeholder="e.g. Dec 2022 or leave empty if current" className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="workIsCurrent" name="workIsCurrent" className="rounded border-gray-600 bg-gray-700" />
                <Label htmlFor="workIsCurrent" className="text-gray-300">I currently work here</Label>
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="workDescription" className="text-gray-300">Description</Label>
              <Textarea id="workDescription" name="workDescription" rows={3} className="bg-gray-700 border-gray-600 text-white" placeholder="Brief description of your role..." />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="workResponsibilities" className="text-gray-300">Responsibilities (one per line)</Label>
              <Textarea id="workResponsibilities" name="workResponsibilities" rows={4} className="bg-gray-700 border-gray-600 text-white" placeholder="Managed team of 5 developers&#10;Led product development&#10;..." />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="workAchievements" className="text-gray-300">Achievements (one per line)</Label>
              <Textarea id="workAchievements" name="workAchievements" rows={4} className="bg-gray-700 border-gray-600 text-white" placeholder="Increased revenue by 30%&#10;Reduced costs by 20%&#10;..." />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Add Work Experience</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Work Experience History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData.workExperience.map(work => (
              <div key={work.id} className="p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{work.position}</h3>
                    <p className="text-teal-400 font-medium">{work.company}</p>
                    <p className="text-gray-400 text-sm">
                      {work.location && `${work.location} • `}
                      {work.startDate} - {work.isCurrent ? 'Present' : work.endDate || 'N/A'}
                      {work.employmentType && ` • ${work.employmentType}`}
                    </p>
                    {work.isCurrent && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">Current Position</span>
                    )}
                    {work.description && (
                      <p className="text-gray-300 mt-2 text-sm">{work.description}</p>
                    )}
                    {work.responsibilities && work.responsibilities.length > 0 && (
                      <div className="mt-2">
                        <p className="text-gray-400 text-xs font-semibold mb-1">Responsibilities:</p>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {work.responsibilities.map((resp, idx) => (
                            <li key={idx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {work.achievements && work.achievements.length > 0 && (
                      <div className="mt-2">
                        <p className="text-gray-400 text-xs font-semibold mb-1">Achievements:</p>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {work.achievements.map((ach, idx) => (
                            <li key={idx}>{ach}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button onClick={() => handleDeleteWorkExperience(work.id)} variant="destructive" size="sm">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
