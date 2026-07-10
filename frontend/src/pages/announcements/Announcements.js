import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon, PlusIcon, FunnelIcon,
  MegaphoneIcon, BookmarkIcon, PaperClipIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { timeAgo, truncate } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/LoadingSpinner';

const CATEGORIES = ['Academic', 'Administrative', 'Cultural', 'Sports', 'Placement', 'Holiday', 'Exam', 'General'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const AnnouncementCard = ({ announcement }) => (
  <Link
    to={`/announcements/${announcement._id}`}
    className="card p-5 hover:shadow-md transition-all duration-200 block group"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          {announcement.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
              <BookmarkIcon className="w-3 h-3" /> Pinned
            </span>
          )}
          <Badge type="category" value={announcement.category} />
          <Badge type="priority" value={announcement.priority} />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug">
          {announcement.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          {truncate(announcement.content, 120)}
        </p>
      </div>
    </div>
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
          {announcement.author?.name?.charAt(0) || 'A'}
        </div>
        <span className="text-xs text-gray-500">{announcement.author?.name}</span>
        <span className="text-gray-300">•</span>
        <span className="text-xs text-gray-400 capitalize">{announcement.author?.role}</span>
      </div>
      <div className="flex items-center gap-2">
        {announcement.attachments?.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            <PaperClipIcon className="w-3 h-3" />
            {announcement.attachments.length}
          </span>
        )}
        <span className="text-xs text-gray-400">{timeAgo(announcement.createdAt)}</span>
      </div>
    </div>
  </Link>
);

const Announcements = () => {
  const { isAdminOrFaculty } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', priority: '', pinned: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchAnnouncements = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      if (search) params.search = search;
      const res = await api.get('/announcements', { params });
      setAnnouncements(res.data.announcements);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    const t = setTimeout(() => fetchAnnouncements(1), 300);
    return () => clearTimeout(t);
  }, [fetchAnnouncements]);

  const pinnedAnnouncements = announcements.filter(a => a.isPinned);
  const regularAnnouncements = announcements.filter(a => !a.isPinned);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Stay updated with the latest campus news</p>
        </div>
        {isAdminOrFaculty && (
          <Link to="/announcements/create" className="btn-primary gap-1.5">
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">New Announcement</span>
            <span className="sm:hidden">New</span>
          </Link>
        )}
      </div>

      {/* Search and filters */}
      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              className="input-field pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary gap-1.5 ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : ''}`}
          >
            <FunnelIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select className="input-field text-sm" value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input-field text-sm" value={filters.priority}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <select className="input-field text-sm" value={filters.pinned}
              onChange={e => setFilters(f => ({ ...f, pinned: e.target.value }))}>
              <option value="">All Announcements</option>
              <option value="true">Pinned Only</option>
            </select>
            <button
              onClick={() => setFilters({ category: '', priority: '', pinned: '' })}
              className="btn-secondary text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={MegaphoneIcon}
          title="No announcements found"
          description={search || Object.values(filters).some(Boolean) ? 'Try adjusting your search or filters.' : 'No announcements have been posted yet.'}
        />
      ) : (
        <div className="space-y-4">
          {/* Pinned section */}
          {pinnedAnnouncements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookmarkIcon className="w-4 h-4 text-yellow-500" />
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pinned</h2>
              </div>
              <div className="space-y-3">
                {pinnedAnnouncements.map(a => <AnnouncementCard key={a._id} announcement={a} />)}
              </div>
            </div>
          )}

          {/* Regular announcements */}
          {regularAnnouncements.length > 0 && (
            <div>
              {pinnedAnnouncements.length > 0 && (
                <div className="flex items-center gap-2 mb-3 mt-5">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">All Announcements</h2>
                </div>
              )}
              <div className="space-y-3">
                {regularAnnouncements.map(a => <AnnouncementCard key={a._id} announcement={a} />)}
              </div>
            </div>
          )}

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchAnnouncements(p)}
          />
        </div>
      )}
    </div>
  );
};

export default Announcements;
