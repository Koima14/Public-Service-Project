import React, { useState } from 'react';
import { Star, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function FeedbackModal({ isOpen, onClose, request, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please choose a star rating (1 to 5).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.requests.submitFeedback(request.id, { rating, comments });
      setSuccess(true);
      setTimeout(() => {
        if (onSubmitted) onSubmitted();
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
          <h3 className="font-bold text-base">Rate Civic Service Resolution</h3>
          <button onClick={onClose} className="text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg">Thank You!</h4>
            <p className="text-xs text-slate-500">
              Your rating helps County departments and public officers maintain high service delivery standards.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-mono text-emerald-800 font-bold">{request.reference_no}</span>
              <p className="text-slate-700 font-medium mt-0.5">{request.category}</p>
              <p className="text-slate-400 text-[11px]">{request.ward_or_landmark}, {request.county}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 text-center uppercase tracking-wider">
                How satisfied are you with this resolution?
              </label>
              <div className="flex justify-center items-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-hidden"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-semibold text-amber-700 mt-1">
                {['Very Poor', 'Poor', 'Average / Satisfactory', 'Good', 'Excellent Service!'][rating - 1]}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Citizen Feedback & Comments (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Let us know how the crew handled the issue or if any follow-up is needed..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
