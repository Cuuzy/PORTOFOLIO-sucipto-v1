import { useEffect, useState } from 'react';
import { Check, Clock, DollarSign, Zap, Code2, Users, BarChart, Globe, Lightbulb, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import backend from '~backend/client';
import type { Service } from '~backend/profile/manage_services';

const iconMap: Record<string, React.ReactNode> = {
  code: <Code2 className="w-7 h-7" />,
  users: <Users className="w-7 h-7" />,
  chart: <BarChart className="w-7 h-7" />,
  globe: <Globe className="w-7 h-7" />,
  lightbulb: <Lightbulb className="w-7 h-7" />,
  briefcase: <Briefcase className="w-7 h-7" />,
  zap: <Zap className="w-7 h-7" />,
};

const gradients = [
  'from-teal-500 to-cyan-500',
  'from-indigo-500 to-purple-500',
  'from-orange-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-blue-500 to-sky-500',
  'from-violet-500 to-fuchsia-500',
];

function getIconNode(iconUrl?: string, index = 0): React.ReactNode {
  if (!iconUrl) {
    const keys = Object.keys(iconMap);
    return iconMap[keys[index % keys.length]];
  }
  const key = Object.keys(iconMap).find(k => iconUrl.includes(k));
  return key ? iconMap[key] : iconMap['briefcase'];
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.profile.listActiveServices()
      .then(res => setServices(res.services))
      .catch(err => console.error('Failed to load services:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (services.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-4">
          <Zap className="w-4 h-4" />
          Available for Hire
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Services I Offer</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Professional services tailored to your needs. Let's work together to achieve your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const gradient = gradients[index % gradients.length];
          const iconNode = getIconNode(service.iconUrl, index);

          return (
            <div
              key={service.id}
              className="group relative bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 hover:border-teal-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/10 backdrop-blur-sm overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} text-white mb-5 shadow-lg`}>
                  {iconNode}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{service.description}</p>

                {service.features.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-2 mt-auto">
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
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-10">
        <Button
          onClick={() => {
            const el = document.getElementById('contact-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-3 rounded-full text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          Get in Touch
        </Button>
      </div>
    </section>
  );
}
