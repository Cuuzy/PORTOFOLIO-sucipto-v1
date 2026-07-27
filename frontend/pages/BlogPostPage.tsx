import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Tag, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import SEOHead from '../components/SEOHead';
import backend from '~backend/client';
import type { BlogPost } from '~backend/profile/manage_blog';
import { LazyImage } from '../components/LazyImage';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { BlogPostDetailSkeleton } from '../components/Skeletons';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const [blogPost] = await Promise.all([
        backend.profile.getPublicBlogPost({ slug: slug! }),
        backend.profile.trackBlogView({ slug: slug! }).then(r => setViewCount(r.view_count)).catch(() => {})
      ]);
      setPost(blogPost);
      if (viewCount === null) setViewCount(blogPost.view_count);
      
      const related = await backend.profile.getPublicBlogPosts({
        limit: 3,
        category: blogPost.category
      });
      setRelatedPosts(related.posts.filter(p => p.id !== blogPost.id));
    } catch (error) {
      console.error('Failed to load blog post:', error);
      toast({
        title: "Error",
        description: "Artikel tidak ditemukan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sharePost = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link disalin!",
      description: "Link artikel telah disalin ke clipboard"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <BlogPostDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Artikel tidak ditemukan</h1>
          <Link to="/blog" className="text-teal-400 hover:text-teal-300">
            Kembali ke Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {post && (
        <SEOHead 
          title={`${post.title} - Ito Setia Bhakti Blog`}
          description={post.excerpt || post.content.substring(0, 160) + '...'}
          keywords={`${post.tags.join(', ')}, ${post.category}, blog, article`}
          image={post.featured_image}
          type="article"
          author="Ito Setia Bhakti"
          publishedTime={new Date(post.published_at || post.created_at).toISOString()}
          modifiedTime={new Date(post.updated_at).toISOString()}
        />
      )}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center text-teal-400 hover:text-teal-300 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Blog
        </Link>

        {/* Article Header */}
        <ErrorBoundary sectionName="Article">
        <article className="mb-12">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-teal-500/20 text-teal-400">
                <Tag className="w-3 h-3 mr-1" />
                {post.category}
              </Badge>
              {post.tags.map(tag => (
                <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-400 mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6 text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.published_at || post.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.read_time_minutes} menit baca
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {(viewCount ?? post.view_count).toLocaleString()} views
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={sharePost}
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Bagikan
              </Button>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <LazyImage
                src={post.featured_image}
                alt={post.title}
                className=""
                aspectRatio="21/9"
                eager={true}
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-a:text-teal-400 prose-code:text-teal-400 prose-pre:bg-gray-800/50"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
          />
        </article>
        </ErrorBoundary>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <ErrorBoundary sectionName="Related Posts">
          <section className="border-t border-gray-800 pt-12">
            <h2 className="text-2xl font-bold text-white mb-8">Artikel Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-gray-800/70 transition-all duration-300"
                >
                  {relatedPost.featured_image && (
                    <div className="h-32 overflow-hidden">
                      <LazyImage
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="group-hover:scale-110 transition-transform duration-300"
                        aspectRatio="16/9"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(relatedPost.published_at || relatedPost.created_at)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}