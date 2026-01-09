import React, { useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore, isTokenExpired } from '../stores/auth.store';
import type { User } from '../types/User';
import Login from '../../pages/Login';
import { validateAuthCallback } from '../services/auth.service';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const location = useLocation();

  const jwt = useAuthStore((state) => state.jwt);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  useEffect(() => {
    const controlSession = async () => {
      if (location.pathname === '/auth-validator') {
        const userId = searchParams.get('userId');
        const provider = searchParams.get('provider');
        if (userId && provider) {
          const role = searchParams.get('role') || 'admin';
          try {
            const response = await validateAuthCallback(userId, provider, role);
            if (response.jwt && response.user) {
            const userForStore: User = { ...response.user };
            useAuthStore.getState().setCredentials(response.jwt as unknown as string, userForStore);
            useAuthStore.getState().setLoggedIn(true);
            navigate('/');
          }
          }
          catch (error: any) {
            const message = error?.response?.data?.error || 'Error de autenticación';
            console.error('Error during auth validation:', message);
            navigate('/login', { state: { from: location.pathname, authError: message } } );
          }
        } else {
          console.error('Invalid response from auth callback:');
        }
      }

      let shouldRedirectToLogin = false;

      if (jwt) {
        if (isTokenExpired(jwt)) {
          clearCredentials();
          shouldRedirectToLogin = true;
        }
      }

      if (shouldRedirectToLogin) {
        navigate('/login', { state: { from: location.pathname } });
      }
    };

    controlSession();
  }, [jwt, isLoggedIn, location, searchParams, navigate, clearCredentials]);

  return isLoggedIn ? <>{children}</> : <Login />;
};

export default AuthProvider;
