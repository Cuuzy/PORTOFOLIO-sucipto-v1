import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Trash2, CheckCircle2, Clock, Reply, X, type LucideIcon } from 'lucide-react';
import backend from '@/lib/backend';
import type { ContactMessage } from '~backend/profile/contact';

interface ReplyModal {
  message: ContactMessage;
  subject: string;
  body: string;
}

export default function ContactManagement() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState<ReplyModal | null>(null);
  const [replying, setReplying] = useState(false);
  const { toast } = useToast();

  const loadMessages = async () => {
    try {
      const response = await backend.profile.listContactMessages({});
      setMessages(response.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await backend.profile.updateContactMessageStatus({ id, status });
      toast({
        title: 'Success',
        description: 'Message status updated'
      });
      loadMessages();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update message status',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await backend.profile.deleteContactMessage({ id });
      toast({
        title: 'Success',
        description: 'Message deleted'
      });
      loadMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
  };

  const openReplyModal = (message: ContactMessage) => {
    setReplyModal({
      message,
      subject: message.subject ? `Re: ${message.subject}` : 'Re: Your message',
      body: `Hi ${message.name},\n\nThank you for reaching out.\n\n`,
    });
  };

  const handleSendReply = async () => {
    if (!replyModal) return;
    setReplying(true);
    try {
      await backend.profile.replyContactMessage({
        id: replyModal.message.id,
        subject: replyModal.subject,
        body: replyModal.body,
      });
      toast({
        title: 'Reply sent',
        description: `Reply sent to ${replyModal.message.email}`
      });
      setReplyModal(null);
      loadMessages();
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply email',
        variant: 'destructive'
      });
    } finally {
      setReplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: LucideIcon }> = {
      unread: { label: 'Unread', className: 'bg-yellow-600 text-white', icon: Clock },
      read: { label: 'Read', className: 'bg-blue-600 text-white', icon: Mail },
      replied: { label: 'Replied', className: 'bg-green-600 text-white', icon: CheckCircle2 }
    };

    const variant = variants[status] || variants.unread;
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
          Loading messages...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <div>
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Reply className="w-4 h-4 text-teal-400" />
                  Reply to {replyModal.message.name}
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">{replyModal.message.email}</p>
              </div>
              <button
                onClick={() => setReplyModal(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50">
                <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Original message</p>
                <p className="text-gray-300 text-sm line-clamp-3">{replyModal.message.message}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Subject</Label>
                <Input
                  value={replyModal.subject}
                  onChange={(e) => setReplyModal({ ...replyModal, subject: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Message</Label>
                <Textarea
                  value={replyModal.body}
                  onChange={(e) => setReplyModal({ ...replyModal, body: e.target.value })}
                  rows={8}
                  className="bg-gray-800 border-gray-600 text-white resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-700">
              <Button
                onClick={() => setReplyModal(null)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={replying}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendReply}
                disabled={replying || !replyModal.subject.trim() || !replyModal.body.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Reply className="w-4 h-4 mr-1.5" />
                {replying ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Messages ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No messages yet</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{message.name}</h3>
                        {getStatusBadge(message.status)}
                      </div>
                      <p className="text-gray-400 text-sm">{message.email}</p>
                      {message.subject && (
                        <p className="text-teal-400 text-sm mt-1">
                          Subject: {message.subject}
                        </p>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(message.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="bg-gray-800/50 p-3 rounded border border-gray-600/20 mb-3">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      onClick={() => openReplyModal(message)}
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    {message.status !== 'read' && (
                      <Button
                        onClick={() => handleUpdateStatus(message.id, 'read')}
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                      >
                        Mark as Read
                      </Button>
                    )}
                    {message.status !== 'replied' && (
                      <Button
                        onClick={() => handleUpdateStatus(message.id, 'replied')}
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-400 hover:bg-green-600/20"
                      >
                        Mark as Replied
                      </Button>
                    )}
                    {message.status !== 'unread' && (
                      <Button
                        onClick={() => handleUpdateStatus(message.id, 'unread')}
                        size="sm"
                        variant="outline"
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                      >
                        Mark as Unread
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(message.id)}
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
                {messages.filter(m => m.status === 'unread').length}
              </div>
              <div className="text-gray-400 text-sm">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {messages.filter(m => m.status === 'read').length}
              </div>
              <div className="text-gray-400 text-sm">Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {messages.filter(m => m.status === 'replied').length}
              </div>
              <div className="text-gray-400 text-sm">Replied</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
