import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Code, Award, GraduationCap, Wrench, Instagram, Linkedin, Github, Twitter, Globe, Download, BookOpen, Briefcase, BarChart2, Radar, GitBranch } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import backend from '~backend/client';
import type { ProfileData } from '~backend/profile/get_profile';
import type { Availability } from '~backend/profile/availability';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ContactForm from '../components/ContactForm';
import TestimonialsSection from '../components/TestimonialsSection';
import ClientLogosShowcase from '../components/ClientLogosShowcase';
import { ThemeToggle } from '../components/ThemeToggle';
import SEOHead from '../components/SEOHead';
import { LazyImage } from '../components/LazyImage';
import SkillsRadarChart from '../components/SkillsRadarChart';
import SkillTreeVisualization from '../components/SkillTreeVisualization';
import NewsletterForm from '../components/NewsletterForm';
import ServicesSection from '../components/ServicesSection';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';

export default function ProfilePage() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [skillsAnimated, setSkillsAnimated] = useState(false);
  const [skillView, setSkillView] = useState<'bars' | 'radar' | 'tree'>('bars');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [data, avail] = await Promise.all([
          backend.profile.getProfile(),
          backend.profile.getAvailability().catch(() => null),
        ]);
        setProfileData(data);
        setAvailability(avail);
        setTimeout(() => setSkillsAnimated(true), 500);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getSkillColor = (percentage: number) => {
    if (percentage >= 90) return 'from-emerald-500 to-green-400';
    if (percentage >= 80) return 'from-blue-500 to-cyan-400';
    if (percentage >= 70) return 'from-yellow-500 to-orange-400';
    if (percentage >= 60) return 'from-orange-500 to-red-400';
    return 'from-red-500 to-pink-400';
  };

  const getSkillLevel = (percentage: number) => {
    if (percentage >= 90) return t.expert;
    if (percentage >= 80) return t.advanced;
    if (percentage >= 70) return t.intermediate;
    if (percentage >= 60) return t.beginner;
    return t.learning;
  };

  const SkillBar = ({ skill, index }: { skill: ProfileData['skills'][number]; index: number }) => (
    <div
      className="group hover:scale-[1.015] transition-all duration-300 p-4 rounded-xl bg-gradient-to-r from-gray-800/30 to-gray-700/30 border border-gray-600/30 hover:border-teal-500/40"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-white font-medium text-sm">{skill.name}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-teal-400 font-bold text-lg">{skill.percentage}%</span>
            <Badge
              variant="secondary"
              className={`text-xs px-2 py-1 bg-gradient-to-r ${getSkillColor(skill.percentage)} text-white border-0`}
            >
              {getSkillLevel(skill.percentage)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getSkillColor(skill.percentage)} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
            style={{
              width: skillsAnimated ? `${skill.percentage}%` : '0%'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
        </div>
        <div
          className="absolute top-0 h-3 w-0.5 bg-white/60 rounded-full transition-all duration-1000 ease-out"
          style={{
            left: skillsAnimated ? `${skill.percentage}%` : '0%',
            transform: 'translateX(-50%)'
          }}
        ></div>
      </div>
    </div>
  );

  const handleDownloadCV = async () => {
    if (!profileData) return;
    
    try {
      await backend.profile.trackActivity({
        activityType: 'cv_download',
        description: 'Someone downloaded the CV',
      });
    } catch (error) {
      console.error('Failed to track download:', error);
    }
    
    window.print();
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'github':
        return <Github className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'website':
        return <Globe className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const getSocialColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600';
      case 'linkedin':
        return 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';
      case 'github':
        return 'from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900';
      case 'twitter':
        return 'from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600';
      case 'website':
        return 'from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600';
      default:
        return 'from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">{t.loading}</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">{t.profileNotFound}</div>
      </div>
    );
  }

  const { profile, skills, education, certificates, tools, socialMedia, projects, workExperience } = profileData;

  const displayTitle = language === 'EN' && profile.titleEn ? profile.titleEn : profile.title;
  const displayBio = language === 'EN' && profile.bioEn ? profile.bioEn : profile.bio;

  const generalSkills = skills.filter(s => s.category !== 'management');
  const managementSkills = skills.filter(s => s.category === 'management');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground">
      <SEOHead 
        title="Ito Setia Bhakti - HR Professional & Technology Enthusiast"
        description="Experienced HR professional with expertise in talent management, organizational development, and HR technology. View my portfolio, projects, and professional experience."
        keywords="Ito Setia Bhakti, HR professional, talent management, organizational development, human resources, Indonesia, recruitment, training, employee development, portfolio"
        type="profile"
      />
      {/* Navigation Header */}
      <div className="container mx-auto px-4 py-4 no-print">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 max-w-sm">
            <SearchBar placeholder="Search posts & projects..." />
          </div>
          <div className="flex justify-end gap-3">
          {/* Language Toggle */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
            <button
              onClick={() => setLanguage('ID')}
              className={`px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                language === 'ID'
                  ? 'bg-teal-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLanguage('EN')}
              className={`px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                language === 'EN'
                  ? 'bg-teal-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
          </div>
          <ThemeToggle />
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg text-teal-400 hover:text-teal-300 hover:border-teal-500/50 transition-all duration-300"
          >
            <BookOpen className="w-4 h-4" />
            {t.blogArticles}
          </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="relative mx-auto mb-6">
                    <div className="relative w-48 h-48 mx-auto">
                      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-teal-500/30 via-blue-500/20 to-purple-500/20 blur-[6px] opacity-60"></div>
                      <div className="relative w-full h-full rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-xl shadow-black/40 bg-gray-900">
                        <LazyImage
                          src={profile.photoUrl || '/api/placeholder/192/192'}
                          alt={profile.name}
                          className=""
                          eager={true}
                          aspectRatio="1/1"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>
                    <p className="text-teal-400 font-medium">{displayTitle}</p>
                    {displayBio && (
                      <p className="text-gray-400 text-sm leading-relaxed mt-2">{displayBio}</p>
                    )}
                    {availability && (
                      <div className="flex justify-center mt-3">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
                            availability.status === 'available'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : availability.status === 'busy'
                              ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                              : 'bg-red-500/15 border-red-500/30 text-red-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full animate-pulse ${
                              availability.status === 'available'
                                ? 'bg-emerald-400'
                                : availability.status === 'busy'
                                ? 'bg-yellow-400'
                                : 'bg-red-400'
                            }`}
                          />
                          <span className="capitalize">
                            {availability.status === 'available'
                              ? t.available
                              : availability.status === 'busy'
                              ? t.busy
                              : t.unavailable}
                          </span>
                          {availability.message && (
                            <span className="text-xs opacity-75">· {availability.message}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Download CV Button */}
                  <div className="mt-4 no-print">
                    <Button 
                      className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      onClick={handleDownloadCV}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t.downloadCV}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-300 p-3 rounded-lg bg-gray-700/30">
                    <MapPin className="w-5 h-5 text-teal-400" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 p-3 rounded-lg bg-gray-700/30">
                    <Mail className="w-5 h-5 text-teal-400" />
                    <span className="break-all">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 p-3 rounded-lg bg-gray-700/30">
                    <Phone className="w-5 h-5 text-teal-400" />
                    <span>{profile.phone}</span>
                  </div>
                </div>

                {/* Social Media Links */}
                {socialMedia && socialMedia.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">{t.connectWithMe}</h3>
                    <div className="flex flex-wrap gap-3">
                      {socialMedia.map((social, index) => (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${getSocialColor(social.platform)} text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {getSocialIcon(social.platform)}
                          <span className="text-sm font-medium">{social.platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Visualization */}
                {skills.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
                        <Code className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-white">{t.skills}</h2>
                    </div>

                    <div className="flex gap-1.5 mb-5 p-1 bg-gray-800/60 rounded-xl border border-gray-700/50">
                      <button
                        onClick={() => setSkillView('bars')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                          skillView === 'bars'
                            ? 'bg-teal-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        {t.bars}
                      </button>
                      <button
                        onClick={() => setSkillView('radar')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                          skillView === 'radar'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <Radar className="w-3.5 h-3.5" />
                        {t.radar}
                      </button>
                      <button
                        onClick={() => setSkillView('tree')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                          skillView === 'tree'
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        {t.tree}
                      </button>
                    </div>

                    {skillView === 'bars' && (
                      <div className="space-y-4">
                        {generalSkills.length > 0 && (
                          <>
                            {managementSkills.length > 0 && (
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.technical}</p>
                            )}
                            {generalSkills.map((skill, index) => (
                              <SkillBar key={skill.id} skill={skill} index={index} />
                            ))}
                          </>
                        )}
                        {managementSkills.length > 0 && (
                          <>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6">{t.management}</p>
                            {managementSkills.map((skill, index) => (
                              <SkillBar key={skill.id} skill={skill} index={index} />
                            ))}
                          </>
                        )}
                      </div>
                    )}

                    {skillView === 'radar' && (
                      <SkillsRadarChart skills={skills} />
                    )}

                    {skillView === 'tree' && (
                      <SkillTreeVisualization skills={skills} />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Projects */}
            {projects && projects.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    {t.featuredProjects}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project, index) => (
                      <div
                        key={project.id}
                        className="bg-gradient-to-r from-gray-700/30 to-gray-600/20 rounded-xl p-6 border border-gray-600/30 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02] group"
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        {project.imageUrl && (
                          <div className="mb-4 rounded-lg overflow-hidden">
                            <LazyImage
                              src={project.imageUrl}
                              alt={project.title}
                              className="group-hover:scale-105 transition-transform duration-300"
                              aspectRatio="16/9"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold text-white mb-2 text-lg">{project.title}</h3>
                        <p className="text-gray-400 text-sm mb-3 leading-relaxed">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies?.split(',').map((tech, techIndex) => (
                            <Badge
                              key={techIndex}
                              variant="secondary"
                              className="bg-indigo-600/20 text-indigo-300 border border-indigo-600/30 text-xs"
                            >
                              {tech.trim()}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/projects/${project.id}`}>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs"
                            >
                              {t.viewCaseStudy}
                            </Button>
                          </Link>
                          {project.demoUrl && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-xs"
                              onClick={() => window.open(project.demoUrl, '_blank')}
                            >
                              {t.liveDemo}
                            </Button>
                          )}
                          {project.githubUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                              onClick={() => window.open(project.githubUrl, '_blank')}
                            >
                              <Github className="w-3 h-3 mr-1" />
                              {t.code}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* My Tools */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  {t.myTools}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {tools.map((tool, index) => (
                    <Badge
                      key={tool.id}
                      variant="secondary"
                      className="bg-gradient-to-r from-teal-600/20 to-blue-600/20 text-teal-300 border border-teal-600/30 hover:border-teal-400 transition-all duration-300 hover:scale-105 px-4 py-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {tool.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            {workExperience && workExperience.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    {t.workExperience}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {workExperience.map((work, index) => (
                      <div
                        key={work.id}
                        className="relative pl-6 border-l-2 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-gray-800"></div>
                        <div className="space-y-2 pb-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-white text-lg">{work.position}</h3>
                              <p className="text-teal-400 font-semibold">{work.company}</p>
                              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                {work.location && <span>{work.location}</span>}
                                {work.location && <span>•</span>}
                                <span>{work.startDate} - {work.isCurrent ? t.present : work.endDate || t.na}</span>
                                {work.employmentType && (
                                  <>
                                    <span>•</span>
                                    <span className="text-purple-400">{work.employmentType}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {work.isCurrent && (
                              <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
                                {t.present}
                              </Badge>
                            )}
                          </div>
                          {work.description && (
                            <p className="text-gray-300 text-sm leading-relaxed mt-3">{work.description}</p>
                          )}
                          {work.responsibilities && work.responsibilities.length > 0 && (
                            <div className="mt-3">
                              <p className="text-gray-400 text-xs font-semibold mb-2">{t.keyResponsibilities}</p>
                              <ul className="space-y-1.5">
                                {work.responsibilities.map((resp, idx) => (
                                  <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                    <span className="text-purple-400 mt-1">▸</span>
                                    <span>{resp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {work.achievements && work.achievements.length > 0 && (
                            <div className="mt-3">
                              <p className="text-gray-400 text-xs font-semibold mb-2">{t.achievements}</p>
                              <ul className="space-y-1.5">
                                {work.achievements.map((ach, idx) => (
                                  <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                    <span className="text-teal-400 mt-1">✓</span>
                                    <span>{ach}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  {t.education}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <div
                      key={edu.id}
                      className="border-l-4 border-teal-400 pl-6 py-3 bg-gradient-to-r from-gray-700/20 to-transparent rounded-r-lg"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <h3 className="font-semibold text-white text-lg">{edu.institution}</h3>
                      <p className="text-gray-400">{edu.location}</p>
                      <p className="text-teal-400 text-sm font-medium">
                        {edu.startYear} - {edu.endYear}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  {t.certificates}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {certificates.map((cert, index) => (
                    <div
                      key={cert.id}
                      className="bg-gradient-to-r from-gray-700/30 to-gray-600/20 rounded-xl p-6 border border-gray-600/30 hover:border-yellow-500/50 transition-all duration-300 hover:scale-[1.01]"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <h3 className="font-semibold text-white mb-3 text-lg">{cert.title}</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-300 font-medium">{cert.issuer}</span>
                      </div>
                      {cert.description && (
                        <p className="text-gray-400 text-sm mb-3 leading-relaxed">{cert.description}</p>
                      )}
                      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white text-center py-3 rounded-lg text-sm font-medium">
                        {t.issuedOn} {cert.issueDate}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Services / Hire Me Section */}
        <div className="mt-12 no-print" id="services-section">
          <ServicesSection />
        </div>

        {/* Client Logos Section */}
        <div className="mt-12">
          <ClientLogosShowcase />
        </div>

        {/* Testimonials Section */}
        <div className="mt-12 no-print">
          <TestimonialsSection />
        </div>

        {/* Contact Form Section */}
        <div className="mt-12 no-print" id="contact-section">
          <ContactForm />
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 mb-8 no-print flex justify-center">
          <NewsletterForm />
        </div>
      </div>

      {/* Admin Link */}
      <div className="fixed bottom-6 right-6 no-print">
        <a
          href="/admin"
          className="group bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-6 py-3 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          {t.adminLogin}
        </a>
      </div>
    </div>
  );
}
