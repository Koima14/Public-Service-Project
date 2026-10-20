import React from 'react';
import { X, Bell, MessageSquare, CheckCheck, Smartphone, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, unreadCount, markNotificationsRead } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-700 rounded-lg">
              <Bell className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Notifications & SMS Alerts</h3>
              <p className="text-[11px] text-emerald-200">Civic dispatch alerts & service updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markNotificationsRead}
                className="text-[11px] bg-emerald-700/80 hover:bg-emerald-700 text-emerald-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-emerald-200 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-900">
          <Info className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>
            Real-time SMS gateway simulation: Citizens receive SMS notifications automatically whenever a ticket status transitions.
          </span>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition-all text-xs ${
                  n.is_read
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-emerald-50/60 border-emerald-200 text-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200">
                    <Smartphone className="w-3 h-3 text-emerald-600" />
                    {n.channel || 'SMS Alert'}
                  </span>
                  <time className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>

                <h5 className="font-bold text-slate-800 mb-1">{n.title}</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-white/70 p-2 rounded border border-slate-100">
                  {n.message}
                </p>

                {n.recipient && (
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <span>Sent to:</span>
                    <span className="font-mono">{n.recipient}</span>
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-400">
            eCitizen Civic Automated Notification Engine
          </p>
        </div>
      </div>
    </div>
  );
}
