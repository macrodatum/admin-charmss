import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import Chat from '../../pages/Chat';
import Profile from '../../pages/Profile';
import Streaming from '../../pages/Streaming';
import VideoCall from '../../pages/VideoCall';
import Payments from '../../pages/Payments';
import Photos from '../../pages/Photos';
import Stories from '../../pages/Stories';
import CustomerRegister from '../../pages/CustomerRegister';
import Inbox from '../../pages/Inbox';
import Performers from '../../pages/Performers';
import Studios from '../../pages/Studios';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Help from '../../pages/Help';
import Login from '../../pages/Login';
import LegalTestPage from '../../pages/LegalTest';
import Legals from '../../pages/Legals';
import Gifts from '../../pages/Gifts';
import Products from '../../pages/Products';
import Packages from '../../pages/Packages';

const AppRouter: React.FC = () => {
  // Mock values for now - these would come from global state
  const mockEarnings = 0.0;
  const mockIsStreaming = false;
  const mockOnlineStatus = false;
  const mockSetOnlineStatus = () => {};
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mockSetIsStreaming = () => {};

  return (
    <Routes>
      {/* Public test route (unprotected) */}
      <Route path="/legal-test" element={<LegalTestPage />} />

      {/* Protected routes with layout */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden transition-colors">
            <div className="flex h-screen">
              <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              <div className="flex-1 flex flex-col min-w-0">
                <Header
                  earnings={mockEarnings}
                  onlineStatus={mockOnlineStatus}
                  setOnlineStatus={mockSetOnlineStatus}
                  setSidebarOpen={setSidebarOpen}
                />
                <main className="flex-1 p-3 md:p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                  <Routes>
                    <Route
                      path="/"
                      element={<Dashboard earnings={mockEarnings} isStreaming={mockIsStreaming} />}
                    />
                    <Route
                      path="/dashboard"
                      element={<Dashboard earnings={mockEarnings} isStreaming={mockIsStreaming} />}
                    />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route
                      path="/streaming"
                      element={
                        <Streaming
                          isStreaming={mockIsStreaming}
                          setIsStreaming={mockSetIsStreaming}
                        />
                      }
                    />
                    <Route path="/videocall" element={<VideoCall />} />
                    <Route path="/payments" element={<Payments earnings={mockEarnings} />} />
                    <Route path="/photos" element={<Photos />} />
                    <Route path="/stories" element={<Stories />} />
                    <Route path="/customers/register" element={<CustomerRegister />} />
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="/performers" element={<Performers />} />
                    <Route path="/studios" element={<Studios />} />
                    <Route path="/legals" element={<Legals />} />
                    <Route path="/gifts" element={<Gifts />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route
                      path="/help"
                      element={
                        <>
                          <Help />
                        </>
                      }
                    />
                    <Route path="/login" element={<Login />} />
                  </Routes>
                </main>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRouter;
