import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { ProfileData } from '~backend/profile/get_profile';

interface SocialMediaTabProps {
  profileData: ProfileData;
  onRefresh: () => Promise<void>;
}

export default function SocialMediaTab({ profileData, onRefresh }: SocialMediaTabProps) {
  const { toast } = useToast();

  const handleCreateSocialMedia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await backend.profile.createSocialMedia({
        platform: fd.get('socialPlatform') as string,
        url: fd.get('socialUrl') as string,
        username: (fd.get('socialUsername') as string) || undefined
      });
      toast({ title: 'Success', description: 'Social media added' });
      await onRefresh();
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to add social media:', err);
      toast({ title: 'Error', description: 'Failed to add social media', variant: 'destructive' });
    }
  };

  const handleDeleteSocialMedia = async (id: number) => {
    try {
      await backend.profile.deleteSocialMedia({ id });
      toast({ title: 'Success', description: 'Social media deleted' });
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete social media:', err);
      toast({ title: 'Error', description: 'Failed to delete social media', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Add Social Media</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSocialMedia} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="socialPlatform" className="text-gray-300">Platform</Label>
              <select id="socialPlatform" name="socialPlatform" className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2" required>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="GitHub">GitHub</option>
                <option value="Twitter">Twitter</option>
                <option value="Website">Website</option>
                <option value="YouTube">YouTube</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>
            <div>
              <Label htmlFor="socialUsername" className="text-gray-300">Username/Handle</Label>
              <Input id="socialUsername" name="socialUsername" className="bg-gray-700 border-gray-600 text-white" placeholder="@username" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="socialUrl" className="text-gray-300">URL</Label>
              <Input id="socialUrl" name="socialUrl" className="bg-gray-700 border-gray-600 text-white" required placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Add Social Media</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Social Media Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData.socialMedia.map(social => (
              <div key={social.id} className="p-4 bg-gray-700/30 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{social.platform}</h3>
                  <p className="text-gray-400 text-sm">{social.username}</p>
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="text-teal-400 text-xs hover:underline">
                    {social.url}
                  </a>
                </div>
                <Button onClick={() => handleDeleteSocialMedia(social.id)} variant="destructive" size="sm">Delete</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
