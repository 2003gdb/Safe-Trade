'use client';

import { useAuth } from '../contexts/AuthContext';
import { es } from '../locales/es';

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white/70 backdrop-blur-sm shadow-sm border-b border-safetrade-blue/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-safetrade-orange flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-lg font-semibold text-safetrade-dark">
                SafeTrade
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="/dashboard"
              className="text-safetrade-dark hover:text-safetrade-orange px-3 py-2 text-sm font-medium transition-colors"
            >
              {es.common.dashboard}
            </a>
            <a
              href="/reports"
              className="text-safetrade-dark hover:text-safetrade-orange px-3 py-2 text-sm font-medium transition-colors"
            >
              {es.common.reports}
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-safetrade-dark px-3 py-2 text-sm font-medium transition-colors"
            >
              {es.common.logout}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-safetrade-blue/30 bg-white/50">
        <div className="px-2 py-3 space-y-1">
          <a
            href="/dashboard"
            className="block px-3 py-2 text-base font-medium text-safetrade-dark hover:text-safetrade-orange hover:bg-safetrade-blue/10"
          >
            {es.common.dashboard}
          </a>
          <a
            href="/reports"
            className="block px-3 py-2 text-base font-medium text-safetrade-dark hover:text-safetrade-orange hover:bg-safetrade-blue/10"
          >
            {es.common.reports}
          </a>
        </div>
      </div>
    </header>
  );
}