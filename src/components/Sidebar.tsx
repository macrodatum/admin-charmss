import React from 'react';
import {
  Home,
  DollarSign,
  Users,
  Mail,
  HelpCircle,
  FileText,
  LogOut,
  X,
  Gift,
  Package,
  Box,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/images/livecharmss2t.png';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'performers', label: 'Performers', icon: Users, path: '/performers' },
    { id: 'gifts', label: 'Gifts', icon: Gift, path: '/gifts' },
    { id: 'products', label: 'Products', icon: Package, path: '/products' },
    { id: 'packages', label: 'Packages', icon: Box, path: '/packages' },
    { id: 'inbox', label: 'Inbox', icon: Mail, path: '/inbox' },
    { id: 'payments', label: 'Payments', icon: DollarSign, path: '/payments' },
    { id: 'legals', label: 'Legales', icon: FileText, path: '/legals' },
  ];

  const bottomItems = [
    { id: 'help', label: 'Help and configurations', icon: HelpCircle, path: '/help' },
  ];

  const location = useLocation();

  const handlePageChange = () => {
    // Close the sidebar on mobile after selection
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex flex-col items-center flex-1">
            <img src={logo} alt="Live Charmss" className="h-16 w-auto object-contain" />
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Studio Platform</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-white" />
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isDashboardActive =
                location.pathname === '/' || location.pathname === '/dashboard';
              const isActive =
                item.path === '/dashboard'
                  ? isDashboardActive
                  : location.pathname.startsWith(item.path);

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    onClick={() => handlePageChange()}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-pink-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <ul className="space-y-2">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    onClick={() => handlePageChange()}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors ${
                      isActive ? 'bg-pink-600 text-white' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
            <li>
              <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
