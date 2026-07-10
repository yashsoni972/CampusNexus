import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon, PaperAirplaneIcon, UserGroupIcon,
  TagIcon, ShieldCheckIcon, EllipsisVerticalIcon,
  CheckBadgeIcon, WifiIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldSolid } from '@heroicons/react/24/solid';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { getInitials, formatDate } from '../../utils/helpers';

const TAG_COLORS = [
  'bg-violet-100 text-violet-700', 'bg-cyan-100 text-cyan-700',
  'bg-amber-100 text-amber-700',   'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700','bg-indigo-100 text-indigo-700',
];
const tagColor = (tag) => TAG_COLORS[Math.abs([...tag].reduce((a, c) => a + c.charCodeAt(0), 0)) % TAG_COLORS.length];

const GRADIENTS = [
  'from-indigo-500 to-violet-600', 'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',  'from-purple-500 to-indigo-600',
];
const clubGradient = (name = '') => GRADIENTS[Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % GRADIENTS.length];

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ClubChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { socket, connected } = useSocket();

  const [club, setClub]       = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(true);
  const [typing, setTyping]   = useState([]);
  const [memberMenuId, setMemberMenuId] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [page, setPage]       = useState(1);

  const bottomRef  = useRef(null);
  const typingTimer = useRef(null);

  // ── Fetch club + messages ──────────────────────────────────────────────────
  const fetchClub = useCallback(async () => {
    try {
      const [clubRes, msgRes] = await Promise.all([
        api.get(`/clubs/${id}`),
        api.get(`/clubs/${id}/messages?page=1&limit=50`)
      ]);
      setClub(clubRes.data.club);
      setMessages(msgRes.data.messages || []);
      setHasMore(msgRes.data.hasMore || false);
      setPage(1);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Join the club to access chat');
        navigate('/clubs');
      } else {
        toast.error('Failed to load club');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMore) return;
    setLoadingOlder(true);
    try {
      const nextPage = page + 1;
      const res = await api.get(`/clubs/${id}/messages?page=${nextPage}&limit=50`);
      setMessages(prev => [...(res.data.messages || []), ...prev]);
      setHasMore(res.data.hasMore || false);
      setPage(nextPage);
    } catch {
      toast.error('Failed to load older messages');
    } finally {
      setLoadingOlder(false);
    }
  };

  useEffect(() => { fetchClub(); }, [fetchClub]);

  // ── Socket.io events ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_club', id);

    const onMessage = (msg) => setMessages(prev => [...prev, msg]);
    const onTyping  = ({ userId, name, isTyping }) => {
      setTyping(prev =>
        isTyping
          ? prev.includes(name) ? prev : [...prev, name]
          : prev.filter(n => n !== name)
      );
    };

    socket.on('new_message', onMessage);
    socket.on('user_typing', onTyping);

    return () => {
      socket.emit('leave_club', id);
      socket.off('new_message', onMessage);
      socket.off('user_typing', onTyping);
    };
  }, [socket, id]);

  // ── Auto scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit('send_message', { clubId: id, text: text.trim() });
    socket.emit('typing', { clubId: id, isTyping: false });
    setText('');
  };

  // ── Typing indicator ───────────────────────────────────────────────────────
  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket) return;
    socket.emit('typing', { clubId: id, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { clubId: id, isTyping: false });
    }, 1500);
  };

  // ── Member role helpers ────────────────────────────────────────────────────
  const myMember    = club?.members?.find(m => (m.user?._id || m.user) === user?._id);
  const isClubAdmin = myMember?.role === 'admin' || isAdmin;

  const handleRoleChange = async (memberId, role) => {
    try {
      const res = await api.put(`/clubs/${id}/members/${memberId}/role`, { role });
      setClub(res.data.club);
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
    setMemberMenuId(null);
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/clubs/${id}/members/${memberId}`);
      toast.success('Member removed');
      fetchClub();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
    setMemberMenuId(null);
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>;
  if (!club)   return null;

  const gradient = clubGradient(club.name);
  const admins  = club.members?.filter(m => m.role === 'admin') || [];
  const members = club.members?.filter(m => m.role === 'member') || [];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">

      {/* ── Chat area ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Chat header */}
        <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${gradient} text-white shadow-md flex-shrink-0`}>
          <button onClick={() => navigate('/clubs')} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-white/25 border-2 border-white/40 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
            {getInitials(club.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm leading-tight truncate">{club.name}</p>
            <p className="text-[11px] text-white/70">
              {club.members?.length} member{club.members?.length !== 1 ? 's' : ''}
              {connected
                ? <span className="ml-2 inline-flex items-center gap-1"><WifiIcon className="w-3 h-3" /> Live</span>
                : <span className="ml-2 opacity-50">Offline</span>
              }
            </p>
          </div>
          {myMember?.role && (
            <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full border border-white/30 flex items-center gap-1 flex-shrink-0">
              {myMember.role === 'admin' ? <ShieldSolid className="w-3 h-3" /> : <CheckBadgeIcon className="w-3 h-3" />}
              {myMember.role === 'admin' ? 'Club Admin' : 'Member'}
            </span>
          )}
          <button
            onClick={() => setShowMembers(v => !v)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors lg:hidden"
          >
            <UserGroupIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

          {/* Load older messages button */}
          {hasMore && (
            <div className="text-center pb-2">
              <button
                onClick={loadOlderMessages}
                disabled={loadingOlder}
                className="px-4 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {loadingOlder ? 'Loading...' : 'Load older messages'}
              </button>
            </div>
          )}

          {messages.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <PaperAirplaneIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No messages yet</p>
              <p className="text-xs mt-1">Be the first to say something!</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = (msg.sender?._id || msg.sender) === user?._id;
            const showAvatar = !isMe && (i === 0 || (messages[i - 1]?.sender?._id || messages[i - 1]?.sender) !== (msg.sender?._id || msg.sender));
            const senderMember = club.members?.find(m => (m.user?._id || m.user) === (msg.sender?._id || msg.sender));
            const senderIsAdmin = senderMember?.role === 'admin';

            return (
              <div key={msg._id || i} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!isMe && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${senderIsAdmin ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-700'} ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                    {getInitials(msg.sender?.name || '?')}
                  </div>
                )}

                <div className={`max-w-[70%] space-y-0.5 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Sender name + role badge */}
                  {!isMe && showAvatar && (
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[11px] font-bold text-gray-700">{msg.sender?.name}</span>
                      {senderIsAdmin && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">
                          <ShieldCheckIcon className="w-2.5 h-2.5" /> Admin
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? `bg-gradient-to-br ${gradient} text-white rounded-br-sm shadow-sm`
                      : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>

                  <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typing.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">...</div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1">
                <span className="text-xs text-gray-400">{typing.join(', ')} {typing.length > 1 ? 'are' : 'is'} typing</span>
                <span className="flex gap-0.5 ml-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
          <input
            type="text"
            value={text}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!text.trim() || !connected}
            className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} text-white shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0`}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ── Members panel ───────────────────────────────────────────────────── */}
      <aside className={`w-64 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ${showMembers ? 'hidden lg:flex' : 'hidden'} lg:flex`}>

        {/* Club info */}
        <div className={`p-4 bg-gradient-to-br ${gradient} text-white flex-shrink-0`}>
          <h3 className="font-extrabold text-sm">{club.name}</h3>
          <p className="text-[11px] text-white/70 mt-0.5 line-clamp-2">{club.description || 'No description'}</p>
          {club.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {club.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-white/25 text-white px-1.5 py-0.5 rounded-full">
                  <TagIcon className="w-2 h-2" />{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">

          {/* Admins */}
          {admins.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1 mb-2 flex items-center gap-1">
                <ShieldCheckIcon className="w-3 h-3" /> Club Admins — {admins.length}
              </p>
              {admins.map(m => (
                <MemberRow
                  key={m.user?._id || m.user}
                  m={m} currentUser={user}
                  isClubAdmin={isClubAdmin}
                  menuOpen={memberMenuId === (m.user?._id || m.user)}
                  onMenuToggle={(uid) => setMemberMenuId(prev => prev === uid ? null : uid)}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemoveMember}
                />
              ))}
            </div>
          )}

          {/* Members */}
          {members.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1 mb-2 flex items-center gap-1">
                <UserGroupIcon className="w-3 h-3" /> Members — {members.length}
              </p>
              {members.map(m => (
                <MemberRow
                  key={m.user?._id || m.user}
                  m={m} currentUser={user}
                  isClubAdmin={isClubAdmin}
                  menuOpen={memberMenuId === (m.user?._id || m.user)}
                  onMenuToggle={(uid) => setMemberMenuId(prev => prev === uid ? null : uid)}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemoveMember}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Member row component ────────────────────────────────────────────────────
function MemberRow({ m, currentUser, isClubAdmin, menuOpen, onMenuToggle, onRoleChange, onRemove }) {
  const uid      = m.user?._id || m.user;
  const isMe     = uid === currentUser?._id;
  const isAdmin  = m.role === 'admin';

  return (
    <div className="relative flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 group transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 ${isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
        {getInitials(m.user?.name || '?')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate">
          {m.user?.name || 'Unknown'}{isMe && <span className="text-gray-400 font-normal"> (you)</span>}
        </p>
        <p className="text-[10px] text-gray-400 truncate">{m.user?.department || m.user?.role || ''}</p>
      </div>
      {isAdmin && <ShieldSolid className="w-3 h-3 text-indigo-500 flex-shrink-0" />}

      {/* Menu trigger — only for club admins, not on themselves */}
      {isClubAdmin && !isMe && (
        <button
          onClick={() => onMenuToggle(uid)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 transition-all"
        >
          <EllipsisVerticalIcon className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}

      {/* Dropdown */}
      {menuOpen && (
        <div className="absolute right-2 top-8 z-50 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1 text-xs">
          {isAdmin ? (
            <button onClick={() => onRoleChange(uid, 'member')}
              className="flex items-center gap-2 w-full px-3 py-2 text-amber-700 hover:bg-amber-50 transition-colors">
              <UserGroupIcon className="w-3.5 h-3.5" /> Demote to Member
            </button>
          ) : (
            <button onClick={() => onRoleChange(uid, 'admin')}
              className="flex items-center gap-2 w-full px-3 py-2 text-indigo-700 hover:bg-indigo-50 transition-colors">
              <ShieldCheckIcon className="w-3.5 h-3.5" /> Make Club Admin
            </button>
          )}
          <div className="mx-2 my-1 border-t border-gray-100" />
          <button onClick={() => onRemove(uid)}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 transition-colors">
            Remove Member
          </button>
        </div>
      )}
    </div>
  );
}
