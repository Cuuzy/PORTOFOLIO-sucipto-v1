import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import backend from '~backend/client';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    try {
      const response = await backend.profile.sendContactMessage({
        name,
        email,
        subject: subject || undefined,
        message
      });

      setIsSubmitted(true);
      toast({
        title: 'Success!',
        description: response.message || 'Your message has been sent successfully!'
      });
      form.reset();

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to submit contact form:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-teal-400" />
          Get In Touch
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Have a question or want to work together? Send me a message!
        </p>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
            <p className="text-gray-400">
              Thank you for reaching out. I'll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="subject" className="text-gray-300">
                Subject
              </Label>
              <Input
                id="subject"
                name="subject"
                placeholder="What is this about?"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-gray-300">
                Message <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Your message here..."
                rows={5}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 resize-none"
                required
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
