import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Award, Trash2, CheckCircle2, Clock, XCircle, ExternalLink, type LucideIcon } from 'lucide-react';
import backend from '@/lib/backend';
import type { CertificateSubmission } from '~backend/profile/submit_certificate';

export default function CertificateSubmissionManagement() {
  const [submissions, setSubmissions] = useState<CertificateSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSubmissions = async () => {
    try {
      const response = await backend.profile.listCertificateSubmissions();
      setSubmissions(response.submissions);
    } catch (error) {
      console.error('Failed to load certificate submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificate submissions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await backend.profile.updateSubmissionStatus({ id, status });
      toast({
        title: 'Success',
        description: 'Submission status updated'
      });
      loadSubmissions();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update submission status',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      await backend.profile.deleteSubmission({ id });
      toast({
        title: 'Success',
        description: 'Submission deleted'
      });
      loadSubmissions();
    } catch (error) {
      console.error('Failed to delete submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete submission',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: LucideIcon }> = {
      pending: { label: 'Pending', className: 'bg-yellow-600 text-white', icon: Clock },
      approved: { label: 'Approved', className: 'bg-green-600 text-white', icon: CheckCircle2 },
      rejected: { label: 'Rejected', className: 'bg-red-600 text-white', icon: XCircle }
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge className={variant.className}>
        <Icon className="w-3 h-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-8 text-center text-gray-400">
          Loading submissions...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certificate Submissions ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{submission.name}</h3>
                        {getStatusBadge(submission.status)}
                      </div>
                      <p className="text-gray-400 text-sm">{submission.email}</p>
                      <p className="text-teal-400 font-medium mt-2">
                        {submission.certificateTitle}
                      </p>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(submission.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {submission.description && (
                    <div className="bg-gray-800/50 p-3 rounded border border-gray-600/20 mb-3">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {submission.description}
                      </p>
                    </div>
                  )}

                  {submission.certificateFileUrl && (
                    <div className="mb-3">
                      <a
                        href={submission.certificateFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 text-sm hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Certificate
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {submission.status !== 'approved' && (
                      <Button
                        onClick={() => handleUpdateStatus(submission.id, 'approved')}
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-400 hover:bg-green-600/20"
                      >
                        Approve
                      </Button>
                    )}
                    {submission.status !== 'rejected' && (
                      <Button
                        onClick={() => handleUpdateStatus(submission.id, 'rejected')}
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        Reject
                      </Button>
                    )}
                    {submission.status !== 'pending' && (
                      <Button
                        onClick={() => handleUpdateStatus(submission.id, 'pending')}
                        size="sm"
                        variant="outline"
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                      >
                        Mark as Pending
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(submission.id)}
                      size="sm"
                      variant="destructive"
                      className="ml-auto"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {submissions.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-gray-400 text-sm">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {submissions.filter(s => s.status === 'approved').length}
              </div>
              <div className="text-gray-400 text-sm">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {submissions.filter(s => s.status === 'rejected').length}
              </div>
              <div className="text-gray-400 text-sm">Rejected</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
