import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Check, DollarSign, Clock, X, GripVertical } from 'lucide-react';
import backend from '@/lib/backend';
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '~backend/profile/manage_services';

const emptyForm = (): Omit<CreateServiceRequest, 'features'> & { features: string; featuresArr: string[] } => ({
  title: '',
  description: '',
  priceRange: '',
  duration: '',
  features: '',
  featuresArr: [],
  iconUrl: '',
  active: true,
  sortOrder: 0,
});

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [featureInput, setFeatureInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await backend.profile.listServices();
      setServices(res.services);
    } catch (error) {
      console.error('Failed to load services:', error);
      toast({ title: 'Error', description: 'Failed to load services', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingService(null);
    setForm(emptyForm());
    setFeatureInput('');
    setShowForm(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      title: service.title,
      description: service.description,
      priceRange: service.priceRange ?? '',
      duration: service.duration ?? '',
      features: '',
      featuresArr: [...service.features],
      iconUrl: service.iconUrl ?? '',
      active: service.active,
      sortOrder: service.sortOrder,
    });
    setFeatureInput('');
    setShowForm(true);
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (!val) return;
    setForm(f => ({ ...f, featuresArr: [...f.featuresArr, val] }));
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setForm(f => ({ ...f, featuresArr: f.featuresArr.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        const req: UpdateServiceRequest = {
          id: editingService.id,
          title: form.title,
          description: form.description,
          priceRange: form.priceRange || undefined,
          duration: form.duration || undefined,
          features: form.featuresArr,
          iconUrl: form.iconUrl || undefined,
          active: form.active,
          sortOrder: form.sortOrder ?? 0,
        };
        await backend.profile.updateService(req);
        toast({ title: 'Success', description: 'Service updated' });
      } else {
        const req: CreateServiceRequest = {
          title: form.title,
          description: form.description,
          priceRange: form.priceRange || undefined,
          duration: form.duration || undefined,
          features: form.featuresArr,
          iconUrl: form.iconUrl || undefined,
          active: form.active,
          sortOrder: form.sortOrder ?? 0,
        };
        await backend.profile.createService(req);
        toast({ title: 'Success', description: 'Service created' });
      }
      setShowForm(false);
      setEditingService(null);
      loadServices();
    } catch (error) {
      console.error('Failed to save service:', error);
      toast({ title: 'Error', description: 'Failed to save service', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this service?')) return;
    try {
      await backend.profile.deleteService({ id });
      toast({ title: 'Success', description: 'Service deleted' });
      loadServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast({ title: 'Error', description: 'Failed to delete service', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="text-white">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Services Management</h2>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          New Service
        </Button>
      </div>

      {showForm && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingService ? 'Edit Service' : 'Create New Service'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Title *</Label>
                  <Input
                    required
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., HR Consulting"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sortOrder}
                    onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Description *</Label>
                <Textarea
                  required
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe what this service entails..."
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Price Range</Label>
                  <Input
                    value={form.priceRange}
                    onChange={e => setForm(f => ({ ...f, priceRange: e.target.value }))}
                    placeholder="e.g., $500 - $2,000"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Duration</Label>
                  <Input
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="e.g., 2-4 weeks"
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Icon (keyword: code, users, chart, globe, lightbulb, briefcase, zap)</Label>
                <Input
                  value={form.iconUrl}
                  onChange={e => setForm(f => ({ ...f, iconUrl: e.target.value }))}
                  placeholder="e.g., briefcase"
                  className="bg-gray-700 border-gray-600 text-white mt-1"
                />
              </div>

              <div>
                <Label className="text-gray-300">Features</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                    placeholder="Add a feature and press Enter"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button type="button" onClick={addFeature} className="bg-teal-600 hover:bg-teal-700 shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {form.featuresArr.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.featuresArr.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                        <GripVertical className="w-4 h-4 text-gray-500 shrink-0" />
                        <Check className="w-4 h-4 text-teal-400 shrink-0" />
                        <span className="text-gray-300 text-sm flex-1">{feat}</span>
                        <button type="button" onClick={() => removeFeature(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={form.active}
                  onCheckedChange={v => setForm(f => ({ ...f, active: v }))}
                  id="active-switch"
                />
                <Label htmlFor="active-switch" className="text-gray-300">Active (visible on profile)</Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  {editingService ? 'Update Service' : 'Create Service'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingService(null); }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {services.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-10 text-center">
              <p className="text-gray-400">No services yet. Create your first service!</p>
            </CardContent>
          </Card>
        ) : (
          services.map(service => (
            <Card key={service.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{service.title}</h3>
                      <Badge className={service.active ? 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' : 'bg-gray-600/20 text-gray-400 border-gray-600/30'}>
                        {service.active ? 'Active' : 'Inactive'}
                      </Badge>
                      {service.priceRange && (
                        <Badge className="bg-teal-600/20 text-teal-300 border-teal-600/30 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {service.priceRange}
                        </Badge>
                      )}
                      {service.duration && (
                        <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-600/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{service.description}</p>
                    {service.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {service.features.map((feat, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-md">
                            <Check className="w-3 h-3 text-teal-400" />
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(service)}
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(service.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
