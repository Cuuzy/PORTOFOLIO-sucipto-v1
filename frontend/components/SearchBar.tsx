import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, FileText, Code2 } from 'lucide-react';
import backend from '~backend/client';
import type { SearchResponse } from '~backend/profile/search';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ placeholder = 'Search...', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await backend.profile.search({ q });
      setResults(res);
      setOpen(true);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasResults = results && (results.blogPosts.length > 0 || results.projects.length > 0);
  const noResults = results && results.blogPosts.length === 0 && results.projects.length === 0;

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setOpen(false);
  };

  const handleSelect = () => {
    setOpen(false);
    setQuery('');
    setResults(null);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results) setOpen(true); }}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full min-w-[320px] rounded-xl border border-border bg-background shadow-xl overflow-hidden">
          {loading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
          )}

          {!loading && noResults && (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results found for &ldquo;{query}&rdquo;</div>
          )}

          {!loading && hasResults && (
            <div className="divide-y divide-border">
              {results.blogPosts.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40">
                    <FileText className="h-3 w-3" />
                    Blog Posts
                  </div>
                  <ul>
                    {results.blogPosts.map((post) => (
                      <li key={post.id}>
                        <Link
                          to={`/blog/${post.slug}`}
                          onClick={handleSelect}
                          className="flex flex-col px-4 py-2.5 hover:bg-accent transition-colors"
                        >
                          <span className="text-sm font-medium text-foreground line-clamp-1">{post.title}</span>
                          {post.excerpt && (
                            <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.excerpt}</span>
                          )}
                          <span className="text-xs text-muted-foreground mt-0.5 capitalize">{post.category}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.projects.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40">
                    <Code2 className="h-3 w-3" />
                    Projects
                  </div>
                  <ul>
                    {results.projects.map((project) => (
                      <li key={project.id}>
                        <Link
                          to={`/projects/${project.id}`}
                          onClick={handleSelect}
                          className="flex flex-col px-4 py-2.5 hover:bg-accent transition-colors"
                        >
                          <span className="text-sm font-medium text-foreground line-clamp-1">{project.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{project.description}</span>
                          {project.technologies && (
                            <span className="text-xs text-muted-foreground mt-0.5">{project.technologies}</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
