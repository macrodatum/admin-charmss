import React, { useState } from 'react';
import { Settings, LogOut, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../app/stores/auth.store';

interface UserMenuProps {
  onClose?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onClose }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleLogout = async () => {
    setShowConfirmDialog(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setShowConfirmDialog(false);
      if (onClose) onClose();
      // Redirigir a la página de login
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      setShowConfirmDialog(false);
    }
  };

  const cancelLogout = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -top-3 right-3 bg-slate-700 p-1 rounded-full hover:bg-slate-600 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        )}
        {/* User Info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <img
              src="/icons/default-avatar.svg"
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-pink-500"
            />
            <div>
              <div className="text-white font-medium">lgabrielcor</div>
              <div className="text-sm text-gray-400">Administrator</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left">
            <Settings className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-white text-sm">Account Settings</div>
              <div className="text-xs text-gray-400">Manage your profile and preferences</div>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-white text-sm">Sign Out</div>
              <div className="text-xs text-gray-400">Log out of your account</div>
            </div>
          </button>
        </div>

        {/* Version Info */}
        <div className="px-4 py-3 border-t border-slate-700">
          <div className="text-xs text-gray-500">Version 2.1.0 • Live Charmss</div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-backdrop-adaptive z-[100]">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Confirmar cierre de sesión</h3>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres cerrar sesión? Tendrás que iniciar sesión nuevamente para
              acceder al panel de administración.
            </p>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserMenu;
