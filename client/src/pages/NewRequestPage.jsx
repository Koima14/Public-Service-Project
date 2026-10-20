import React, { useState } from 'react';
import { 
  Lightbulb, 
  Droplets, 
  Trash2, 
  Construction, 
  Waves, 
  ShieldAlert, 
  Upload, 
  MapPin, 
  Crosshair, 
  X, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Copy, 
  ArrowRight,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NewRequestPage({ initialCategory, setActiveTab, onSelectRequest }) {
  const { user, fetchNotifications } = useAuth();

  const [category, setCategory] = useState(initialCategory || 'Streetlighting');
  const [priority, setPriority] = useState('Medium');
  const [county, setCounty] = useState('Nairobi');
  const [subcounty, setSubcounty] = useState('Westlands');
  const [landmark, setLandmark] = useState('');
  const [gps, setGps] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  // Kenyan County & Sub-county presets
  const countiesData = {
    'Nairobi': ['Westlands', 'Kibra', 'Langata', 'Dagoretti North', 'Dagoretti South', 'Starehe', 'Kamukunji', 'Ruaraka', 'Kasarani', 'Roysambu', 'Embakasi East', 'Embakasi West', 'Embakasi North', 'Embakasi South', 'Embakasi Central', 'Makadara', 'Mathare'],
    'Mombasa': ['Nyali', 'Mvita', 'Kisauni', 'Likoni', 'Changamwe', 'Jomvu'],
    'Kiambu': ['Ruiru', 'Thika Town', 'Juja', 'Kiambu Town', 'Githunguri', 'Limuru', 'Kikuyu', 'Kabete', 'Lari'],
    'Nakuru': ['Nakuru Town East', 'Nakuru Town West', 'Naivasha', 'Gilgil', 'Rongai', 'Molo', 'Subukia'],
    'Kisumu': ['Kisumu Central', 'Kisumu East', 'Kisumu West', 'Seme', 'Nyando', 'Muhoroni', 'Nyakach'],
    'Uasin Gishu': ['Ainabkoi', 'Kapseret', 'Kesses', 'Moiben', 'Soy', 'Turbo'],
    'Machakos': ['Machakos Town', 'Mavoko (Athi River)', 'Kangundo', 'Matungulu', 'Yatta', 'Mwala']
  };

  const categories = [
    { id: 'Streetlighting', label: 'Streetlighting', icon: Lightbulb, color: 'text-amber-500' },
    { id: 'Water Supply & Leakages', label: 'Water Supply', icon: Droplets, color: 'text-blue-500' },
    { id: 'Garbage & Waste Management', label: 'Waste & Garbage', icon: Trash2, color: 'text-emerald-500' },
    { id: 'Roads & Potholes', label: 'Roads & Potholes', icon: Construction, color: 'text-orange-500' },
    { id: 'Sewerage & Drainage', label: 'Sewerage & Drain', icon: Waves, color: 'text-teal-500' },
    { id: 'Public Safety & Noise', label: 'Public Safety', icon: ShieldAlert, color: 'text-rose-500' }
  ];

  const handleCountyChange = (newCounty) => {
    setCounty(newCounty);
    const subcounties = countiesData[newCounty] || [];
    setSubcounty(subcounties[0] || 'Central');
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your current browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setGps(coords);
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS detection failed, fallback demo coordinates used:', err.message);
        // Fallback demo coordinates in Nairobi CBD
        setGps('-1.286389, 36.817223');
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5 MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!landmark.trim() || !description.trim()) {
      setError('Please provide specific landmark/street details and an issue description.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('county', county);
      formData.append('subcounty', subcounty);
      formData.append('ward_or_landmark', landmark.trim());
      if (gps) formData.append('gps_coordinates', gps);
      formData.append('description', description.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.requests.submit(formData);
      if (res.success && res.request) {
        setCreatedTicket(res.request);
        fetchNotifications();
      } else {
        throw new Error(res.message || 'Failed to submit request');
      }
    } catch (err) {
      setError(err.message || 'Failed to lodge service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Lodge a Public Service Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide accurate details to ensure prompt assignment to the appropriate field maintenance department.
        </p>
      </div>

      {/* Success Modal / Banner */}
      {createdTicket ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Request Lodged Successfully
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Ticket Reference Generated
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your service ticket has been routed to the <strong>{createdTicket.assigned_department}</strong>. A confirmation SMS has been dispatched to {user?.phone}.
            </p>
          </div>

          {/* Reference Card with Copy */}
          <div className="max-w-md mx-auto bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-5 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Official Reference Code</p>
              <p className="text-xl sm:text-2xl font-mono font-black text-emerald-950 tracking-wider">
                {createdTicket.reference_no}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(createdTicket.reference_no)}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onSelectRequest) onSelectRequest(createdTicket);
                setActiveTab('citizen-dashboard');
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-md"
            >
              <span>View in My Requests</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCreatedTicket(null);
                setLandmark('');
                setDescription('');
                setImageFile(null);
                setImagePreview(null);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-8">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Civic Service Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${cat.color}`} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Priority Level */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Urgency & Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'Low', desc: 'Routine issue', badge: 'bg-slate-100 text-slate-700' },
                { id: 'Medium', desc: 'Standard turnaround', badge: 'bg-sky-50 text-sky-800 border-sky-200' },
                { id: 'High', desc: 'Serious inconvenience', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
                { id: 'Critical', desc: 'Immediate hazard', badge: 'bg-rose-50 text-rose-800 border-rose-200' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    priority === p.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs block font-bold">{p.id}</span>
                  <span className="text-[10px] text-slate-400 block">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Location Details */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Issue Location & GPS *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  County
                </label>
                <select
                  value={county}
                  onChange={(e) => handleCountyChange(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-medium"
                >
                  {Object.keys(countiesData).map((c) => (
                    <option key={c} value={c}>{c} County</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Sub-County / Constituency
                </label>
                <select
                  value={subcounty}
                  onChange={(e) => setSubcounty(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-medium"
                >
                  {(countiesData[county] || []).map((sc) => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                Specific Landmark, Street, or Estate *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Sarit Centre Footbridge, Waiyaki Way or Near Chief's Camp"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            {/* GPS coordinates & auto-detect */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">
                  GPS Coordinates (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={gpsLoading}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  {gpsLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Crosshair className="w-3.5 h-3.5" />
                  )}
                  <span>Auto-detect Device Location</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. -1.2618, 36.8044"
                value={gps}
                onChange={(e) => setGps(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 4. Issue Description */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              4. Problem Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe what is broken, how long the issue has persisted, and any safety hazards or impacts on the community..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              required
            />
          </div>

          {/* 5. Optional Image Attachment */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              5. Photo Evidence (Optional)
            </label>

            {imagePreview ? (
              <div className="relative inline-block border-2 border-emerald-500 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={imagePreview}
                  alt="Issue preview"
                  className="w-48 h-36 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 transition-colors shadow-sm"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all block">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  Click to browse photo or drag & drop image here
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports JPEG, PNG, WebP up to 5 MB
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Citizen Protection Act • Information is directly submitted to county authorities
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Submit Service Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
