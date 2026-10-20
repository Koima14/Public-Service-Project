import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Building, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  Star, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  Wrench, 
  CheckCircle2, 
  ShieldCheck, 
  Copy,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatusTimeline from '../components/StatusTimeline';
import FeedbackModal from '../components/FeedbackModal';

export default function RequestDetailPage({ request: initialRequest, onBack, onStatusUpdated }) {
  const { user, isAdmin, isCitizen } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Admin status update quick modal
  const [adminStatusModal, setAdminStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchDetails = async () => {
    if (!initialRequest?.id && !initialRequest?.reference_no) return;
    setLoading(true);
    setError('');
    try {
      const identifier = initialRequest.id || initialRequest.reference_no;
      const res = await api.requests.getDetails(identifier);
      if (res.success && res.request) {
        setData(res);
        setNewStatus(res.request.status === 'Pending' ? 'In Progress' : (res.request.status === 'In Progress' ? 'Resolved' : res.request.status));
        setAdminNotes(res.request.admin_notes || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [initialRequest]);

  const copyRef = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdminStatusChange = async (e) => {
    e.preventDefault();
    if (!data?.request?.id) return;
    setUpdating(true);
    try {
      const res = await api.requests.updateStatus(data.request.id, {
        status: newStatus,
        admin_notes: adminNotes
      });
      if (res.success) {
        setAdminStatusModal(false);
        fetchDetails();
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
        <p className="text-xs">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-700 text-xs">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
          <p>{error || 'Ticket not found'}</p>
        </div>
        <button
          onClick={onBack}
          className="bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { request, history, feedback } = data;
  const isOwner = user && user.id === request.user_id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-800 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setAdminStatusModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Update Ticket Status</span>
          </button>
        )}
      </div>

      {/* Main Ticket Dossier Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-emerald-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="font-mono font-extrabold text-sm sm:text-base bg-emerald-800 text-amber-300 px-3 py-1 rounded-xl border border-emerald-700">
                {request.reference_no}
              </span>
              <PriorityBadge priority={request.priority} />
              <button
                onClick={() => copyRef(request.reference_no)}
                className="text-emerald-200 hover:text-white p-1"
                title="Copy Reference"
              >
                <Copy className="w-4 h-4" />
              </button>
              {copied && <span className="text-[11px] text-amber-300 font-semibold">Copied!</span>}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">
              {request.category}
            </h1>
            <p className="text-xs text-emerald-200 mt-1">
              Registered on {new Date(request.created_at).toLocaleString('en-KE')}
            </p>
          </div>

          <StatusBadge status={request.status} size="lg" />
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px] mb-1">Administrative Location</p>
              <p className="font-bold text-slate-800 text-sm">{request.subcounty}, {request.county} County</p>
              <p className="text-slate-600 mt-0.5">{request.ward_or_landmark}</p>
            </div>

            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px] mb-1">Assigned Department</p>
              <p className="font-bold text-slate-800 text-sm">{request.assigned_department || 'Pending Department'}</p>
              <p className="text-slate-600 mt-0.5">{request.assigned_to || 'Officer unassigned'}</p>
            </div>

            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px] mb-1">Reporting Citizen</p>
              <p className="font-bold text-slate-800 text-sm">{request.citizen_name}</p>
              {request.citizen_phone && (
                <p className="text-slate-600 font-mono mt-0.5">{request.citizen_phone}</p>
              )}
            </div>

            {request.gps_coordinates && (
              <div className="sm:col-span-2 lg:col-span-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>GPS: <strong className="font-mono">{request.gps_coordinates}</strong></span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.gps_coordinates)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Problem Description
            </h3>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
              {request.description}
            </div>
          </div>

          {/* Uploaded Photo Evidence */}
          {request.image_url && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attached Photo Evidence
              </h3>
              <div className="rounded-2xl border border-slate-200 overflow-hidden max-w-md bg-slate-900 shadow-md">
                <img
                  src={request.image_url}
                  alt="Service issue evidence"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          )}

          {/* Admin Resolution Remarks */}
          {request.admin_notes && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Official Municipal Resolution Remarks</span>
              </h3>
              <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                {request.admin_notes}
              </p>
              {request.resolved_at && (
                <p className="text-[11px] text-emerald-700/80 pt-1">
                  Closed on: {new Date(request.resolved_at).toLocaleString('en-KE')}
                </p>
              )}
            </div>
          )}

          {/* Status Lifecycle & Audit Timeline */}
          <StatusTimeline
            currentStatus={request.status}
            history={history || []}
            createdAt={request.created_at}
            resolvedAt={request.resolved_at}
          />

          {/* Citizen Feedback Rating Section */}
          {request.status === 'Resolved' && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Citizen Service Quality Review
                  </h3>
                  <p className="text-xs text-amber-700/80">
                    Civic accountability feedback on the completed resolution
                  </p>
                </div>

                {feedback ? (
                  <div className="flex items-center gap-1 bg-amber-400 text-amber-950 font-black px-3 py-1 rounded-xl text-xs">
                    <Star className="w-4 h-4 fill-amber-950 text-amber-950" />
                    <span>{feedback.rating} / 5</span>
                  </div>
                ) : isOwner ? (
                  <button
                    onClick={() => setFeedbackModalOpen(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs px-4 py-2 rounded-xl transition-colors shadow-xs"
                  >
                    Rate Resolution Now
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">No feedback submitted yet</span>
                )}
              </div>

              {feedback?.comments && (
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-xs text-slate-700">
                  <p className="italic">"{feedback.comments}"</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Submitted on {new Date(feedback.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Citizen Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        request={request}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmitted={fetchDetails}
      />

      {/* Admin Quick Status Update Modal */}
      {adminStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900">
              Update Request Status
            </h3>

            <form onSubmit={handleAdminStatusChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Pending', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`p-2 rounded-xl font-bold border text-center ${
                        newStatus === st
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Resolution Remarks / Progress Note
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Field team dispatched, valve replaced, road patched, etc."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminStatusModal(false)}
                  className="flex-1 py-2 font-semibold bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2 font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl flex items-center justify-center gap-1"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
