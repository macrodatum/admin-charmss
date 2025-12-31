import React, { useState } from 'react';
import {
  X,
  Search,
  BookOpen,
  Users,
  Building2,
  DollarSign,
  Mail,
  Video,
  Image,
  Settings,
  ChevronRight,
  FileText,
  BarChart3,
  Shield,
  HelpCircle,
  Menu,
} from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: {
    subtitle: string;
    description: string;
    steps?: string[];
    tips?: string[];
  }[];
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    content: [
      {
        subtitle: 'Welcome to the Admin Dashboard',
        description:
          'This comprehensive guide will help you navigate and manage your platform effectively.',
        tips: [
          'Use the sidebar navigation to access different modules',
          'Toggle dark mode using the theme switcher in the header',
          'Your earnings and online status are displayed in the top bar',
          'Use search and filters to quickly find what you need',
        ],
      },
      {
        subtitle: 'Dashboard Overview',
        description:
          'The dashboard provides real-time insights into platform performance, including active performers, earnings, and recent activities.',
        steps: [
          'View total earnings and weekly performance',
          'Monitor active and online performers',
          'Track recent transactions and activities',
          'Access quick actions for common tasks',
        ],
      },
    ],
  },
  {
    id: 'performers',
    title: 'Performer Management',
    icon: Users,
    content: [
      {
        subtitle: 'Managing Performers',
        description:
          'The Performers module allows you to oversee all talent on your platform, including registration, profile management, and performance tracking.',
        steps: [
          'Click "Performers" in the sidebar to view all registered talent',
          'Use search to find specific performers by name, stage name, or email',
          'Filter by status: Online, Offline, Active, Inactive, Pending, or Suspended',
          'Click on any performer to view their detailed profile',
        ],
      },
      {
        subtitle: 'Performer Actions',
        description: 'Each performer card provides quick access to essential actions.',
        steps: [
          'Toggle Status: Activate or deactivate performer accounts',
          'View Profile: Access complete performer information and statistics',
          'Streaming: Monitor or manage live streaming sessions',
          'Upload Assets: Add or manage photos, videos, and other content',
          'Approve Content: Review and approve submitted content before publishing',
        ],
        tips: [
          'Regularly review pending performers for approval',
          'Monitor performer ratings and show counts',
          'Use bulk actions for efficient management',
        ],
      },
      {
        subtitle: 'Content Approval Process',
        description:
          'All performer-submitted content requires admin approval to ensure quality and compliance.',
        steps: [
          'Click "Approve Content" on any performer',
          'Review submitted photos, videos, and stories',
          'Approve or reject content with optional feedback',
          'Approved content is immediately published to the platform',
        ],
      },
    ],
  },
  {
    id: 'studios',
    title: 'Studio Management',
    icon: Building2,
    content: [
      {
        subtitle: 'Understanding Studios',
        description:
          'Studios are recruiting agencies that manage multiple performers. They have delegated rights to register and oversee their talent.',
        steps: [
          'Navigate to "Studios" in the sidebar',
          'View all registered studios with their metrics',
          'Track active and online performers per studio',
          'Monitor studio status and performance',
        ],
      },
      {
        subtitle: 'Studio Operations',
        description: 'Manage studio accounts and their associated performers.',
        steps: [
          'Toggle studio status to activate or deactivate',
          'Click "Edit" to modify studio information',
          'Access "Financial Module" to view earnings and commission structure',
          'Review legal representative and contact details',
        ],
        tips: [
          'Studios can have their own commission rates',
          'Monitor performer count per studio',
          'Regularly review studio financial reports',
        ],
      },
      {
        subtitle: 'Financial Module',
        description:
          'Access detailed financial information for each studio, including performer earnings and payment history.',
        steps: [
          'Click the financial icon on any studio',
          'View total earnings, commissions, and net payments',
          'Review per-performer earnings breakdown',
          'Access complete payment history with dates and methods',
          'Filter by payment status and date range',
        ],
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Earnings',
    icon: DollarSign,
    content: [
      {
        subtitle: 'Payment Dashboard',
        description:
          'The Payments module provides comprehensive financial oversight for all platform transactions.',
        steps: [
          'View total earnings, weekly income, pending and available funds',
          'Monitor weekly payment schedules',
          'Review recent transactions across all revenue streams',
          'Access payment methods configuration',
        ],
      },
      {
        subtitle: 'Payment Methods Drill-Down',
        description: 'Hierarchical view of studios and their models with complete payment details.',
        steps: [
          'Click on any studio to expand and view its models',
          'Click on any model to view detailed payment history',
          'Review total paid, pending amounts, and commission rates',
          'Track payment status and due dates',
          'Minimum commission rate is 50%',
        ],
        tips: [
          'Green indicators show up-to-date payments',
          'Yellow indicates pending payments',
          'Red signals overdue payments requiring immediate attention',
        ],
      },
      {
        subtitle: 'Studio Payments',
        description: "Process payments to studios for their performers' earnings.",
        steps: [
          'Review pending payments with amounts and due dates',
          'Filter by priority: Low, Medium, High, or Urgent',
          'Click "Transfer Payment" on any studio',
          'Review payment details and commission breakdown',
          'Select payment method and add notes if needed',
          'Confirm transfer to process payment',
        ],
        tips: [
          'Urgent payments are highlighted in red',
          'Always verify commission amounts before confirming',
          'Payment confirmations cannot be reversed',
        ],
      },
      {
        subtitle: 'Model Payments',
        description:
          'Process direct payments to independent models and studio-affiliated performers.',
        steps: [
          'View all models requiring payment',
          'Filter by independent or studio-affiliated',
          'Check commission rates (minimum 50%)',
          'Click "Transfer Payment" to process',
          'Review net amount to be paid',
          'Select payment method and confirm',
        ],
      },
      {
        subtitle: 'Payment Methods',
        description: 'Configure available payment methods and their fees.',
        steps: [
          'Bank Transfer: 2% fee, $50 minimum payout',
          'PayPal: 3% fee, $20 minimum payout',
          'Cryptocurrency: 1% fee, $10 minimum payout',
          'Wire Transfer: $15 flat fee, $100 minimum payout',
        ],
      },
    ],
  },
  {
    id: 'inbox',
    title: 'Inbox & Communication',
    icon: Mail,
    content: [
      {
        subtitle: 'Email Management',
        description: 'Manage all platform communications through the integrated inbox system.',
        steps: [
          'Access Inbox from the sidebar',
          'View folders: Inbox, Sent, Drafts, Trash',
          'Compose new messages with rich text editor',
          'Organize emails with labels and filters',
          'Search messages by sender, subject, or content',
        ],
      },
      {
        subtitle: 'Composing Messages',
        description: 'Send professional communications to performers, studios, or system users.',
        steps: [
          'Click "Compose" button',
          'Enter recipient email addresses',
          'Add subject line and message body',
          'Attach files if needed',
          'Send immediately or save as draft',
        ],
      },
    ],
  },
  {
    id: 'content',
    title: 'Content Management',
    icon: Image,
    content: [
      {
        subtitle: 'Photos Management',
        description: 'Review, approve, and manage all photo content on the platform.',
        steps: [
          'Navigate to Photos section',
          'View all submitted photos by performers',
          'Filter by approval status',
          'Review photo quality and compliance',
          'Approve or reject with feedback',
        ],
      },
      {
        subtitle: 'Videos Management',
        description: 'Oversee video content including clips, shows, and recordings.',
        steps: [
          'Access Videos section',
          'Review video submissions',
          'Check content compliance and quality',
          'Approve suitable videos for publishing',
          'Monitor video performance metrics',
        ],
      },
      {
        subtitle: 'Stories Management',
        description: 'Manage time-limited story content posted by performers.',
        steps: [
          'View active and expired stories',
          'Review story content before publishing',
          'Monitor story views and engagement',
          'Remove inappropriate content',
        ],
      },
    ],
  },
  {
    id: 'streaming',
    title: 'Streaming & Video Calls',
    icon: Video,
    content: [
      {
        subtitle: 'Live Streaming',
        description: 'Monitor and manage live streaming sessions across the platform.',
        steps: [
          'Access Streaming module',
          'View all active streams',
          'Monitor viewer counts and engagement',
          'Review stream quality and compliance',
          'End streams if necessary for violations',
        ],
        tips: [
          'Set streaming quality standards',
          'Monitor for terms of service violations',
          'Review stream analytics regularly',
        ],
      },
      {
        subtitle: 'Video Calls',
        description: 'Oversee private video call sessions between performers and users.',
        steps: [
          'Monitor active video calls',
          'Track call duration and pricing',
          'Review call history and earnings',
          'Handle reported issues or complaints',
        ],
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    icon: BarChart3,
    content: [
      {
        subtitle: 'Platform Analytics',
        description: 'Access comprehensive analytics and performance metrics.',
        steps: [
          'View real-time platform statistics',
          'Monitor revenue trends and growth',
          'Track user engagement metrics',
          'Analyze performer performance',
          'Generate custom reports',
        ],
      },
      {
        subtitle: 'Financial Reports',
        description: 'Generate and export detailed financial reports.',
        steps: [
          'Select date range for report',
          'Choose report type: Revenue, Commissions, Payouts',
          'Filter by studio, performer, or payment method',
          'Export reports in CSV or PDF format',
          'Schedule automated report delivery',
        ],
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    icon: Shield,
    content: [
      {
        subtitle: 'Platform Security',
        description: 'Maintain platform security and user data protection.',
        steps: [
          'Monitor suspicious activities',
          'Review security logs regularly',
          'Enforce password policies',
          'Manage user permissions',
          'Respond to security incidents',
        ],
        tips: [
          'Enable two-factor authentication',
          'Regularly update security settings',
          'Review access logs weekly',
          'Maintain data backup procedures',
        ],
      },
      {
        subtitle: 'Compliance Management',
        description: 'Ensure platform compliance with regulations and policies.',
        steps: [
          'Review content moderation policies',
          'Verify performer age and identity',
          'Maintain compliance documentation',
          'Handle legal requests appropriately',
          'Keep terms of service updated',
        ],
      },
    ],
  },
  {
    id: 'settings',
    title: 'Configuration & Settings',
    icon: Settings,
    content: [
      {
        subtitle: 'Platform Settings',
        description: 'Configure global platform settings and preferences.',
        steps: [
          'Access Settings from sidebar',
          'Configure payment thresholds and schedules',
          'Set commission rates and fee structures',
          'Manage notification preferences',
          'Update platform branding and appearance',
        ],
      },
      {
        subtitle: 'User Account Settings',
        description: 'Manage your admin account settings and preferences.',
        steps: [
          'Update profile information',
          'Change password and security settings',
          'Configure email notifications',
          'Set timezone and language preferences',
          'Manage API access tokens',
        ],
      },
    ],
  },
];

export default function HelpModal({ onClose }: HelpModalProps) {
  const [selectedSection, setSelectedSection] = useState<string>('getting-started');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredSections = HELP_SECTIONS.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.some(
        (item) =>
          item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const currentSection = HELP_SECTIONS.find((s) => s.id === selectedSection);

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    setSidebarOpen(false);
  };

  return (
    <div className="modal-backdrop-adaptive">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Help & Documentation
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete guide for platform administration
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 left-4 z-10 p-2 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg shadow-md border border-gray-200 dark:border-slate-600 transition-colors"
            title={sidebarOpen ? 'Hide menu' : 'Show menu'}
          >
            <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Overlay for mobile when sidebar is open */}
          {sidebarOpen && (
            <div
              className="overlay-backdrop z-[5] md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`
            fixed md:relative inset-y-0 left-0 z-[6] w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          >
            <nav className="p-4 space-y-2">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionSelect(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      selectedSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{section.title}</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-16">
            {currentSection && (
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  {React.createElement(currentSection.icon, {
                    className: 'h-8 w-8 text-blue-600 dark:text-blue-400',
                  })}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentSection.title}
                  </h3>
                </div>

                {currentSection.content.map((item, index) => (
                  <div key={index} className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {item.subtitle}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {item.steps && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Step-by-Step Guide
                        </h5>
                        <ol className="space-y-2">
                          {item.steps.map((step, stepIndex) => (
                            <li
                              key={stepIndex}
                              className="flex gap-3 text-sm text-blue-800 dark:text-blue-400"
                            >
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-700 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                {stepIndex + 1}
                              </span>
                              <span className="flex-1 pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {item.tips && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          Tips & Best Practices
                        </h5>
                        <ul className="space-y-2">
                          {item.tips.map((tip, tipIndex) => (
                            <li
                              key={tipIndex}
                              className="flex gap-3 text-sm text-amber-800 dark:text-amber-400"
                            >
                              <span className="flex-shrink-0 w-1.5 h-1.5 bg-amber-600 dark:bg-amber-500 rounded-full mt-2"></span>
                              <span className="flex-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {filteredSections.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No results found for "{searchTerm}"
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Try adjusting your search terms
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-750">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need additional help? Contact support at{' '}
              <a
                href="mailto:support@platform.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                support@platform.com
              </a>
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
