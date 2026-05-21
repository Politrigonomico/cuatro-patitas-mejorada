import React from 'react';
import { PawPrint, Home, Heart, Bot, Sparkles, ShieldCheck, User, LogIn, LogOut, Menu, X } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  user: any;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
}

export default function Navigation({
  activeTab,
  setActiveTab,
  isAdmin,
  user,
  onSignInWithGoogle,
  onSignOut
}: NavigationProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Dynamic menu list: Core public links always visible
  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'adopt', label: 'Adoptar', icon: Heart },
    { id: 'vet', label: 'Asistente Veterinario IA', icon: Bot },
    { id: 'success', label: 'Finales Felices', icon: Sparkles },
  ];

  // Append profile if user is logged in
  if (user) {
    menuItems.push({ id: 'perfil', label: 'Mi Perfil', icon: User });
  }

  // Append administrative panel only if flagged as admin
  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Panel Admin', icon: ShieldCheck });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Leftside: Logo Brand */}
          <div className="flex items-center cursor-pointer select-none" onClick={() => setActiveTab('home')}>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xl font-sans tracking-tight">
              <div className="p-2 bg-blue-50 rounded-xl">
                <PawPrint className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Cuatro Patitas Fighiera
              </span>
            </div>
            <div className="hidden lg:flex ml-4 text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase border border-blue-100 font-mono">
              Tránsitos & Castraciones Gratis
            </div>
          </div>

          {/* Center/Rightside: Desktop Menu Option Links */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}

            {/* Separator */}
            <div className="h-5 w-[1px] bg-gray-200 mx-2" />

            {/* Google Authentication Segment */}
            {user ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('perfil')}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-150 hover:bg-gray-50 transition-all text-left"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuario'}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold uppercase">
                      {(user.displayName || 'U').charAt(0)}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-bold text-gray-750 truncate max-w-[100px]">
                    {user.displayName?.split(' ')[0] || 'Mi Cuenta'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={onSignInWithGoogle}
                className="px-4 py-2 font-bold text-xs text-white bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-650 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                Ingresar con Google
              </button>
            )}
          </div>

          {/* Mobile responsive toggle */}
          <div className="flex items-center gap-3 md:hidden">
            {user ? (
              <button
                onClick={() => setActiveTab('perfil')}
                className="w-8 h-8 rounded-full overflow-hidden border border-gray-200"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold">
                    U
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={onSignInWithGoogle}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Navigation Drawers */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4 space-y-1 animate-fadeIn text-left">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}

          {user && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-pointer text-left"
              >
                <LogOut className="h-5 w-5 text-gray-400" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
