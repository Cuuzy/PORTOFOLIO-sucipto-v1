import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Github, Calendar, Clock, User, Building2,
  Lightbulb, Target, CheckCircle2, Code2, Image as ImageIcon, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import SEOHead from '../components/SEOHead';
import backend from '~backend/client';
import type { ProjectDetail } from '~backend/profile/get_project';

export default function ProjectCaseStudyPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, project]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await backend.profile.getProject({ id: Number(id) });
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast({
        title: 'Error',
        description: 'Project not found',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (!project || lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % project.galleryImages.length);
  };

  const prevImage = () => {
    if (!project || lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + project.galleryImages.length) % project.galleryImages.length);
  };

  const technologies = project?.technologies
    ? project.technologies.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-700 rounded w-32" />
            <div className="h-14 bg-gray-700 rounded w-3/4" />
            <div className="h-6 bg-gray-700 rounded w-1/2" />
            <div className="h-72 bg-gray-700 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-700 rounded-xl" />)}
            </div>
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-gray-700 rounded" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Project Not Found</h1>
          <p className="text-gray-400">The project you're looking for doesn't exist.</p>
          <Link to="/">
            <Button variant="outline" className="border-teal-500 text-teal-400 hover:bg-teal-500/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portfolio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <SEOHead
        title={`${project.title} — Case Study`}
        description={project.description}
        keywords={`${technologies.join(', ')}, portfolio, case study, project`}
        image={project.imageUrl}
      />

      {/* Lightbox */}
      {lightboxIndex !== null && project.galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-8 h-8" />
          </button>
          {project.galleryImages.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white/70 hover:text-white transition-colors p-2"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                className="absolute right-4 text-white/70 hover:text-white transition-colors p-2"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}
          <img
            src={project.galleryImages[lightboxIndex]}
            alt={`Gallery image ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 text-white/50 text-sm">
            {lightboxIndex + 1} / {project.galleryImages.length}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">

        {/* Back nav */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portfolio
        </Link>

        {/* Hero */}
        <section className="space-y-6">
          <div className="flex flex-wrap gap-2 items-center">
            {project.featured && (
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">Featured Project</Badge>
            )}
            {project.client && (
              <Badge variant="outline" className="border-gray-600 text-gray-400">
                <Building2 className="w-3 h-3 mr-1" />
                {project.client}
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-gray-100 to-teal-300 bg-clip-text text-transparent">
            {project.title}
          </h1>

          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
            {project.description}
          </p>

          {/* Meta cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {project.client && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  Client
                </div>
                <p className="text-white font-medium text-sm">{project.client}</p>
              </div>
            )}
            {project.duration && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  Duration
                </div>
                <p className="text-white font-medium text-sm">{project.duration}</p>
              </div>
            )}
            {project.role && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  My Role
                </div>
                <p className="text-white font-medium text-sm">{project.role}</p>
              </div>
            )}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Year
              </div>
              <p className="text-white font-medium text-sm">
                {new Date(project.createdAt).getFullYear()}
              </p>
            </div>
          </div>

          {/* CTA links */}
          <div className="flex flex-wrap gap-3">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-teal-600 hover:bg-teal-500 text-white gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </Button>
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 gap-2">
                  <Github className="w-4 h-4" />
                  View Source
                </Button>
              </a>
            )}
          </div>
        </section>

        {/* Hero image */}
        {project.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full object-cover max-h-[480px]"
            />
          </div>
        )}

        {/* Overview / Problem / Solution grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Challenges */}
          {project.challenges && (
            <section className="bg-red-950/20 border border-red-900/30 rounded-2xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">The Problem</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">{project.challenges}</p>
            </section>
          )}

          {/* Solutions */}
          {project.solutions && (
            <section className="bg-teal-950/20 border border-teal-900/30 rounded-2xl p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-teal-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">The Solution</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">{project.solutions}</p>
            </section>
          )}
        </div>

        {/* Technologies */}
        {technologies.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Technologies Used</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-gray-800/70 border border-gray-700/50 rounded-full text-sm text-gray-200 font-medium hover:border-teal-500/50 hover:text-teal-300 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Results / Outcomes */}
        {project.outcomes && (
          <section className="bg-gradient-to-br from-emerald-950/30 to-teal-950/20 border border-emerald-900/30 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Results & Impact</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">{project.outcomes}</p>
          </section>
        )}

        {/* Image Gallery */}
        {project.galleryImages.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Project Gallery</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-gray-700/50 hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <img
                    src={img}
                    alt={`${project.title} screenshot ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-sm text-center">Click any image to view full screen</p>
          </section>
        )}

        {/* Footer nav */}
        <div className="border-t border-gray-800 pt-10 flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Portfolio
            </Button>
          </Link>
          <div className="flex gap-3">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-500 gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </Button>
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 gap-2">
                  <Github className="w-4 h-4" />
                  Source
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
