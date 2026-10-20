import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PublicTrackModal from './components/PublicTrackModal';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewRequestPage from './pages/NewRequestPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RequestDetailPage from './pages/RequestDetailPage';
import { Building2, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, isAdmin, isCitizen } = useAuth();
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Streetlighting');
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackModalInitialRef, setTrackModalInitialRef] = useState('');

  const handleOpenTrackModal = (initialRef = '') => {
    setTrackModalInitialRef(initialRef);
    setTrackModalOpen(true);
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
  };

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setActiveTab('detail');
  };

  const handleBackFromDetail = () => {
    if (isAdmin) {
      setActiveTab('admin-dashboard');
    } else if (isAuthenticated) {
      setActiveTab('citizen-dashboard');
    } else {
      setActiveTab('landing');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTrackModal={() => handleOpenTrackModal('')}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            onOpenTrackModal={handleOpenTrackModal}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'register' && (
          <RegisterPage setActiveTab={setActiveTab} />
        )}

        {activeTab === 'submit' && (
          <NewRequestPage
            initialCategory={selectedCategory}
            setActiveTab={setActiveTab}
            onSelectRequest={handleSelectRequest}
          />
        )}

        {activeTab === 'citizen-dashboard' && (
          <CitizenDashboard
            setActiveTab={setActiveTab}
            onSelectRequest={handleSelectRequest}
          />
        )}

        {activeTab === 'admin-dashboard' && (
          <AdminDashboard
            setActiveTab={setActiveTab}
            onSelectRequest={handleSelectRequest}
          />
        )}

        {activeTab === 'detail' && selectedRequest && (
          <RequestDetailPage
            request={selectedRequest}
            onBack={handleBackFromDetail}
            onStatusUpdated={() => {}}
          />
        )}
      </main>

      {/* Public Tracking Modal */}
      <PublicTrackModal
        isOpen={trackModalOpen}
        initialRef={trackModalInitialRef}
        onClose={() => setTrackModalOpen(false)}
      />

      {/* Kenya Government Official Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs">
            {/* Column 1: Brand & Republic of Kenya */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-black text-slate-950 text-sm">
                  eC
                </div>
                <span className="font-extrabold text-white text-base tracking-tight">eCitizen Civic Desk</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                The official civic service delivery and infrastructure fault management platform for the Republic of Kenya.
              </p>
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Integrated with Kenya Vision 2030</span>
              </div>
            </div>

            {/* Column 2: Public Portals */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Civic Portals</h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li><button onClick={() => setActiveTab('landing')} className="hover:text-amber-400">Portal Home</button></li>
                <li><button onClick={() => handleOpenTrackModal('')} className="hover:text-amber-400">Track Reference Number</button></li>
                <li><button onClick={() => setActiveTab('submit')} className="hover:text-amber-400">Report Fault / Service Issue</button></li>
                <li><button onClick={() => setActiveTab('login')} className="hover:text-amber-400">Citizen Sign In</button></li>
              </ul>
            </div>

            {/* Column 3: County Services */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">County Departments</h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>Urban Infrastructure & Streetlighting</li>
                <li>Water Supply, Sewerage & NCWSC</li>
                <li>Environment & Solid Waste Disposal</li>
                <li>KeNHA / KURA Roads & Pothole Repair</li>
              </ul>
            </div>

            {/* Column 4: Huduma Desk Contact */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Huduma Support Desk</h4>
              <p className="text-slate-400 text-[11px]">
                Toll-free Citizen Helpline:
              </p>
              <p className="text-amber-400 font-mono font-bold text-sm">
                0800 221 000
              </p>
              <p className="text-slate-400 text-[11px]">
                Email: support@ecitizen.go.ke
              </p>
              <p className="text-slate-500 text-[10px]">
                Available 24/7 across all Huduma Kenya Centers
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <p>© 2026 Republic of Kenya • eCitizen Digital Services. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Civic Service</span>
              <span>•</span>
              <span>Service Level Agreement (SLA)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
