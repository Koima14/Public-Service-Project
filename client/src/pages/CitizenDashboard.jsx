import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  Calendar, 
  Star, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  FileText,
  Building,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import FeedbackModal from '../components/FeedbackModal';

export default function CitizenDashboard({ setActiveTab, onSelectRequest }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Feedback modal state
  const [selectedForFeedback, setSelectedForFeedback] = useState(null);

  const fetchMyRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.requests.getMyRequests();
      if (res.success && res.requests) {
        setRequests(res.requests);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your service requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  // Compute metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
  const resolvedCount = requests.filter(r => r.status === 'Resolved').length;

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesFilter = activeFilter === 'All' || r.status === activeFilter;
    const matchesSearch = 
      r.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ward_or_landmark.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-700/80 px-3 py-1 rounded-full text-amber-300 text-xs font-semibold">
            <span>Official Citizen Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Habari, {user?.name || 'Citizen'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            National ID: <span className="font-mono font-semibold">{user?.national_id}</span> • Phone: <span className="font-mono font-semibold">{user?.phone}</span>
          </p>
        </div>

        <button
          onClick={() => setActiveTab('submit')}
          className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lodge New Request</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveFilter('All')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeFilter === 'All' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">My Requests</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{totalCount}</h3>
          <p className="text-[11px] text-slate-400">Total tickets submitted</p>
        </div>

        <div 
          onClick={() => setActiveFilter('Pending')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeFilter === 'Pending' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</h3>
          <p className="text-[11px] text-amber-700/60 font-medium">Awaiting departmental dispatch</p>
        </div>

        <div 
          onClick={() => setActiveFilter('In Progress')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeFilter === 'In Progress' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase">In Progress</span>
            <RefreshCw className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-blue-600 mt-2">{inProgressCount}</h3>
          <p className="text-[11px] text-blue-700/60 font-medium">Field operations underway</p>
        </div>

        <div 
          onClick={() => setActiveFilter('Resolved')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeFilter === 'Resolved' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600 mt-2">{resolvedCount}</h3>
          <p className="text-[11px] text-emerald-700/60 font-medium">Action completed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeFilter === tab
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 space-y-2 border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs">Fetching your service requests...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-600" />
            <p>{error}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 space-y-3 border border-slate-200">
            <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <h4 className="text-base font-bold text-slate-700">No Service Requests Found</h4>
            <p className="text-xs max-w-sm mx-auto text-slate-400">
              {searchQuery || activeFilter !== 'All'
                ? 'Try adjusting your search query or filter tab.'
                : 'You have not submitted any public service requests yet. Report a broken streetlight, burst water pipe, or garbage pile to get started.'}
            </p>
            <button
              onClick={() => setActiveTab('submit')}
              className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit First Request</span>
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-emerald-950 px-2 py-0.5 rounded border border-slate-200">
                    {req.reference_no}
                  </span>
                  <PriorityBadge priority={req.priority} />
                  <StatusBadge status={req.status} />
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {req.category}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                    {req.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.ward_or_landmark}, {req.subcounty}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.assigned_department || 'General Public Works'}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(req.created_at).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Feedback rating button for resolved tickets */}
                {req.status === 'Resolved' && (
                  req.feedback_rating ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>Rated {req.feedback_rating}/5</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedForFeedback(req)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                    >
                      <Star className="w-3.5 h-3.5 fill-emerald-950 text-emerald-950" />
                      <span>Rate Service</span>
                    </button>
                  )
                )}

                <button
                  onClick={() => {
                    if (onSelectRequest) onSelectRequest(req);
                    setActiveTab('detail');
                  }}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Citizen Feedback Modal */}
      <FeedbackModal
        isOpen={!!selectedForFeedback}
        request={selectedForFeedback}
        onClose={() => setSelectedForFeedback(null)}
        onSubmitted={fetchMyRequests}
      />
    </div>
  );
}
