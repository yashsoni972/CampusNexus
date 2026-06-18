import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  InboxIcon, PaperAirplaneIcon, DocumentTextIcon,
  TrashIcon, PencilSquareIcon, MagnifyingGlassIcon,
  PaperClipIcon, XMarkIcon, TagIcon, ChevronLeftIcon,
  ArrowPathIcon, EyeIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';
import { InboxIcon as InboxSolid } from '@heroicons/react/24/solid';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { getInitials, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const FOLDERS = [
  { key: 'inbox',  label: 'Inbox',  icon: InboxIcon,          solidIcon: InboxSolid },
  { key: 'sent',   label: 'Sent',   icon: PaperAirplaneIcon },
  { key: 'drafts', label: 'Drafts', icon: DocumentTextIcon },
  { key: 'trash',  label: 'Trash',  icon: TrashIcon },
];

const TAG_COLORS = [
  'bg-violet-100 text-violet-700', 'bg-cyan-100 text-cyan-700',
  'bg-amber-100 text-amber-700',   'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700','bg-indigo-100 text-indigo-700',
];
const tagColor = (t) => TAG_COLORS[Math.abs([...t].reduce((a, c) => a + c.charCodeAt(0), 0)) % TAG_COLORS.length];

function formatShort(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function fileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── Recipient Tag Input with @mention ────────────────────────────────────── */
function RecipientInput({ label, value, onChange }) {
  const [input, setInput]       = useState('');
  const [suggestions, setSugg]  = useState([]);
  const [loading, setLoading]   = useState(false);
  const debounce = useRef(null);

  const search = (q) => {
    clearTimeout(debounce.current);
    if (!q.trim()) { setSugg([]); return; }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      try {
        const res = await api.get('/mail/users/search', { params: { q } });
        setSugg(res.data.users || []);
      } catch {} finally { setLoading(false); }
    }, 250);
  };

  const add = (user) => {
    if (!value.find(v => v._id === user._id)) onChange([...value, user]);
    setInput(''); setSugg([]);
  };

  const remove = (id) => onChange(value.filter(v => v._id !== id));

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl min-h-[42px] focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-white relative">
      <span className="text-xs font-bold text-gray-400 mr-1">{label}</span>
      {value.map(u => (
        <span key={u._id} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
          {u.name}
          <button onClick={() => remove(u._id)} className="hover:text-red-500"><XMarkIcon className="w-3 h-3" /></button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
        placeholder={value.length === 0 ? `Search by name or email...` : ''}
        value={input}
        onChange={e => { setInput(e.target.value); search(e.target.value); }}
        onKeyDown={e => { if (e.key === 'Backspace' && !input && value.length) remove(value[value.length - 1]._id); }}
      />
      {(suggestions.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
          {loading && <div className="px-4 py-2 text-xs text-gray-400">Searching...</div>}
          {suggestions.map(u => (
            <button key={u._id} onClick={() => add(u)}
              className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-indigo-50 transition-colors text-left">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-extrabold text-indigo-700 flex-shrink-0">
                {getInitials(u.name)}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">{u.name}</p>
                <p className="text-[10px] text-gray-400">{u.email} · {u.role}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Compose Modal ─────────────────────────────────────────────────────────── */
function ComposeModal({ onClose, onSent, replyTo }) {
  const [to, setTo]             = useState(replyTo ? [replyTo.from] : []);
  const [cc, setCc]             = useState([]);
  const [subject, setSubject]   = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody]         = useState('');
  const [tags, setTags]         = useState('');
  const [files, setFiles]       = useState([]);
  const [showCc, setShowCc]     = useState(false);
  const [sending, setSending]   = useState(false);
  const fileRef = useRef(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    const total = files.length + selected.length;
    if (total > 5) { toast.error('Max 5 attachments'); return; }
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleSend = async (isDraft = false) => {
    if (!isDraft && to.length === 0) return toast.error('Add at least one recipient');
    setSending(true);
    try {
      const fd = new FormData();
      fd.append('to',      JSON.stringify(to.map(u => u._id)));
      fd.append('cc',      JSON.stringify(cc.map(u => u._id)));
      fd.append('subject', subject);
      fd.append('body',    body);
      fd.append('tags',    JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));
      fd.append('isDraft', isDraft);
      files.forEach(f => fd.append('attachments', f));

      await api.post('/mail/compose', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(isDraft ? 'Draft saved' : 'Mail sent!');
      onSent();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-2xl">
          <h3 className="text-sm font-extrabold text-white">New Message</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSend(true)} className="text-[11px] font-bold text-white/80 hover:text-white bg-white/15 px-2.5 py-1 rounded-lg transition-colors">
              Save Draft
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <XMarkIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
          <RecipientInput label="To" value={to} onChange={setTo} />

          {showCc
            ? <RecipientInput label="Cc" value={cc} onChange={setCc} />
            : <button onClick={() => setShowCc(true)} className="text-xs text-indigo-500 hover:underline ml-1">+ Add Cc</button>
          }

          <input
            value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Body */}
          <textarea
            value={body} onChange={e => setBody(e.target.value)}
            placeholder="Write your message here..."
            rows={8}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />

          {/* Tags */}
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={tags} onChange={e => setTags(e.target.value)}
              placeholder="Tags (comma separated, e.g. important, urgent)"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Attachments */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-xl text-xs">
                  <PaperClipIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium text-gray-700 max-w-[120px] truncate">{f.name}</span>
                  <span className="text-gray-400">{fileSize(f.size)}</span>
                  <button onClick={() => removeFile(i)} className="hover:text-red-500 ml-0.5"><XMarkIcon className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors">
            <PaperClipIcon className="w-4 h-4" /> Attach (max 5, 10MB each)
          </button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles}
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.xlsx,.pptx" />
          <button onClick={() => handleSend(false)} disabled={sending}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-md transition-all disabled:opacity-50">
            {sending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <PaperAirplaneIcon className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Mail Detail View ──────────────────────────────────────────────────────── */
function MailDetail({ mail, onBack, onTrash, currentUserId }) {
  const isMe = (mail.from?._id || mail.from) === currentUserId;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
        </button>
        <h2 className="text-base font-extrabold text-gray-900 flex-1 truncate">{mail.subject}</h2>
        <button onClick={() => onTrash(mail._id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Sender info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-sm flex-shrink-0">
            {getInitials(mail.from?.name || '?')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-gray-900 text-sm">{mail.from?.name}</span>
              <span className="text-xs text-gray-400">&lt;{mail.from?.email}&gt;</span>
              <span className="ml-auto text-xs text-gray-400">{formatDate(mail.createdAt)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              To: {mail.to?.map(r => r.user?.name || r.email).join(', ')}
              {mail.cc?.length > 0 && ` · Cc: ${mail.cc.map(r => r.user?.name || r.email).join(', ')}`}
            </p>
          </div>
        </div>

        {/* Tags */}
        {mail.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {mail.tags.map(t => (
              <span key={t} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColor(t)}`}>
                <TagIcon className="w-2.5 h-2.5" />{t}
              </span>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="bg-gray-50 rounded-2xl p-5 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[160px]">
          {mail.body || <span className="text-gray-400 italic">No content</span>}
        </div>

        {/* Attachments */}
        {mail.attachments?.length > 0 && (
          <div>
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">
              {mail.attachments.length} Attachment{mail.attachments.length > 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {mail.attachments.map(att => {
                const isImg = /\.(jpg|jpeg|png|gif)$/i.test(att.originalName);
                const url   = `http://localhost:5000/uploads/mail/${att.filename}`;
                return (
                  <a key={att._id} href={url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group">
                    {isImg
                      ? <img src={url} alt={att.originalName} className="w-8 h-8 rounded-lg object-cover" />
                      : <PaperClipIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />}
                    <div>
                      <p className="text-xs font-bold text-gray-700 max-w-[140px] truncate">{att.originalName}</p>
                      <p className="text-[10px] text-gray-400">{fileSize(att.size)}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Mail Component ───────────────────────────────────────────────────── */
export default function Mail() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [folder, setFolder]       = useState('inbox');
  const [mails, setMails]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [compose, setCompose]     = useState(false);
  const [replyTo, setReplyTo]     = useState(null);
  const [search, setSearch]       = useState('');
  const [unread, setUnread]       = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMails = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search.trim();
      const res = await api.get(`/mail/${folder}`, { params });
      setMails(res.data.mails || []);
      setTotalPages(res.data.totalPages || 1);
    } catch { toast.error('Failed to load mails'); }
    finally { setLoading(false); }
  }, [folder, page, search]);

  const fetchUnread = useCallback(async () => {
    try { const r = await api.get('/mail/unread-count'); setUnread(r.data.count || 0); } catch {}
  }, []);

  useEffect(() => { fetchMails(); }, [fetchMails]);
  useEffect(() => { fetchUnread(); }, [fetchUnread]);
  useEffect(() => { setPage(1); }, [folder, search]);

  // Real-time new mail notification
  useEffect(() => {
    if (!socket) return;
    const handler = (mail) => {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center gap-3 bg-white border border-indigo-100 shadow-lg rounded-2xl px-4 py-3 max-w-xs`}>
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-xs flex-shrink-0">
            {getInitials(mail.from?.name || '?')}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-gray-900 truncate">New mail from {mail.from?.name}</p>
            <p className="text-[10px] text-gray-500 truncate">{mail.subject}</p>
          </div>
        </div>
      ), { duration: 5000 });
      if (folder === 'inbox') setMails(prev => [{ ...mail, read: false }, ...prev]);
      setUnread(prev => prev + 1);
    };
    socket.on('new_mail', handler);
    return () => socket.off('new_mail', handler);
  }, [socket, folder]);

  const openMail = async (mail) => {
    try {
      const res = await api.get(`/mail/${mail._id}`);
      setSelected(res.data.mail);
      if (!mail.read && folder === 'inbox') {
        setMails(prev => prev.map(m => m._id === mail._id ? { ...m, read: true } : m));
        setUnread(prev => Math.max(0, prev - 1));
      }
    } catch { toast.error('Failed to open mail'); }
  };

  const handleTrash = async (id) => {
    try {
      await api.put(`/mail/${id}/trash`);
      toast.success('Moved to trash');
      setSelected(null);
      fetchMails();
      fetchUnread();
    } catch { toast.error('Failed to trash mail'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/mail/${id}`);
      toast.success('Deleted permanently');
      setSelected(null);
      fetchMails();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">

      {/* ── Left sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col py-4 px-3 gap-1">
        <button
          onClick={() => { setCompose(true); setReplyTo(null); }}
          className="flex items-center gap-2 w-full px-4 py-2.5 mb-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-md transition-all"
        >
          <PencilSquareIcon className="w-4 h-4" /> Compose
        </button>

        {FOLDERS.map(f => {
          const Icon = f.icon;
          const active = folder === f.key;
          return (
            <button key={f.key} onClick={() => setFolder(f.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className="flex-1 text-left">{f.label}</span>
              {f.key === 'inbox' && unread > 0 && (
                <span className="text-[10px] font-extrabold bg-indigo-600 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
          );
        })}
      </aside>

      {/* ── Mail list ─────────────────────────────────────────────────────── */}
      <div className={`flex flex-col bg-white border-r border-gray-100 transition-all ${selected ? 'w-72 hidden lg:flex flex-shrink-0' : 'flex-1'}`}>

        {/* List header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button onClick={fetchMails} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowPathIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Folder title */}
        <div className="px-4 py-2.5 border-b border-gray-50">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest capitalize">{folder}</h2>
        </div>

        {/* Mail rows */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-16"><LoadingSpinner /></div>
          ) : mails.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <InboxIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No mails here</p>
            </div>
          ) : (
            mails.map(mail => {
              const isUnread = !mail.read && folder === 'inbox';
              const isActive = selected?._id === mail._id;
              const fromName = mail.from?.name || 'Unknown';
              const toNames  = mail.to?.map(r => r.user?.name || r.email).join(', ');

              return (
                <div key={mail._id}
                  onClick={() => openMail(mail)}
                  className={`px-4 py-3.5 cursor-pointer border-b border-gray-50 transition-colors ${
                    isActive ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-gray-50'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${
                      isUnread ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getInitials(fromName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${isUnread ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-700'}`}>
                          {folder === 'sent' || folder === 'drafts' ? `To: ${toNames}` : fromName}
                        </span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{formatShort(mail.createdAt)}</span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${isUnread ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                        {mail.subject}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {mail.body?.replace(/<[^>]+>/g, '').slice(0, 60) || '(No content)'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                        {mail.attachments?.length > 0 && <PaperClipIcon className="w-3 h-3 text-gray-400" />}
                        {mail.tags?.slice(0, 2).map(t => (
                          <span key={t} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tagColor(t)}`}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 flex-shrink-0">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="text-xs font-bold text-indigo-600 disabled:opacity-30">← Prev</button>
            <span className="text-xs text-gray-400">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="text-xs font-bold text-indigo-600 disabled:opacity-30">Next →</button>
          </div>
        )}
      </div>

      {/* ── Mail detail / placeholder ─────────────────────────────────────── */}
      <div className={`flex-1 bg-white overflow-hidden ${!selected ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
        {selected ? (
          <MailDetail
            mail={selected}
            currentUserId={user?._id}
            onBack={() => setSelected(null)}
            onTrash={folder === 'trash' ? handleDelete : handleTrash}
          />
        ) : (
          <div className="text-center text-gray-300 p-8">
            <InboxSolid className="w-16 h-16 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-semibold text-gray-400">Select a mail to read</p>
            <p className="text-xs text-gray-300 mt-1">or compose a new message</p>
            <button onClick={() => setCompose(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors mx-auto">
              <PencilSquareIcon className="w-4 h-4" /> Compose
            </button>
          </div>
        )}
      </div>

      {/* ── Compose modal ─────────────────────────────────────────────────── */}
      {compose && (
        <ComposeModal
          replyTo={replyTo}
          onClose={() => { setCompose(false); setReplyTo(null); }}
          onSent={() => { fetchMails(); fetchUnread(); }}
        />
      )}
    </div>
  );
}
