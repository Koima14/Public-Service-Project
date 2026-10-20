import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  PlusCircle, 
  ListFilter, 
  LayoutDashboard, 
  Bell, 
  LogOut, 
  User, 
  Menu, 
  X,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar({ activeTab, setActiveTab, onOpenTrackModal }) {
  const { user, isAuthenticated, isAdmin, isCitizen, logout, unreadCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Kenyan Tricolor stripe */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-black" />
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-emerald-600" />
      </div>

      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('landing')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md border-2 border-emerald-700">
                <span className="font-extrabold text-emerald-950 text-base tracking-tighter">eC</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg text-white tracking-tight">eCitizen</span>
                  <span className="bg-amber-400 text-emerald-950 font-bold text-[10px] px-1.5 py-0.5 rounded tracking-wide uppercase">
                    Civic Desk
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200 hidden sm:block">
                  Republic of Kenya • Public Service Request System
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => handleNav('landing')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'landing' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/60'
                }`}
              >
                Portal Home
              </button>

              <button
                onClick={onOpenTrackModal}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-amber-300 hover:bg-emerald-800/60 transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track Ticket</span>
              </button>

              {isAuthenticated && isCitizen && (
                <>
                  <button
                    onClick={() => handleNav('submit')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'submit' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/60'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Request</span>
                  </button>
                  <button
                    onClick={() => handleNav('citizen-dashboard')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'citizen-dashboard' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/60'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>My Requests</span>
                  </button>
                </>
              )}

              {isAuthenticated && isAdmin && (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'admin-dashboard' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-300" />
                  <span>Admin Dashboard</span>
                </button>
              )}
            </nav>

            {/* User Profile & Right Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Notification Bell */}
                  <button
                    onClick={() => setNotificationDrawerOpen(true)}
                    className="relative p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors"
                    title="SMS / Civic Alerts"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Profile Chip */}
                  <div className="hidden sm:flex items-center gap-2 bg-emerald-800/70 border border-emerald-700/60 px-3 py-1.5 rounded-xl">
                    <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">
                      {isAdmin ? <ShieldCheck className="w-4 h-4 text-amber-300" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="text-left text-xs leading-tight">
                      <p className="font-semibold text-white max-w-[120px] truncate">{user.name}</p>
                      <span className="text-[10px] text-emerald-300 uppercase font-medium">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNav('login')}
                    className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNav('register')}
                    className="text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-emerald-950 px-3.5 py-1.5 rounded-lg shadow-xs transition-colors"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-emerald-200 hover:text-white rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-emerald-950 border-t border-emerald-800 px-4 pt-2 pb-4 space-y-1">
            <button
              onClick={() => handleNav('landing')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-emerald-100 hover:bg-emerald-900"
            >
              Portal Home
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrackModal();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-amber-300 hover:bg-emerald-900 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Track Ticket</span>
            </button>
            {isAuthenticated && isCitizen && (
              <>
                <button
                  onClick={() => handleNav('submit')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-emerald-100 hover:bg-emerald-900"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => handleNav('citizen-dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-emerald-100 hover:bg-emerald-900"
                >
                  My Requests
                </button>
              </>
            )}
            {isAuthenticated && isAdmin && (
              <button
                onClick={() => handleNav('admin-dashboard')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-emerald-100 hover:bg-emerald-900"
              >
                Admin Dashboard
              </button>
            )}
          </div>
        )}
      </header>

      {/* Simulated SMS & Alerts Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </>
  );
}
