import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Code, GraduationCap, Award, Wrench, Share2, FolderOpen, BookOpen, Mail, Quote, FileCheck, Briefcase, Building2, BarChart2, Bell, Megaphone, CircleDot, HandCoins } from 'lucide-react';
import backend from '@/lib/backend';
import type { ProfileData } from '~backend/profile/get_profile';
import BlogManagement from '../components/BlogManagement';
import ContactManagement from '../components/ContactManagement';
import TestimonialsManagement from '../components/TestimonialsManagement';
import CertificateSubmissionManagement from '../components/CertificateSubmissionManagement';
import ClientLogosManagement from '../components/ClientLogosManagement';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import NewsletterManagement from '../components/NewsletterManagement';
import AnnouncementManagement from '../components/AnnouncementManagement';
import AvailabilityManagement from '../components/AvailabilityManagement';
import ServicesManagement from '../components/ServicesManagement';
import ProfileTab from '../components/ProfileTab';
import SkillsTab from '../components/SkillsTab';
import EducationTab from '../components/EducationTab';
import CertificatesTab from '../components/CertificatesTab';
import ToolsTab from '../components/ToolsTab';
import SocialMediaTab from '../components/SocialMediaTab';
import ProjectsTab from '../components/ProjectsTab';
import WorkExperienceTab from '../components/WorkExperienceTab';

export default function AdminDashboard() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProfile = async () => {
    const data = await backend.profile.getProfile();
    setProfileData(data);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin');
        return;
      }

      try {
        const response = await backend.profile.verifyToken({ token });
        if (!response.valid) {
          localStorage.removeItem('adminToken');
          navigate('/admin');
          return;
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('adminToken');
        navigate('/admin');
        return;
      }

      try {
        await fetchProfile();
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Failed to load data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => window.open('/', '_blank')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              View Profile
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700 flex flex-wrap">
            <TabsTrigger value="profile" className="data-[state=active]:bg-teal-600">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-teal-600">
              <Code className="w-4 h-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-teal-600">
              <FolderOpen className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-teal-600">
              <Share2 className="w-4 h-4 mr-2" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-teal-600">
              <GraduationCap className="w-4 h-4 mr-2" />
              Education
            </TabsTrigger>
            <TabsTrigger value="work-experience" className="data-[state=active]:bg-teal-600">
              <Briefcase className="w-4 h-4 mr-2" />
              Work Experience
            </TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-teal-600">
              <Award className="w-4 h-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-teal-600">
              <Wrench className="w-4 h-4 mr-2" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-teal-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-teal-600">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-teal-600">
              <Quote className="w-4 h-4 mr-2" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="cert-submissions" className="data-[state=active]:bg-teal-600">
              <FileCheck className="w-4 h-4 mr-2" />
              Certificate Submissions
            </TabsTrigger>
            <TabsTrigger value="client-logos" className="data-[state=active]:bg-teal-600">
              <Building2 className="w-4 h-4 mr-2" />
              Client Logos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-teal-600">
              <BarChart2 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="data-[state=active]:bg-teal-600">
              <Bell className="w-4 h-4 mr-2" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-teal-600">
              <Megaphone className="w-4 h-4 mr-2" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="availability" className="data-[state=active]:bg-teal-600">
              <CircleDot className="w-4 h-4 mr-2" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-teal-600">
              <HandCoins className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab profileData={profileData} onRefresh={fetchProfile} />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsTab profileData={profileData} onRefresh={fetchProfile} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab profileData={profileData} onRefresh={fetchProfile} />
          </TabsContent>

          <TabsContent value="social">
            <SocialMediaTab profileData={profileData} onRefresh={fetchProfile} />
          </TabsContent>

          <TabsContent value="education">
            <EducationTab profileData={profileData} onRefresh={fetchProfile} />
          </TabsContent>

          <TabsContent value="work-experience">
            <WorkExperienceTab profileData={profileData} onRefresh={fetchProfile} />
          </TabsContent>

          <TabsContent value="certificates">
            <CertificatesTab profileData={profileData} onRefresh={fetchProfile} />
          </TabsContent>

          <TabsContent value="tools">
            <ToolsTab profileData={profileData} onRefresh={fetchProfile} />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>

          <TabsContent value="contact">
            <ContactManagement />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsManagement />
          </TabsContent>

          <TabsContent value="cert-submissions">
            <CertificateSubmissionManagement />
          </TabsContent>

          <TabsContent value="client-logos">
            <ClientLogosManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterManagement />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementManagement />
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityManagement />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
