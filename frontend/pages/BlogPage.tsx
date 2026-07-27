import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Tag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchBar from '../components/SearchBar';
import SEOHead from '../components/SEOHead';
import backend from '~backend/client';
import type { BlogPost, ListBlogPostsResponse } from '~backend/profile/manage_blog';
import { LazyImage } from '../components/LazyImage';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { BlogPostsSkeleton } from '../components/Skeletons';

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const postsPerPage = 6;

  useEffect(() => {
    loadPosts();
  }, [currentPage, selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response: ListBlogPostsResponse = await backend.profile.getPublicBlogPosts({
        limit: postsPerPage,
        offset: (currentPage - 1) * postsPerPage,
        published_only: true,
        category: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined
      });
      setPosts(response.posts);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / postsPerPage);
  const categories = ['general', 'hr', 'technology', 'management', 'training'];

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <SEOHead 
        title="Blog & Articles - Ito Setia Bhakti"
        description="Read insights about HR, management, technology, and professional development. Expert articles on talent management, organizational development, and career growth."
        keywords="HR blog, talent management articles, organizational development, career advice, professional development, human resources insights"
        type="website"
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-teal-400 hover:text-teal-300 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Portfolio
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Blog & Articles
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Insights tentang HR, manajemen SDM, teknologi, dan pengembangan karir
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <SearchBar placeholder="Cari artikel & proyek..." className="w-full" />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && <BlogPostsSkeleton />}

        {!loading && (
          <ErrorBoundary sectionName="Blog Posts">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Belum ada artikel yang dipublikasikan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-gray-800/70 transition-all duration-300 hover:scale-105"
                  >
                    {post.featured_image && (
                      <div className="h-48 overflow-hidden">
                        <LazyImage
                          src={post.featured_image}
                          alt={post.title}
                          className="group-hover:scale-110 transition-transform duration-300"
                          aspectRatio="16/9"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-teal-500/20 text-teal-400">
                          <Tag className="w-3 h-3 mr-1" />
                          {post.category}
                        </Badge>
                        {post.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-teal-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      {post.excerpt && (
                        <p className="text-gray-400 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.published_at || post.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.read_time_minutes} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.view_count.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className={currentPage === page 
                        ? "bg-teal-500 hover:bg-teal-600" 
                        : "border-gray-600 text-gray-400 hover:bg-gray-800"
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  Next
                </Button>
              </div>
            )}
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}
