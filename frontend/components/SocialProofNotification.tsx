import { useEffect, useState } from 'react';
import { X, User, FileDown, Eye, Award } from 'lucide-react';
import backend from '~backend/client';
import type { RecentActivity } from '~backend/profile/track_activity';

export default function SocialProofNotification() {
  const [notifications, setNotifications] = useState<RecentActivity[]>([]);
  const [currentNotification, setCurrentNotification] = useState<RecentActivity | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await backend.profile.getRecentActivities();
        setNotifications(response.activities);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifications.length === 0) return;

    const showNextNotification = () => {
      const availableNotifications = notifications.filter(n => !dismissed.has(n.id));
      
      if (availableNotifications.length === 0) return;

      const randomIndex = Math.floor(Math.random() * availableNotifications.length);
      const notification = availableNotifications[randomIndex];
      
      setCurrentNotification(notification);
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 5000);
    };

    const timer = setTimeout(showNextNotification, 5000);
    const interval = setInterval(showNextNotification, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [notifications, dismissed]);

  const handleDismiss = () => {
    if (currentNotification) {
      setDismissed(prev => new Set(prev).add(currentNotification.id));
    }
    setVisible(false);
  };

  const getIcon = (activityType: string) => {
    switch (activityType) {
      case 'cv_download':
        return <FileDown className="w-5 h-5 text-teal-500" />;
      case 'profile_view':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'certificate_view':
        return <Award className="w-5 h-5 text-yellow-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationText = (activity: RecentActivity) => {
    if (activity.description) return activity.description;
    
    switch (activity.activityType) {
      case 'cv_download':
        return 'Someone downloaded the CV';
      case 'profile_view':
        return 'Someone viewed the profile';
      case 'certificate_view':
        return 'Someone viewed a certificate';
      default:
        return 'Recent activity';
    }
  };

  if (!visible || !currentNotification) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left duration-500"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl p-4 pr-12 max-w-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(currentNotification.activityType)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">
              {getNotificationText(currentNotification)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {currentNotification.timeAgo}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 animate-progress"
            style={{ animation: 'progress 5s linear' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress 5s linear;
        }
      `}</style>
    </div>
  );
}
