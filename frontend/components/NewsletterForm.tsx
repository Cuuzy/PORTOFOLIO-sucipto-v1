import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await backend.profile.subscribe({ email, name: name || undefined });
      setSubscribed(true);
      toast({ title: 'Subscribed!', description: res.message });
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 border border-gray-600/40 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Stay Updated</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Subscribe to receive updates on new projects, blog posts, and professional insights directly in your inbox.
        </p>

        {subscribed ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle className="w-12 h-12 text-teal-400" />
            <p className="text-white font-medium">You're subscribed!</p>
            <p className="text-gray-400 text-sm">Thank you for joining the newsletter.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newsletter-name" className="text-gray-300 text-sm mb-1.5 block">
                  Name (optional)
                </Label>
                <Input
                  id="newsletter-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-700/60 border-gray-600 text-white placeholder-gray-500 focus:border-teal-500"
                />
              </div>
              <div>
                <Label htmlFor="newsletter-email" className="text-gray-300 text-sm mb-1.5 block">
                  Email address
                </Label>
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700/60 border-gray-600 text-white placeholder-gray-500 focus:border-teal-500"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium transition-all duration-300 hover:scale-[1.02] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Subscribing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Subscribe to Newsletter
                </span>
              )}
            </Button>
            <p className="text-gray-500 text-xs text-center">
              No spam, ever. Unsubscribe at any time.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
