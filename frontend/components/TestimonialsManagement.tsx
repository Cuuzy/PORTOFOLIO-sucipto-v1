import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Star, Quote, User, Building } from 'lucide-react';
import backend from '@/lib/backend';
import type { Testimonial, CreateTestimonialRequest, UpdateTestimonialRequest } from '~backend/profile/manage_testimonials';

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const response = await backend.profile.listTestimonials({ limit: 50 });
      setTestimonials(response.testimonials);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load testimonials',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const rating = formData.get('rating') as string;
    const ratingNumber = rating && rating !== '0' ? parseInt(rating) : undefined;

    try {
      if (editingTestimonial) {
        const updateData: UpdateTestimonialRequest = {
          id: editingTestimonial.id,
          name: formData.get('name') as string,
          position: formData.get('position') as string || undefined,
          company: formData.get('company') as string || undefined,
          content: formData.get('content') as string,
          rating: ratingNumber,
          avatar_url: formData.get('avatar_url') as string || undefined,
          featured: formData.get('featured') === 'on'
        };
        await backend.profile.updateTestimonial(updateData);
        toast({ title: 'Success', description: 'Testimonial updated successfully' });
      } else {
        const createData: CreateTestimonialRequest = {
          name: formData.get('name') as string,
          position: formData.get('position') as string || undefined,
          company: formData.get('company') as string || undefined,
          content: formData.get('content') as string,
          rating: ratingNumber,
          avatar_url: formData.get('avatar_url') as string || undefined,
          featured: formData.get('featured') === 'on'
        };
        await backend.profile.createTestimonial(createData);
        toast({ title: 'Success', description: 'Testimonial created successfully' });
      }
      
      setShowForm(false);
      setEditingTestimonial(null);
      loadTestimonials();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to save testimonial',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      await backend.profile.deleteTestimonial({ id });
      toast({ title: 'Success', description: 'Testimonial deleted' });
      loadTestimonials();
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setShowForm(true);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-500">No rating</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-white">Loading testimonials...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Testimonials Management</h2>
        <Button
          onClick={() => {
            setEditingTestimonial(null);
            setShowForm(true);
          }}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Testimonial
        </Button>
      </div>

      {/* Testimonial Form */}
      {showForm && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingTestimonial?.name || ''}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="position" className="text-gray-300">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    defaultValue={editingTestimonial?.position || ''}
                    placeholder="e.g., Senior Developer"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company" className="text-gray-300">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={editingTestimonial?.company || ''}
                    placeholder="e.g., Tech Corp"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="rating" className="text-gray-300">Rating</Label>
                  <Select name="rating" defaultValue={editingTestimonial?.rating?.toString() || '0'}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No rating</SelectItem>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ (4 stars)</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ (3 stars)</SelectItem>
                      <SelectItem value="2">⭐⭐ (2 stars)</SelectItem>
                      <SelectItem value="1">⭐ (1 star)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="content" className="text-gray-300">Testimonial Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingTestimonial?.content || ''}
                  required
                  placeholder="Write the testimonial content here..."
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="avatar_url" className="text-gray-300">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  defaultValue={editingTestimonial?.avatar_url || ''}
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="featured" 
                  name="featured"
                  defaultChecked={editingTestimonial?.featured || false}
                />
                <Label htmlFor="featured" className="text-gray-300">Featured testimonial</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTestimonial(null);
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Testimonials List */}
      <div className="grid gap-4">
        {testimonials.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-8 text-center">
              <p className="text-gray-400">No testimonials yet. Create your first testimonial!</p>
            </CardContent>
          </Card>
        ) : (
          testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {testimonial.avatar_url ? (
                        <img
                          src={testimonial.avatar_url}
                          alt={testimonial.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
                          {testimonial.featured && (
                            <Badge variant="default" className="bg-teal-600">Featured</Badge>
                          )}
                        </div>
                        {(testimonial.position || testimonial.company) && (
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            {testimonial.position && <span>{testimonial.position}</span>}
                            {testimonial.position && testimonial.company && <span>at</span>}
                            {testimonial.company && (
                              <div className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                <span>{testimonial.company}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      {renderStars(testimonial.rating)}
                    </div>

                    <blockquote className="text-gray-300 mb-4 italic">
                      <Quote className="inline w-4 h-4 text-teal-400 mr-1" />
                      {testimonial.content}
                      <Quote className="inline w-4 h-4 text-teal-400 ml-1 rotate-180" />
                    </blockquote>

                    <div className="text-sm text-gray-500">
                      Created: {new Date(testimonial.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(testimonial)}
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(testimonial.id)}
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