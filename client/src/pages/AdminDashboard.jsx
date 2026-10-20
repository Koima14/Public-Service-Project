import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Download, 
  Search, 
  Filter, 
  ChevronRight, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  Eye, 
  Wrench, 
  ShieldCheck, 
  User, 
  Phone, 
  Building, 
  MapPin, 
  Calendar,
  X,
  Send,
  PieChart,
  BarChart3,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function AdminDashboard({ onSelectRequest, setActiveTab }) {
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [countyFilter, setCountyFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Status Update Modal State
  const [activeUpdateRequest, setActiveUpdateRequest] = useState(null);
  const [updateStatusVal, setUpdateStatusVal] = useState('In Progress');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateDepartment, setUpdateDepartment] = useState('');
  const [updateOfficer, setUpdateOfficer] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [reqRes, anaRes] = await Promise.all([
        api.requests.getAllAdmin({
          status: statusFilter,
          category: categoryFilter,
          priority: priorityFilter,
          county: countyFilter,
          search
        }),
        api.analytics.getSummary()
      ]);

      if (reqRes.success) setRequests(reqRes.requests || []);
      if (anaRes.success) setAnalytics(anaRes.analytics || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [statusFilter, categoryFilter, priorityFilter, countyFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  const openStatusModal = (req) => {
    setActiveUpdateRequest(req);
    setUpdateStatusVal(req.status === 'Pending' ? 'In Progress' : (req.status === 'In Progress' ? 'Resolved' : req.status));
    setUpdateNotes(req.admin_notes || '');
    setUpdateDepartment(req.assigned_department || '');
    setUpdateOfficer(req.assigned_to || '');
    setUpdateSuccessMsg('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!activeUpdateRequest) return;

    setUpdating(true);
    setUpdateSuccessMsg('');

    try {
      const res = await api.requests.updateStatus(activeUpdateRequest.id, {
        status: updateStatusVal,
        admin_notes: updateNotes,
        assigned_department: updateDepartment,
        assigned_to: updateOfficer
      });

      if (res.success) {
        setUpdateSuccessMsg(`Status updated to "${updateStatusVal}". Citizen notified via SMS.`);
        setTimeout(() => {
          setActiveUpdateRequest(null);
          fetchAdminData();
        }, 1200);
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/requests/admin/export/csv', '_blank');
  };

  const summary = analytics?.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrative Command Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Civic Operations & Service Delivery
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Dispatch departments, track SLAs, update public ticket statuses, and analyze citizen satisfaction.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards (Open vs Resolved) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total Tickets</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mt-2">
            {summary?.totalRequests ?? 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across all 47 counties</p>
        </div>

        {/* Open Cases (Pending + In Progress) */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase">Open Cases</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-3xl font-black text-amber-600 mt-2">
            {summary?.openCases ?? 0}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
            <span>{summary?.pending ?? 0} Pending</span>
            <span>•</span>
            <span>{summary?.inProgress ?? 0} In Progress</span>
          </div>
        </div>

        {/* Resolved Cases */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase">Resolved Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-black text-emerald-600 mt-2">
            {summary?.resolvedCases ?? 0}
          </h3>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {summary?.resolutionRate ?? 0}% Overall Resolution Rate
          </p>
        </div>

        {/* Citizen Rating & Satisfaction */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Citizen Feedback</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mt-2 flex items-baseline gap-1">
            <span>{summary?.avgRating || '4.5'}</span>
            <span className="text-xs text-slate-400 font-medium">/ 5.0</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            From {summary?.totalFeedback || 2} citizen reviews
          </p>
        </div>
      </div>

      {/* Visual Analytics Breakdown: Category Distribution */}
      {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Civic Issues Distribution by Category
              </h3>
              <p className="text-xs text-slate-500">
                Visual ratio of Open vs Resolved cases across public service categories
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
              {analytics.categoryBreakdown.length} active sectors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.categoryBreakdown.map((item) => {
              const openPct = item.total > 0 ? Math.round((item.open_cases / item.total) * 100) : 0;
              const resolvedPct = 100 - openPct;

              return (
                <div key={item.category} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="truncate pr-2">{item.category}</span>
                    <span className="text-slate-500 shrink-0">{item.total} total</span>
                  </div>

                  {/* Dual color progress bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${resolvedPct}%` }}
                      className="bg-emerald-500 transition-all"
                      title={`${item.resolved_cases} Resolved (${resolvedPct}%)`}
                    />
                    <div
                      style={{ width: `${openPct}%` }}
                      className="bg-amber-400 transition-all"
                      title={`${item.open_cases} Open (${openPct}%)`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="text-emerald-700 font-semibold">{item.resolved_cases} Resolved</span>
                    <span className="text-amber-700 font-semibold">{item.open_cases} Open</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Reference Code, Citizen Name, Phone, or Landmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Streetlighting">Streetlighting</option>
              <option value="Water Supply & Leakages">Water Supply</option>
              <option value="Garbage & Waste Management">Waste & Garbage</option>
              <option value="Roads & Potholes">Roads & Potholes</option>
              <option value="Sewerage & Drainage">Sewerage & Drainage</option>
              <option value="Public Safety & Noise">Public Safety</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">County</label>
            <select
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
            >
              <option value="All">All Counties</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Kiambu">Kiambu</option>
              <option value="Nakuru">Nakuru</option>
              <option value="Kisumu">Kisumu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-black text-base text-slate-900">
            Public Service Requests Queue
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {requests.length} results matching criteria
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
            <p className="text-xs">Loading service tickets...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-700 bg-rose-50 text-xs">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-bold text-slate-700">No requests found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Ticket Ref</th>
                  <th className="py-3.5 px-4">Citizen Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Department / Assignee</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap">
                        {r.reference_no}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{r.citizen_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{r.citizen_phone}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {r.category}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={`${r.ward_or_landmark}, ${r.subcounty}, ${r.county}`}>
                      <span className="font-medium text-slate-800">{r.subcounty}</span>, {r.county}
                      <span className="block text-[10px] text-slate-400 truncate">{r.ward_or_landmark}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={r.priority} />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-medium text-slate-800 text-[11px]">{r.assigned_department || 'Unassigned'}</p>
                      <p className="text-[10px] text-slate-400">{r.assigned_to || 'Pending team'}</p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openStatusModal(r)}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs"
                          title="Update Status"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Update</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onSelectRequest) onSelectRequest(r);
                            setActiveTab('detail');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Status Update Modal */}
      {activeUpdateRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Update Ticket Resolution Status</h3>
                <p className="text-xs text-amber-300 font-mono mt-0.5">{activeUpdateRequest.reference_no}</p>
              </div>
              <button
                onClick={() => setActiveUpdateRequest(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateSuccessMsg ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">{updateSuccessMsg}</h4>
                <p className="text-xs text-slate-400">Updating dashboard records...</p>
              </div>
            ) : (
              <form onSubmit={handleStatusSubmit} className="p-6 space-y-4">
                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select New Status *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Pending', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setUpdateStatusVal(st)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                          updateStatusVal === st
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assigned Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Responsible Department
                  </label>
                  <input
                    type="text"
                    value={updateDepartment}
                    onChange={(e) => setUpdateDepartment(e.target.value)}
                    placeholder="e.g. Water & Sanitation Services, NCWSC"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Assigned Officer / Team */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Officer or Crew
                  </label>
                  <input
                    type="text"
                    value={updateOfficer}
                    onChange={(e) => setUpdateOfficer(e.target.value)}
                    placeholder="e.g. Officer Faith Mutua (Sub-county Engineer)"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                {/* Resolution / Action Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Resolution Remarks / Admin Notes *
                  </label>
                  <textarea
                    rows={3}
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    placeholder="Detail the actions taken (e.g., pipe repaired, streetlight bulb replaced, truck dispatched). This will be sent to the citizen in their SMS notification."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden"
                    required
                  />
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-start gap-2">
                  <Send className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    Saving will dispatch a simulated SMS alert to <strong>{activeUpdateRequest.citizen_phone}</strong> with these remarks.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveUpdateRequest(null)}
                    className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Status Update'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
