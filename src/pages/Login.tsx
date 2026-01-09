import React from 'react';
import { useLocation } from 'react-router-dom';
import { Users, BarChart3, Shield, Settings } from 'lucide-react';
import { fetchLoginConfig, type LoginConfig } from '../app/services/auth.service';
import { BRAND_NAME } from '../app/config/appConfig';
import logo from '../assets/images/livecharmss2t.png';
import LegalModal from '../components/legal/LegalModal';

const Login: React.FC = () => {
  const [config, setConfig] = React.useState<LoginConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [legalOpen, setLegalOpen] = React.useState(false);
  const [legalName, setLegalName] = React.useState('');

  const location = useLocation();
  const navState = location.state as { from?: string; authError?: string } | null;
  const authError = navState?.authError;

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchLoginConfig()
      .then((c) => mounted && setConfig(c))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const iconComponents = {
    Users,
    BarChart3,
    Shield,
    Settings,
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-red-500 via-red-900 to-black ">
        <div className="mx-auto mb-4 bg-black rounded-[5px] p-1 inline-block drop-shadow-lg shadow-inner">
          <img src={logo} alt={BRAND_NAME} className="h-14 w-auto block" />
          Loading login…
        </div>
      </div>
    );
  }

  const handleGoogleLogin = () => {
    if (config?.oauth.google.enabled) {
      window.location.href = config.oauth.google.url;
    }
  };

  const handleFacebookLogin = () => {
    if (config?.oauth.facebook.enabled) {
      window.location.href = config.oauth.facebook.url;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-500 via-red-900 to-black flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md">
          <div className="mx-auto mb-4 bg-black rounded-[5px] p-1 inline-block drop-shadow-lg shadow-inner">
            <img src={logo} alt={BRAND_NAME} className="h-14 w-auto block" />
          </div>
          <p className="text-xl text-red-200 mb-8">{config?.subtitle}</p>

          <div className="space-y-6">
            {config?.features.map((feature, index) => {
              const IconComponent = iconComponents[feature.icon as keyof typeof iconComponents];
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-white/10 ${feature.color}`}>
                    <IconComponent size={24} />
                  </div>
                  <span className="text-lg">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              {/* Logo for small screens (hidden on large screens where branding is visible on the left) */}
              <div className="block lg:hidden mb-4">
                <div className="mx-auto bg-black rounded-[5px] p-1 inline-block drop-shadow-lg shadow-inner">
                  <img src={logo} alt={BRAND_NAME} className="h-10 w-auto block" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-red-200">Sign in to access your admin dashboard</p>
            </div>

            <div className="space-y-4">
              {authError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-800 dark:text-red-300 text-sm">
                  {authError}
                </div>
              )}
              {/* Google Login */}
              {config?.oauth.google.enabled && (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              )}

              {/* Facebook Login */}
              {config?.oauth.facebook.enabled && (
                <button
                  onClick={handleFacebookLogin}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Continue with Facebook</span>
                </button>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-red-200">
                Al continuar aceptas nuestra{' '}
                <button
                  type="button"
                  onClick={() => {
                    setLegalName('Política de privacidad');
                    setLegalOpen(true);
                  }}
                  className="underline hover:text-white ml-1"
                >
                  Política de privacidad
                </button>{' '}
                y los{' '}
                <button
                  type="button"
                  onClick={() => {
                    setLegalName('Términos y Condiciones de Uso - Livecharmss.com');
                    setLegalOpen(true);
                  }}
                  className="underline hover:text-white ml-1"
                >
                  Términos y Condiciones de Uso - Livecharmss.com
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <LegalModal name={legalName} open={legalOpen} onClose={() => setLegalOpen(false)} />
    </div>
  );
};

export default Login;
