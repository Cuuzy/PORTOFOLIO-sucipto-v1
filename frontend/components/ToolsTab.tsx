import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { ProfileData } from '~backend/profile/get_profile';

interface ToolsTabProps {
  profileData: ProfileData;
  onRefresh: () => Promise<void>;
}

export default function ToolsTab({ profileData, onRefresh }: ToolsTabProps) {
  const { toast } = useToast();

  const handleCreateTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await backend.profile.createTool({
        name: fd.get('toolName') as string,
        iconUrl: (fd.get('toolIconUrl') as string) || undefined
      });
      toast({ title: 'Success', description: 'Tool added' });
      await onRefresh();
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to add tool:', err);
      toast({ title: 'Error', description: 'Failed to add tool', variant: 'destructive' });
    }
  };

  const handleDeleteTool = async (id: number) => {
    try {
      await backend.profile.deleteTool({ id });
      toast({ title: 'Success', description: 'Tool deleted' });
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete tool:', err);
      toast({ title: 'Error', description: 'Failed to delete tool', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Add Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTool} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="toolName" className="text-gray-300">Tool Name</Label>
              <Input id="toolName" name="toolName" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="toolIconUrl" className="text-gray-300">Icon URL (optional)</Label>
              <Input id="toolIconUrl" name="toolIconUrl" className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Add Tool</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData.tools.map(tool => (
              <div key={tool.id} className="p-4 bg-gray-700/30 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{tool.name}</h3>
                  {tool.iconUrl && <p className="text-gray-400 text-sm">{tool.iconUrl}</p>}
                </div>
                <Button onClick={() => handleDeleteTool(tool.id)} variant="destructive" size="sm">Delete</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
