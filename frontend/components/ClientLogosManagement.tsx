import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react';
import backend from '~backend/client';
import type { ClientLogo } from '~backend/profile/manage_client_logos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function ClientLogosManagement() {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    logoUrl: '',
    websiteUrl: '',
    description: '',
    displayOrder: 0,
    active: true,
  });

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const response = await backend.profile.getAllClientLogos({});
      setLogos(response.logos);
    } catch (error) {
      console.error('Failed to fetch logos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load client logos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await backend.profile.updateClientLogo({
          id: editingId,
          ...formData,
        });
        toast({ title: 'Success', description: 'Client logo updated successfully' });
      } else {
        await backend.profile.createClientLogo(formData);
        toast({ title: 'Success', description: 'Client logo created successfully' });
      }

      resetForm();
      fetchLogos();
    } catch (error) {
      console.error('Failed to save logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to save client logo',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (logo: ClientLogo) => {
    setEditingId(logo.id);
    setFormData({
      companyName: logo.companyName,
      logoUrl: logo.logoUrl,
      websiteUrl: logo.websiteUrl || '',
      description: logo.description || '',
      displayOrder: logo.displayOrder,
      active: logo.active,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client logo?')) return;

    try {
      await backend.profile.deleteClientLogo({ id });
      toast({ title: 'Success', description: 'Client logo deleted successfully' });
      fetchLogos();
    } catch (error) {
      console.error('Failed to delete logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete client logo',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      logoUrl: '',
      websiteUrl: '',
      description: '',
      displayOrder: 0,
      active: true,
    });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex justify-between items-center">
          <span>Client Logos Management</span>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Logo
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-700/50 rounded-lg">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="companyName" className="text-white">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div>
                <Label htmlFor="logoUrl" className="text-white">Logo URL *</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  required
                  placeholder="https://example.com/logo.png"
                  className="bg-gray-600 border-gray-500 text-white"
                />
                {formData.logoUrl && (
                  <div className="mt-2 p-4 bg-white rounded-lg">
                    <img src={formData.logoUrl} alt="Preview" className="h-16 object-contain" />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="websiteUrl" className="text-white">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://company.com"
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div>
                <Label htmlFor="displayOrder" className="text-white">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active" className="text-white">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-teal-500 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{logo.companyName}</span>
                    {!logo.active && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(logo)}
                      className="border-gray-500"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(logo.id)}
                      className="border-red-500 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="bg-white p-3 rounded mb-2">
                  <img src={logo.logoUrl} alt={logo.companyName} className="h-12 object-contain mx-auto" />
                </div>

                {logo.description && (
                  <p className="text-gray-400 text-sm mb-2">{logo.description}</p>
                )}

                {logo.websiteUrl && (
                  <a
                    href={logo.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 text-sm hover:underline"
                  >
                    Visit website
                  </a>
                )}

                <p className="text-gray-500 text-xs mt-2">Order: {logo.displayOrder}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
