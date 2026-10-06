import React from 'react';
import {
  LayoutDashboard,
  Mail,
  PenSquare,
  Search,
  ShieldAlert,
  Users,
  BarChart3,
  Inbox,
  Send,
  Trash2,
  Eye,
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, stats }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'emails', label: 'Email Management', icon: Mail, count: stats?.inbox_count },
    { id: 'compose', label: 'Add Email', icon: PenSquare },
    { id: 'search', label: 'Search & Filter', icon: Search },
    { id: 'spam', label: 'Spam Detection', icon: ShieldAlert, count: stats?.spam_count, isAlert: true },
    { id: 'users', label: 'Users Directory', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, folder: 'inbox' },
    { id: 'sent', label: 'Sent Mail', icon: Send, folder: 'sent' },
    { id: 'spam_folder', label: 'Spam Box', icon: ShieldAlert, folder: 'spam' },
    { id: 'trash', label: 'Trash', icon: Trash2, folder: 'trash' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white leading-tight">EmailGuard AI</h1>
          <span className="text-xs text-indigo-400 font-medium">PBL Project Platform</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Main Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        item.isAlert
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Folders */}
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Email Folders
          </div>
          <div className="space-y-1">
            {folders.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setCurrentPage('emails');
                    window.dispatchEvent(new CustomEvent('switch-folder', { detail: f.folder }));
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Relational DBMS Footer Badge */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-300">PostgreSQL 18</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          Active Triggers &amp; Stored Procedures synced
        </p>
      </div>
    </aside>
  );
}
