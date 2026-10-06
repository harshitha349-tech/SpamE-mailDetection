/**
 * App.jsx - Main application shell
 * Wires AuthContext, LoginPage, and the main dashboard shell together.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { api } from './services/api';
import {
  Mail, ShieldAlert, Search, LayoutDashboard, Users,
  BarChart3, PenSquare, Send, Inbox, Trash2, Eye,
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DASHBOARD PAGE
   ───────────────────────────────────────────── */
function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard…" />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-6">System Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Emails" value={stats?.total_emails ?? '—'} color="indigo" />
        <StatCard label="Users" value={stats?.total_users ?? '—'} color="sky" />
        <StatCard label="Spam Detected" value={stats?.total_spam_detected ?? '—'} color="rose" />
        <StatCard label="Spam Ratio" value={stats ? `${stats.spam_ratio}%` : '—'} color="amber" />
      </div>

      {/* Category Breakdown */}
      {stats?.categories_breakdown && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Category Breakdown</h3>
          <div className="space-y-2">
            {stats.categories_breakdown.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium">{c.name}</span>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-semibold">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      {stats?.status_breakdown && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Status Breakdown</h3>
          <div className="space-y-2">
            {stats.status_breakdown.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium">{s.status}</span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">Audit Events: {stats?.audit_events_count ?? '—'}</p>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    sky:    'bg-sky-50 text-sky-700 border-sky-100',
    rose:   'bg-rose-50 text-rose-700 border-rose-100',
    amber:  'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.indigo}`}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs font-medium mt-1 opacity-75">{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EMAIL LIST PAGE
   ───────────────────────────────────────────── */
function EmailsPage({ folder }) {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.getEmails({ folder: folder || undefined, user_id: user?.user_id })
      .then(setEmails)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [folder, user]);

  useEffect(() => { load(); }, [load]);

  // listen for folder switch events from Sidebar
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('switch-folder', handler);
    return () => window.removeEventListener('switch-folder', handler);
  }, [load]);

  if (loading) return <LoadingSpinner label="Loading emails…" />;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Email list */}
      <div className="w-1/2 border-r border-slate-200 overflow-y-auto">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {folder ? folder.charAt(0).toUpperCase() + folder.slice(1) : 'All Emails'}
            <span className="ml-2 text-slate-400 font-normal">({emails.length})</span>
          </h2>
          <button onClick={load} className="p-1 text-slate-400 hover:text-indigo-600 rounded"><RefreshCw className="w-4 h-4" /></button>
        </div>
        {emails.length === 0 ? (
          <p className="p-6 text-slate-400 text-sm text-center">No emails found.</p>
        ) : (
          emails.map((e) => (
            <div
              key={e.email_id}
              onClick={() => setSelected(e)}
              className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selected?.email_id === e.email_id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {e.spam_detection?.classification === 'Spam' && (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    )}
                    <span className="text-xs text-slate-500 truncate">{e.sender?.name || e.sender?.email}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 truncate">{e.subject}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{e.body?.slice(0, 80)}…</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={e.status} />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(e.received_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Email detail panel */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <EmailDetail email={selected} onClose={() => setSelected(null)} onRefresh={load} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            <div className="text-center">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmailDetail({ email, onClose, onRefresh }) {
  const [updating, setUpdating] = useState(false);

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      await api.updateEmailStatus(email.email_id, status);
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const deleteEmail = async () => {
    setUpdating(true);
    try {
      await api.deleteEmail(email.email_id);
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{email.subject}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">&times;</button>
      </div>

      <div className="text-xs text-slate-500 space-y-1 mb-4">
        <p><span className="font-medium text-slate-700">From:</span> {email.sender?.name} &lt;{email.sender?.email}&gt;</p>
        <p><span className="font-medium text-slate-700">To:</span> {email.receiver?.name} &lt;{email.receiver?.email}&gt;</p>
        <p><span className="font-medium text-slate-700">Date:</span> {new Date(email.received_at).toLocaleString()}</p>
        <p><span className="font-medium text-slate-700">Status:</span> <StatusBadge status={email.status} /></p>
        {email.category && <p><span className="font-medium text-slate-700">Category:</span> {email.category.category_name}</p>}
      </div>

      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 mb-4 whitespace-pre-wrap leading-relaxed">
        {email.body}
      </div>

      {/* Spam info */}
      {email.spam_detection && (
        <div className={`rounded-lg p-3 text-xs mb-4 border ${email.spam_detection.classification === 'Spam' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          <div className="flex items-center gap-1.5 font-semibold mb-1">
            {email.spam_detection.classification === 'Spam'
              ? <ShieldAlert className="w-3.5 h-3.5" />
              : <CheckCircle className="w-3.5 h-3.5" />}
            ML Classification: {email.spam_detection.classification}
            <span className="ml-auto font-normal">Score: {email.spam_detection.spam_score}</span>
          </div>
          <p className="opacity-80">{email.spam_detection.reason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => changeStatus('Read')} disabled={updating} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Mark Read
        </button>
        <button onClick={() => changeStatus('Inbox')} disabled={updating} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors flex items-center gap-1.5">
          <Inbox className="w-3.5 h-3.5" /> Move to Inbox
        </button>
        <button onClick={() => changeStatus('Spam')} disabled={updating} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" /> Mark Spam
        </button>
        <button onClick={deleteEmail} disabled={updating} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5" /> Delete / Trash
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPOSE PAGE
   ───────────────────────────────────────────── */
function ComposePage({ onSent }) {
  const [form, setForm] = useState({ receiver_id: '', subject: '', body: '', category_id: 1, auto_detect_spam: true });
  const [users, setUsers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getUsers().then(setUsers).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const data = await api.createEmail({ ...form, receiver_id: parseInt(form.receiver_id) });
      setResult(data);
      setForm({ receiver_id: '', subject: '', body: '', category_id: 1, auto_detect_spam: true });
      if (onSent) onSent();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Compose Email</h2>
      {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm">{error}</div>}
      {result && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          <div className="flex items-center gap-2 font-semibold mb-2">
            <CheckCircle className="w-4 h-4" /> Email sent! (ID: {result.email_id})
          </div>
          {result.spam_detection && (
            <p>ML Classification: <strong>{result.spam_detection.classification}</strong> (score: {result.spam_detection.spam_score})</p>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Recipient</label>
          <select
            required value={form.receiver_id} onChange={(e) => setForm({ ...form, receiver_id: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">— Select recipient —</option>
            {users.map((u) => <option key={u.user_id} value={u.user_id}>{u.name} ({u.email})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
          <input required type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Email subject" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
          <textarea required rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Write your message here…" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="auto_detect" checked={form.auto_detect_spam}
            onChange={(e) => setForm({ ...form, auto_detect_spam: e.target.checked })}
            className="rounded border-slate-300 text-indigo-600" />
          <label htmlFor="auto_detect" className="text-sm text-slate-600">Auto-detect spam with ML classifier</label>
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? 'Sending…' : 'Send Email'}
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SEARCH PAGE
   ───────────────────────────────────────────── */
function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const data = await api.searchEmails({ q });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Search Emails</h2>
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search by keyword (subject, body, sender…)" />
        <button type="submit" disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </form>
      {searched && (
        <div>
          <p className="text-sm text-slate-500 mb-3">{results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;</p>
          {results.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">No emails match your query.</p>
          ) : (
            <div className="space-y-3">
              {results.map((e) => (
                <div key={e.email_id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{e.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{e.sender_name} → {e.receiver_name}</p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{e.body}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={e.status} />
                      {e.classification && (
                        <span className={`mt-1 block text-[10px] font-medium ${e.classification === 'Spam' ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {e.classification}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SPAM DETECTION PAGE
   ───────────────────────────────────────────── */
function SpamPage() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const data = await api.predictSpam(subject, body);
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Spam Detection</h2>
      <p className="text-sm text-slate-500 mb-6">Test the ML spam classifier (Multinomial Naive Bayes, 94.4% accuracy on holdout set).</p>

      <form onSubmit={handlePredict} className="space-y-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
          <input required type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Email subject to classify" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
          <textarea required rows={5} value={body} onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Email body content" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          {loading ? 'Analyzing…' : 'Analyze for Spam'}
        </button>
      </form>

      {result && (
        <div className={`rounded-xl border p-5 ${result.is_spam ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className={`flex items-center gap-2 text-lg font-bold mb-3 ${result.is_spam ? 'text-rose-700' : 'text-emerald-700'}`}>
            {result.is_spam ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            {result.classification}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Spam Score</span>
              <span className="font-semibold">{result.spam_score} ({result.confidence_percentage}%)</span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block mb-1">Reason</span>
              <p className={`text-xs leading-relaxed ${result.is_spam ? 'text-rose-600' : 'text-emerald-600'}`}>{result.reason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   USERS PAGE
   ───────────────────────────────────────────── */
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading users…" />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Users Directory</h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.user_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-500">{u.user_id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REPORTS PAGE
   ───────────────────────────────────────────── */
function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports().then(setReports).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading analytics…" />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Reports &amp; Analytics</h2>
      <pre className="bg-slate-900 text-emerald-400 rounded-xl p-5 text-xs overflow-x-auto leading-relaxed">
        {JSON.stringify(reports, null, 2)}
      </pre>
      <p className="mt-3 text-xs text-slate-400">Data served live from PostgreSQL stored functions.</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARED: StatusBadge, LoadingSpinner
   ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Inbox: 'bg-indigo-50 text-indigo-700',
    Read:  'bg-slate-100 text-slate-600',
    Spam:  'bg-rose-50 text-rose-700',
    Trash: 'bg-slate-100 text-slate-500',
    Sent:  'bg-sky-50 text-sky-700',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center h-full min-h-40">
      <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP SHELL (authenticated layout)
   ───────────────────────────────────────────── */
function AppShell() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState('login'); // 'login' | 'register'

  // Listen for sidebar folder switches
  useEffect(() => {
    const handler = (ev) => {
      setCurrentFolder(ev.detail);
      setCurrentPage('emails');
    };
    window.addEventListener('switch-folder', handler);
    return () => window.removeEventListener('switch-folder', handler);
  }, []);

  // Reset folder when navigating away from emails
  useEffect(() => {
    if (currentPage !== 'emails') setCurrentFolder(null);
  }, [currentPage]);

  if (loading) return <LoadingSpinner label="Verifying session…" />;

  if (!isAuthenticated) {
    return <LoginPage onNavigateRegister={() => setPage('register')} />;
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
    // Re-mount the active page by toggling
    const cur = currentPage;
    setCurrentPage('__reload__');
    setTimeout(() => setCurrentPage(cur), 50);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'emails':    return <EmailsPage folder={currentFolder} />;
      case 'compose':   return <ComposePage onSent={() => setCurrentPage('emails')} />;
      case 'search':    return <SearchPage />;
      case 'spam':      return <SpamPage />;
      case 'users':     return <UsersPage />;
      case 'reports':   return <ReportsPage />;
      default:          return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT EXPORT
   ───────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
