import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './AuthProvider';
import AppRouter from '../router/AppRouter';
import CookieConsent from '../../components/CookieConsent';
import { ThemeProvider } from '../../contexts/ThemeContext';

export const Providers: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>

        {/* Cookie consent should be visible even when not logged in (e.g., Login page) */}
        <CookieConsent />
      </BrowserRouter>
    </ThemeProvider>
  );
};
