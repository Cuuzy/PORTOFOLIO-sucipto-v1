import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Eye, Calendar, Clock, Tag, Save } from 'lucide-react';
import backend from '@/lib/backend';
import type { BlogPost, CreateBlogPostRequest, UpdateBlogPostRequest } from '~backend/profile/manage_blog';
import RichTextEditor from './RichTextEditor';

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastDraftSave, setLastDraftSave] = useState<Date | null>(null);
  const { toast } = useToast();
  const draftTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const categories = ['general', 'hr', 'technology', 'management', 'training'];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await backend.profile.listBlogPosts({ limit: 50 });
      setPosts(response.posts);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = useCallback(async (postId: number, draftContent: string) => {
    if (!postId) return;

    try {
      setIsSavingDraft(true);
      const response = await backend.profile.saveDraft({ id: postId, draft_content: draftContent });
      setLastDraftSave(response.saved_at);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSavingDraft(false);
    }
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);

    if (editingPost?.id) {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current);
      }

      draftTimeoutRef.current = setTimeout(() => {
        saveDraft(editingPost.id, newContent);
      }, 2000);
    }
  }, [editingPost, saveDraft]);

  useEffect(() => {
    return () => {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const tagsValue = (formData.get('tags') as string) || '';
    const tags = tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    try {
      if (editingPost) {
        const updateData: UpdateBlogPostRequest = {
          id: editingPost.id,
          title: formData.get('title') as string,
          slug: formData.get('slug') as string,
          excerpt: formData.get('excerpt') as string || undefined,
          content: content,
          featured_image: formData.get('featured_image') as string || undefined,
          published: formData.get('published') === 'on',
          category: formData.get('category') as string,
          tags
        };
        await backend.profile.updateBlogPost(updateData);
        toast({ title: 'Success', description: 'Blog post updated successfully' });
      } else {
        const createData: CreateBlogPostRequest = {
          title: formData.get('title') as string,
          slug: formData.get('slug') as string,
          excerpt: formData.get('excerpt') as string || undefined,
          content: content,
          featured_image: formData.get('featured_image') as string || undefined,
          published: formData.get('published') === 'on',
          category: formData.get('category') as string,
          tags
        };
        await backend.profile.createBlogPost(createData);
        toast({ title: 'Success', description: 'Blog post created successfully' });
      }
      
      setShowForm(false);
      setEditingPost(null);
      setContent('');
      setLastDraftSave(null);
      loadPosts();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Failed to save blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to save blog post',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      await backend.profile.deleteBlogPost({ id });
      toast({ title: 'Success', description: 'Blog post deleted' });
      loadPosts();
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setContent(post.draft_content || post.content);
    setLastDraftSave(post.draft_saved_at || null);
    setShowForm(true);
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setContent('');
    setLastDraftSave(null);
    setShowForm(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-white">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Blog Management</h2>
        <Button
          onClick={handleNewPost}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {showForm && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </CardTitle>
              {editingPost && (
                <div className="flex items-center gap-2 text-sm">
                  {isSavingDraft && (
                    <span className="text-gray-400 flex items-center gap-1">
                      <Save className="w-3 h-3 animate-pulse" />
                      Saving draft...
                    </span>
                  )}
                  {!isSavingDraft && lastDraftSave && (
                    <span className="text-gray-500 flex items-center gap-1">
                      <Save className="w-3 h-3" />
                      Draft saved at {formatTime(lastDraftSave)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingPost?.title || ''}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    onChange={(e) => {
                      const slugInput = document.getElementById('slug') as HTMLInputElement;
                      if (slugInput && !editingPost) {
                        slugInput.value = generateSlug(e.target.value);
                      }
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className="text-gray-300">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={editingPost?.slug || ''}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt" className="text-gray-300">Excerpt</Label>
                <Input
                  id="excerpt"
                  name="excerpt"
                  defaultValue={editingPost?.excerpt || ''}
                  placeholder="Short description of the post..."
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-gray-300">Content</Label>
                <RichTextEditor
                  content={content}
                  onChange={handleContentChange}
                  placeholder="Write your blog post content here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="featured_image" className="text-gray-300">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    name="featured_image"
                    type="url"
                    defaultValue={editingPost?.featured_image || ''}
                    placeholder="https://example.com/image.jpg"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-gray-300">Category</Label>
                  <Select name="category" defaultValue={editingPost?.category || 'general'}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags" className="text-gray-300">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={editingPost?.tags?.join(', ') || ''}
                  placeholder="react, typescript, tutorial"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="published" 
                  name="published"
                  defaultChecked={editingPost?.published || false}
                />
                <Label htmlFor="published" className="text-gray-300">Publish immediately</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPost(null);
                    setContent('');
                    setLastDraftSave(null);
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

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-8 text-center">
              <p className="text-gray-400">No blog posts yet. Create your first post!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        <Tag className="w-3 h-3 mr-1" />
                        {post.category}
                      </Badge>
                    </div>

                    {post.excerpt && (
                      <p className="text-gray-400 mb-3 line-clamp-2">{post.excerpt}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.published_at || post.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.read_time_minutes} min read
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex gap-1">
                          {post.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="border-gray-600 text-gray-500 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {post.published && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        className="border-gray-600 text-gray-400 hover:bg-gray-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(post)}
                      className="border-gray-600 text-gray-400 hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(post.id)}
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
