import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import backend from '~backend/client';
import type { ClientLogo } from '~backend/profile/manage_client_logos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LazyImage } from './LazyImage';

export default function ClientLogosShowcase() {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await backend.profile.getClientLogos();
        setLogos(response.logos);
      } catch (error) {
        console.error('Failed to fetch client logos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogos();
  }, []);

  if (loading || logos.length === 0) return null;

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          Trusted By
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center"
              title={logo.description || logo.companyName}
            >
              {logo.websiteUrl ? (
                <a
                  href={logo.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <LazyImage
                    src={logo.logoUrl}
                    alt={logo.companyName}
                    className="filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100 h-16"
                    placeholderClassName="bg-white/5"
                  />
                </a>
              ) : (
                <LazyImage
                  src={logo.logoUrl}
                  alt={logo.companyName}
                  className="filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100 h-16"
                  placeholderClassName="bg-white/5"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Collaborating with leading organizations to deliver excellence
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
