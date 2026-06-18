import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon, MagnifyingGlassIcon, PlusIcon,
  ArrowRightIcon, TagIcon, SparklesIcon, CheckBadgeIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { getInitials } from '../../utils/helpers';

const TAG_COLORS = [
  'bg-violet-100 text-violet-700', 'bg-cyan-100 text-cyan-700',
  'bg-amber-100 text-amber-700',   'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700','bg-indigo-100 text-indigo-700',
  'bg-pink-100 text-pink-700',     'bg-teal-100 text-teal-700',
];
const tagColor = (tag) => TAG_COLORS[Math.abs([...tag].reduce((a, c) => a + c.charCodeAt(0), 0)) % TAG_COLORS.length];

const GRADIENTS = [
  'from-indigo-500 to-violet-600', 'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',  'from-purple-500 to-indigo-600',
];
const clubGradient = (name) => GRADIENTS[Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % GRADIENTS.length];

export default function Clubs() {
  const { user, isAdminOrFaculty } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/clubs', { params });
      setClubs(res.data.clubs || []);
    } catch {
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  const isMember = (club) => club.members?.some(m => (m.user?._id || m.user) === user?._id);
  const myRole  = (club) => club.members?.find(m => (m.user?._id || m.user) === user?._id)?.role;

  const handleJoin = async (club) => {
    setJoiningId(club._id);
    try {
      await api.post(`/clubs/${club._id}/join`);
      toast.success(`Joined "${club.name}"!`);
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    } finally { setJoiningId(null); }
  };

  const handleLeave = async (club) => {
    setJoiningId(club._id);
    try {
      await api.post(`/clubs/${club._id}/leave`);
      toast.success(`Left "${club.name}"`);
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave');
    } finally { setJoiningId(null); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Club name is required');
    setSaving(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      await api.post('/clubs', { name: form.name.trim(), description: form.description.trim(), tags });
      toast.success(`Club "${form.name}" created!`);
      setCreateModal(false);
      setForm({ name: '', description: '', tags: '' });
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create club');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 page-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
            Campus Clubs
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-11">Join clubs, chat with members, and build your campus community</p>
        </div>
        {isAdminOrFaculty && (
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all"
          >
            <PlusIcon className="w-4 h-4" /> Create Club
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20"><LoadingSpinner /></div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <UserGroupIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No clubs found</p>
          {isAdminOrFaculty && <p className="text-sm mt-1">Create the first club!</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clubs.map((club) => {
            const joined   = isMember(club);
            const role     = myRole(club);
            const gradient = clubGradient(club.name);
            const busy     = joiningId === club._id;

            return (
              <div key={club._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                {/* Banner */}
                <div className={`h-20 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                  <div className="absolute right-4 bottom-2 w-12 h-12 rounded-full bg-white/10" />
                  <div className="absolute top-3 left-4 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/25 border-2 border-white/40 flex items-center justify-center font-extrabold text-white text-sm shadow-inner">
                      {getInitials(club.name)}
                    </div>
                    {joined && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/25 px-2 py-0.5 rounded-full border border-white/30">
                        <CheckBadgeIcon className="w-3 h-3" />
                        {role === 'admin' ? 'Club Admin' : 'Member'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">{club.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {club.description || 'No description provided.'}
                    </p>
                  </div>

                  {club.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {club.tags.map(tag => (
                        <span key={tag} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColor(tag)}`}>
                          <TagIcon className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Member avatars */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {club.members?.slice(0, 4).map((m, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[9px] font-extrabold text-indigo-700">
                          {getInitials(m.user?.name || '?')}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {club.members?.length || 0} member{club.members?.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {joined ? (
                      <>
                        <button
                          onClick={() => navigate(`/clubs/${club._id}`)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-gradient-to-r ${gradient} rounded-xl hover:shadow-md transition-all`}
                        >
                          Open Chat <ArrowRightIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleLeave(club)}
                          disabled={busy}
                          className="px-3 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {busy ? '...' : 'Leave'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoin(club)}
                        disabled={busy}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
                      >
                        {busy
                          ? <div className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                          : <><SparklesIcon className="w-3.5 h-3.5" /> Join Club</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Club">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Club Name *</label>
            <input
              type="text" value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Photography Club"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What is this club about?"
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Tags <span className="font-normal text-gray-400">(comma separated)</span>
            </label>
            <input
              type="text" value={form.tags}
              onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="e.g. Arts, Creative, Photography"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setCreateModal(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-md transition-all disabled:opacity-50">
              {saving
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <PlusIcon className="w-4 h-4" />}
              Create Club
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
