import React, { useState } from 'react';
import { Search, X, Loader2, AlertCircle, MapPin, Building, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import StatusTimeline from './StatusTimeline';

export default function PublicTrackModal({ isOpen, onClose, initialRef = '' }) {
  const [refNo, setRefNo] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!refNo.trim()) {
      setError('Please enter a valid ticket reference number.');
      return;
    }

    setLoading(true);
    setError('');
    setTicketData(null);

    try {
      const res = await api.requests.publicTrack(refNo.trim());
      if (res.success && res.request) {
        setTicketData(res);
      } else {
        setError('Ticket not found. Please double-check your reference code.');
      }
    } catch (err) {
      setError(err.message || 'Ticket not found. Please verify the reference code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/80 flex items-center justify-center border border-emerald-500/30">
              <Search className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Track Service Request</h3>
              <p className="text-xs text-emerald-200">Public Verification & Tracking Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Reference Number (e.g. REQ-2026-ST8901)"
                value={refNo}
                onChange={(e) => {
                  setRefNo(e.target.value);
                  setError('');
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Track Status</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pill Links */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span>Try sample codes:</span>
            {['REQ-2026-ST8901', 'REQ-2026-WA4321', 'REQ-2026-GB7719'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setRefNo(sample);
                  setError('');
                }}
                className="bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 px-2 py-0.5 rounded text-[11px] font-mono transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Search Results Display */}
        {ticketData && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {ticketData.request.reference_no}
                    </span>
                    <PriorityBadge priority={ticketData.request.priority} />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mt-1.5">
                    {ticketData.request.category}
                  </h4>
                </div>
                <StatusBadge status={ticketData.request.status} size="lg" />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Location:</strong> {ticketData.request.ward_or_landmark}, {ticketData.request.subcounty}, {ticketData.request.county}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Department:</strong> {ticketData.request.assigned_department || 'Pending Assignment'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Reported On:</strong> {new Date(ticketData.request.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong className="text-slate-800">Reported By:</strong> {ticketData.request.citizen_name}
                  </span>
                </div>
              </div>

              {/* Issue Description */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg">
                <strong className="text-slate-800 block mb-1">Issue Description:</strong>
                <p>{ticketData.request.description}</p>
              </div>

              {/* Admin Notes if any */}
              {ticketData.request.admin_notes && (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-900">
                  <strong className="text-emerald-800 block mb-1 font-semibold">Official Resolution / Action Note:</strong>
                  <p>{ticketData.request.admin_notes}</p>
                </div>
              )}
            </div>

            {/* Stepper & Timeline */}
            <StatusTimeline
              currentStatus={ticketData.request.status}
              history={ticketData.history || []}
              createdAt={ticketData.request.created_at}
              resolvedAt={ticketData.request.resolved_at}
            />
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            eCitizen Public Service Delivery Oversight • Republic of Kenya
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
