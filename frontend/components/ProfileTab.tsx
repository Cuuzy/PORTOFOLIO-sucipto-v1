import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import backend from '@/lib/backend';
import type { ProfileData } from '~backend/profile/get_profile';

interface ProfileTabProps {
  profileData: ProfileData;
  onRefresh: () => Promise<void>;
}

export default function ProfileTab({ profileData, onRefresh }: ProfileTabProps) {
  const [photoUploading, setPhotoUploading] = useState(false);
  const { toast } = useToast();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: 'Error', description: 'Image size must be less than 10MB', variant: 'destructive' });
      return;
    }

    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedFormats.includes(file.type.toLowerCase())) {
      toast({ title: 'Error', description: 'Please use JPG, PNG, GIF, or WebP format for best quality', variant: 'destructive' });
      return;
    }

    setPhotoUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const response = await backend.profile.uploadPhoto({ photoData: base64Data, fileName: file.name });
          if (response.success) {
            toast({ title: 'Success', description: 'HD profile photo updated successfully' });
            await onRefresh();
          }
        } catch (error) {
          console.error('Failed to upload photo:', error);
          toast({ title: 'Error', description: 'Failed to upload photo. Please try again.', variant: 'destructive' });
        } finally {
          setPhotoUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to process file:', error);
      toast({ title: 'Error', description: 'Failed to process file', variant: 'destructive' });
      setPhotoUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await backend.profile.updateProfile({
        name: formData.get('name') as string,
        title: formData.get('title') as string,
        location: formData.get('location') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string
      });
      toast({ title: 'Success', description: 'Profile updated successfully' });
      await onRefresh();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Profile Photo (HD Quality)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-[1px] rounded-lg bg-gradient-to-br from-teal-500/30 to-blue-500/20 blur-sm opacity-70"></div>
              <div className="relative w-32 h-32 rounded-lg overflow-hidden ring-1 ring-white/10 bg-gray-700">
                <img
                  src={profileData.profile.photoUrl || '/api/placeholder/128/128'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="photo-upload" className="text-gray-300 block mb-2">
                Upload HD Photo
              </Label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handlePhotoUpload}
                disabled={photoUploading}
                className="bg-gray-700 border-gray-600 text-white file:bg-teal-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
              />
              <div className="mt-2 space-y-1">
                <p className="text-gray-400 text-sm">
                  {photoUploading ? 'Uploading HD photo...' : 'Max size: 10MB for HD quality'}
                </p>
                <p className="text-gray-500 text-xs">Supported formats: JPG, PNG, GIF, WebP</p>
                <p className="text-teal-400 text-xs">Tip: Use 1080p+ images for best clarity</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Edit Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Name</Label>
              <Input id="name" name="name" defaultValue={profileData.profile.name} className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="title" className="text-gray-300">Title</Label>
              <Input id="title" name="title" defaultValue={profileData.profile.title} className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="location" className="text-gray-300">Location</Label>
              <Input id="location" name="location" defaultValue={profileData.profile.location} className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={profileData.profile.email} className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-300">Phone</Label>
              <Input id="phone" name="phone" defaultValue={profileData.profile.phone} className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
