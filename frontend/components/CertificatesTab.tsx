import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { ProfileData } from '~backend/profile/get_profile';

interface CertificatesTabProps {
  profileData: ProfileData;
  onRefresh: () => Promise<void>;
}

export default function CertificatesTab({ profileData, onRefresh }: CertificatesTabProps) {
  const { toast } = useToast();

  const handleCreateCertificate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await backend.profile.createCertificate({
        title: fd.get('certTitle') as string,
        issuer: fd.get('certIssuer') as string,
        description: (fd.get('certDescription') as string) || undefined,
        issueDate: fd.get('certIssueDate') as string,
        imageUrl: (fd.get('certImageUrl') as string) || undefined
      });
      toast({ title: 'Success', description: 'Certificate added' });
      await onRefresh();
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to add certificate:', err);
      toast({ title: 'Error', description: 'Failed to add certificate', variant: 'destructive' });
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    try {
      await backend.profile.deleteCertificate({ id });
      toast({ title: 'Success', description: 'Certificate deleted' });
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete certificate:', err);
      toast({ title: 'Error', description: 'Failed to delete certificate', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Add Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCertificate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="certTitle" className="text-gray-300">Title</Label>
              <Input id="certTitle" name="certTitle" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="certIssuer" className="text-gray-300">Issuer</Label>
              <Input id="certIssuer" name="certIssuer" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="certIssueDate" className="text-gray-300">Issue Date</Label>
              <Input id="certIssueDate" name="certIssueDate" placeholder="e.g. Oktober 2019" className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="certImageUrl" className="text-gray-300">Image URL (optional)</Label>
              <Input id="certImageUrl" name="certImageUrl" className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="certDescription" className="text-gray-300">Description (optional)</Label>
              <Textarea id="certDescription" name="certDescription" className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Add Certificate</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileData.certificates.map(cert => (
              <div key={cert.id} className="p-4 bg-gray-700/30 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{cert.title}</h3>
                  <p className="text-teal-400">{cert.issuer}</p>
                  {cert.description && <p className="text-gray-400 mt-1">{cert.description}</p>}
                  <p className="text-gray-500 text-sm mt-1">Issued: {cert.issueDate}</p>
                </div>
                <Button onClick={() => handleDeleteCertificate(cert.id)} variant="destructive" size="sm">Delete</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
