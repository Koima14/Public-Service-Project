import React from 'react';
import { CheckCircle2, Clock, Wrench, AlertCircle, User, ShieldCheck } from 'lucide-react';

export default function StatusTimeline({ currentStatus, history = [], createdAt, resolvedAt }) {
  // Define standard linear steps
  const steps = [
    { key: 'Pending', label: 'Submitted & Logged', desc: 'Received on civic portal' },
    { key: 'In Progress', label: 'Dispatched & In Progress', desc: 'Department team mobilized' },
    { key: 'Resolved', label: 'Resolved & Closed', desc: 'Civic issue rectified' }
  ];

  const getStepState = (stepKey) => {
    if (currentStatus === 'Rejected') {
      if (stepKey === 'Pending') return 'complete';
      return 'inactive';
    }

    if (currentStatus === 'Resolved') {
      return 'complete';
    }

    if (currentStatus === 'In Progress') {
      if (stepKey === 'Pending') return 'complete';
      if (stepKey === 'In Progress') return 'active';
      return 'upcoming';
    }

    // Pending
    if (stepKey === 'Pending') return 'active';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      {/* Visual Stepper Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Lifecycle Progress Tracker
        </h4>
        <div className="grid grid-cols-3 gap-2 relative">
          {/* Connector line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

          {steps.map((step, idx) => {
            const state = getStepState(step.key);

            let iconStyle = 'bg-slate-100 text-slate-400 border-slate-300';
            let textStyle = 'text-slate-500';

            if (state === 'complete') {
              iconStyle = 'bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-50';
              textStyle = 'text-emerald-800 font-semibold';
            } else if (state === 'active') {
              iconStyle = 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-50';
              textStyle = 'text-blue-800 font-semibold';
            }

            return (
              <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all shadow-xs ${iconStyle}`}
                >
                  {state === 'complete' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : state === 'active' ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <p className={`mt-2 text-xs md:text-sm font-medium ${textStyle}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {currentStatus === 'Rejected' && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>This service request was closed without action by the administration.</span>
          </div>
        )}
      </div>

      {/* History Log Timeline */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
          <span>Action Log & Audit Trail</span>
          <span className="text-[11px] font-normal text-slate-400">{history.length} updates logged</span>
        </h4>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No activity entries recorded yet.</p>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.map((item, idx) => {
              const isResolved = item.status === 'Resolved';
              const isInProgress = item.status === 'In Progress';
              const isPending = item.status === 'Pending';

              let dotColor = 'bg-slate-400';
              if (isResolved) dotColor = 'bg-emerald-500 ring-4 ring-emerald-50';
              else if (isInProgress) dotColor = 'bg-blue-500 ring-4 ring-blue-50';
              else if (isPending) dotColor = 'bg-amber-500 ring-4 ring-amber-50';

              return (
                <div key={item.id || idx} className="relative group">
                  <span
                    className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ${dotColor} transition-transform group-hover:scale-125`}
                  />
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs text-slate-700">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {item.changed_by?.includes('Admin') ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        {item.changed_by}
                      </span>
                      <time className="text-[11px] text-slate-400">
                        {new Date(item.created_at).toLocaleString('en-KE', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                    <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200/70 text-slate-700 mb-1">
                      Status: {item.status}
                    </div>
                    {item.notes && (
                      <p className="text-slate-600 mt-0.5 leading-relaxed bg-white p-2 rounded border border-slate-100">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
