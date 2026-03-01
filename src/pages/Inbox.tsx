import React, { useState } from 'react';
import EmailSidebar from '../components/inbox/EmailSidebar';
import EmailList from '../components/inbox/EmailList';
import EmailViewer from '../components/inbox/EmailViewer';
import EmailComposer from '../components/inbox/EmailComposer';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  message: string;
  preview?: string;
  date: string;
  time: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  type: 'message' | 'videocall' | 'admin' | 'model';
  avatar?: string;
  priority: 'high' | 'normal' | 'low';
  attachments?: Array<{ name: string; size: string; type: string }>;
}

const Inbox: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);

  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      from: 'admin_user',
      to: 'Zafira',
      subject: 'Message from admin_user',
      message:
        "Hi Zafira! I really enjoyed your last stream. You have such amazing energy and I love your personality. I was wondering if you might be available for a private show sometime this week? I'd love to spend some quality time with you. Let me know what works best for your schedule. Looking forward to hearing from you! 💕",
      preview: 'Hi Zafira! I really enjoyed your last stream...',
      date: '2024-09-08',
      time: '1:28:39 AM',
      isRead: false,
      isStarred: true,
      hasAttachment: false,
      type: 'message',
      avatar: '/icons/default-avatar.svg',
      priority: 'normal',
    },
    {
      id: '2',
      from: 'admin_user',
      to: 'Zafira',
      subject: 'VideoCall from admin_user',
      message:
        "Hey beautiful! I had such an amazing time during our video call yesterday. You really know how to make someone feel special. I've been thinking about you all day and I can't wait for our next session. Would you be available for another call this weekend? I have some exciting ideas for what we could do together. Can't wait to see your gorgeous smile again! 😘",
      preview: 'Hey beautiful! I had such an amazing time during our video call...',
      date: '2024-09-08',
      time: '2:00:02 AM',
      isRead: true,
      isStarred: false,
      hasAttachment: true,
      type: 'videocall',
      avatar: '/icons/default-avatar.svg',
      priority: 'high',
      attachments: [
        { name: 'video_call_receipt.pdf', size: '245 KB', type: 'pdf' },
        { name: 'session_photos.zip', size: '1.2 MB', type: 'zip' },
      ],
    },
    {
      id: '3',
      from: 'monitor1',
      to: 'Zafira',
      subject: 'VideoCall from monitor1',
      message:
        "Hello Zafira, I hope you're having a wonderful day! I've been following your content for a while now and I'm really impressed with your professionalism and creativity. I would love to schedule a video call with you to discuss some potential collaboration opportunities. I think we could create some amazing content together. Please let me know your availability and rates. Looking forward to working with you!",
      preview: "Hello Zafira, I hope you're having a wonderful day!...",
      date: '2024-09-13',
      time: '9:47:01 PM',
      isRead: false,
      isStarred: true,
      hasAttachment: false,
      type: 'videocall',
      avatar: '/icons/default-avatar.svg',
      priority: 'normal',
    },
    {
      id: '4',
      from: 'admin@livecharmss.com',
      to: 'Zafira',
      subject: 'Welcome to LiveCharmss - Important Account Information',
      message:
        "Welcome to LiveCharmss, Zafira! We're excited to have you join our community of talented performers. This email contains important information about your account setup and platform guidelines. Please review the attached performer handbook and complete your profile verification within 48 hours. Our support team is here to help you succeed - don't hesitate to reach out if you have any questions. We look forward to seeing your amazing content!",
      preview: "Welcome to LiveCharmss, Zafira! We're excited to have you join...",
      date: '2024-10-22',
      time: '3:49:29 AM',
      isRead: true,
      isStarred: false,
      hasAttachment: true,
      type: 'admin',
      priority: 'high',
      attachments: [
        { name: 'performer_handbook.pdf', size: '2.1 MB', type: 'pdf' },
        { name: 'tax_forms.pdf', size: '156 KB', type: 'pdf' },
      ],
    },
    {
      id: '5',
      from: 'sophia_model',
      to: 'Zafira',
      subject: "Collaboration Opportunity - Let's Work Together!",
      message:
        "Hey girl! I'm Sophia, another model on the platform. I've seen your streams and you're absolutely killing it! I was thinking we could do some collaborative content together - maybe a joint stream or some photo shoots? I think our audiences would love to see us together and it could be great for both of our businesses. I have some really creative ideas that could help us both grow our followings and increase our earnings. What do you think? Would love to chat more about this!",
      preview: "Hey girl! I'm Sophia, another model on the platform...",
      date: '2024-10-25',
      time: '1:07:51 AM',
      isRead: false,
      isStarred: false,
      hasAttachment: false,
      type: 'model',
      avatar: '/icons/default-avatar.svg',
      priority: 'normal',
    },
  ]);

  const unreadCounts = {
    inbox: emails.filter((email) => !email.isRead).length,
    starred: emails.filter((email) => email.isStarred).length,
  };

  const getFilteredEmails = () => {
    switch (selectedFolder) {
      case 'starred':
        return emails.filter((email) => email.isStarred);
      case 'sent':
        return emails.filter((email) => email.from === 'Zafira');
      case 'trash':
        return emails.filter((email) => email.id === 'deleted');
      default:
        return emails;
    }
  };

  const handleToggleStar = (id: string) => {
    setEmails(
      emails.map((email) => (email.id === id ? { ...email, isStarred: !email.isStarred } : email))
    );
  };

  const handleDelete = (id: string) => {
    setEmails(emails.filter((email) => email.id !== id));
    if (selectedEmail === id) {
      setSelectedEmail(null);
    }
  };

  const handleArchive = (id: string) => {
    // In a real app, this would move to archive folder
    console.log('Archive email:', id);
  };

  interface ComposeEmailPayload {
    to: string;
    subject: string;
    message: string;
    priority: 'high' | 'normal' | 'low';
    attachments?: File[];
  }

  const handleSendEmail = (newEmail: ComposeEmailPayload) => {
    const email: Email = {
      ...newEmail,
      id: Date.now().toString(),
      from: 'Zafira',
      isRead: true,
      isStarred: false,
      hasAttachment: (newEmail.attachments?.length ?? 0) > 0,
      preview: newEmail.message.substring(0, 50) + '...',
      time: new Date().toLocaleTimeString(),
      date: new Date().toISOString().split('T')[0],
      attachments: newEmail.attachments?.map((file: File) => ({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.name.split('.').pop() || 'file',
      })),
      type: 'message',
    };
    setEmails((prev) => [email, ...prev]);
  };

  const handleReply = (email: Email) => {
    setReplyToEmail(email);
    setSelectedFolder('compose');
  };

  const currentEmail = selectedEmail ? emails.find((e) => e.id === selectedEmail) : null;
  const filteredEmails = getFilteredEmails();

  // Mark email as read when selected
  React.useEffect(() => {
    if (selectedEmail) {
      setEmails((prev) =>
        prev.map((email) => (email.id === selectedEmail ? { ...email, isRead: true } : email))
      );
    }
  }, [selectedEmail]);

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] flex flex-col lg:flex-row bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-800 border-b border-slate-700 p-4">
        <h1 className="text-xl font-bold text-white">Inbox</h1>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          selectedEmail || selectedFolder === 'compose' ? 'hidden lg:flex' : 'flex'
        } lg:flex`}
      >
        <EmailSidebar
          selectedFolder={selectedFolder}
          setSelectedFolder={(folder) => {
            setSelectedFolder(folder);
            setSelectedEmail(null);
            setReplyToEmail(null);
          }}
          unreadCounts={unreadCounts}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {selectedFolder === 'compose' ? (
          <EmailComposer
            onClose={() => {
              setSelectedFolder('inbox');
              setReplyToEmail(null);
            }}
            onSend={handleSendEmail}
            replyTo={replyToEmail}
          />
        ) : selectedEmail && currentEmail ? (
          <div className="flex-1 flex flex-col">
            {/* Mobile Back Button */}
            <div className="lg:hidden bg-slate-800 border-b border-slate-700 p-3 flex items-center">
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-white hover:text-pink-400 mr-3"
              >
                ← Back
              </button>
              <h2 className="text-white font-medium truncate">{currentEmail.subject}</h2>
            </div>
            <EmailViewer
              email={currentEmail}
              onReply={handleReply}
              onToggleStar={handleToggleStar}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          </div>
        ) : (
          <div className={`${selectedEmail ? 'hidden lg:flex' : 'flex'} flex-1`}>
            <EmailList
              emails={filteredEmails}
              selectedEmail={selectedEmail}
              setSelectedEmail={setSelectedEmail}
              folder={selectedFolder}
              onToggleStar={handleToggleStar}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
