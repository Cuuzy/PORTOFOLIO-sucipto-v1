import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Award, Send, CheckCircle2 } from 'lucide-react';
import backend from '~backend/client';

export default function CertificateSubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const certificateTitle = formData.get('certificateTitle') as string;
    const certificateFileUrl = formData.get('certificateFileUrl') as string;
    const description = formData.get('description') as string;

    try {
      const response = await backend.profile.submitCertificate({
        name,
        email,
        certificateTitle,
        certificateFileUrl: certificateFileUrl || undefined,
        description: description || undefined
      });

      if (response.success) {
        setIsSubmitted(true);
        toast({
          title: 'Success!',
          description: response.message || 'Your certificate has been submitted successfully!'
        });
        e.currentTarget.reset();

        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to submit certificate',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to submit certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit certificate. Please try again.',
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
          <Award className="w-6 h-6 text-teal-400" />
          Submit Your Certificate
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Share your achievements and certifications with us!
        </p>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Certificate Submitted!</h3>
            <p className="text-gray-400">
              Thank you for sharing your achievement. We'll review it soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cert-name" className="text-gray-300">
                Your Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="cert-name"
                name="name"
                placeholder="Full name"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="cert-email" className="text-gray-300">
                Email <span className="text-red-400">*</span>
              </Label>
              <Input
                id="cert-email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="certificateTitle" className="text-gray-300">
                Certificate Title <span className="text-red-400">*</span>
              </Label>
              <Input
                id="certificateTitle"
                name="certificateTitle"
                placeholder="e.g., AWS Certified Solutions Architect"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="certificateFileUrl" className="text-gray-300">
                Certificate Image/File URL
              </Label>
              <Input
                id="certificateFileUrl"
                name="certificateFileUrl"
                type="url"
                placeholder="https://example.com/certificate.pdf"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                disabled={isSubmitting}
              />
              <p className="text-gray-500 text-xs mt-1">
                Optional: Provide a link to view or download your certificate
              </p>
            </div>

            <div>
              <Label htmlFor="cert-description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="cert-description"
                name="description"
                placeholder="Tell us more about this certification..."
                rows={4}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 resize-none"
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
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Certificate
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
