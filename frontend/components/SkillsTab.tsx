import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { ProfileData } from '~backend/profile/get_profile';

interface SkillsTabProps {
  profileData: ProfileData;
  onRefresh: () => Promise<void>;
}

export default function SkillsTab({ profileData, onRefresh }: SkillsTabProps) {
  const { toast } = useToast();

  const handleCreateSkill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await backend.profile.createSkill({
        name: formData.get('skillName') as string,
        percentage: parseInt(formData.get('skillPercentage') as string),
        category: formData.get('skillCategory') as string
      });
      toast({ title: 'Success', description: 'Skill added successfully' });
      await onRefresh();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Failed to create skill:', error);
      toast({ title: 'Error', description: 'Failed to add skill', variant: 'destructive' });
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await backend.profile.deleteSkill({ id });
      toast({ title: 'Success', description: 'Skill deleted successfully' });
      await onRefresh();
    } catch (error) {
      console.error('Failed to delete skill:', error);
      toast({ title: 'Error', description: 'Failed to delete skill', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Add New Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSkill} className="space-y-4">
            <div>
              <Label htmlFor="skillName" className="text-gray-300">Skill Name</Label>
              <Input id="skillName" name="skillName" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="skillPercentage" className="text-gray-300">Percentage (0-100)</Label>
              <Input id="skillPercentage" name="skillPercentage" type="number" min="0" max="100" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="skillCategory" className="text-gray-300">Category</Label>
              <select id="skillCategory" name="skillCategory" className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2" required>
                <option value="general">General Skills</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="technical">Technical</option>
                <option value="marketing">Marketing</option>
                <option value="productivity">Productivity</option>
                <option value="management">Manajemen SDM</option>
              </select>
            </div>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Add Skill</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Current Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData.skills.map(skill => (
              <div key={skill.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">{skill.name}</h3>
                  <p className="text-gray-400">
                    {skill.percentage}% - {skill.category === 'management' ? 'Manajemen SDM' : skill.category}
                  </p>
                </div>
                <Button onClick={() => handleDeleteSkill(skill.id)} variant="destructive" size="sm">Delete</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
