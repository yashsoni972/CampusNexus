import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon, MagnifyingGlassIcon, FunnelIcon,
  CalendarDaysIcon, MapPinIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, getCategoryColor, getStatusColor } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/LoadingSpinner';

const CATEGORIES = ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Placement', 'Holiday', 'Exam', 'Other'];
const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

const EventCard = ({ event }) => (
  <Link to={`/events/${event._id}`} className="card p-5 hover:shadow-md transition-all duration-200 block group">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <Badge type="category" value={event.category} />
          <Badge type="status" value={event.status} />
          {event.isFeatured && (
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">⭐ Featured</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors leading-snug">
          {event.title}
        </h3>
      </div>
    </div>

    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{event.description}</p>

    <div className="flex flex-col gap-1.5 text-xs text-gray-500">
      <div className="flex items-center gap-1.5">
        <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span>{formatDate(event.startDate)}{event.startTime ? ` • ${event.startTime}` : ''}</span>
      </div>
      {(event.venue || event.isOnline) && (
        <div className="flex items-center gap-1.5">
          <MapPinIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span>{event.isOnline ? 'Online Event' : event.venue}</span>
        </div>
      )}
    </div>

    {event.requiresRegistration && (
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-full"
          style={{ background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)', boxShadow: '0 3px 10px rgba(10,132,255,0.4)' }}
        >
          ✍️ Registration Required
        </span>
        {event.maxParticipants && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            {event.registeredUsers?.length || 0}/{event.maxParticipants} seats
          </span>
        )}
      </div>
    )}
  </Link>
);

const Events = () => {
  const { isAdminOrFaculty } = useAuth();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchEvents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...filters };
      if (search) params.search = search;
      const res = await api.get('/events', { params });
      setEvents(res.data.events);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    const t = setTimeout(() => fetchEvents(1), 300);
    return () => clearTimeout(t);
  }, [fetchEvents]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">Stay updated with campus activities</p>
        </div>
        {isAdminOrFaculty && (
          <Link to="/events/create" className="btn-primary gap-1.5">
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Create Event</span>
            <span className="sm:hidden">New</span>
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
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
            <select className="input-field text-sm" value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <button
              onClick={() => setFilters({ category: '', status: '' })}
              className="btn-secondary text-sm col-span-2 sm:col-span-1"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading ? <PageLoader /> : events.length === 0 ? (
        <EmptyState
          icon={CalendarDaysIcon}
          title="No events found"
          description={search ? 'Try adjusting your search.' : 'No events have been added yet.'}
        />
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {events.map(event => <EventCard key={event._id} event={event} />)}
          </div>
          <div className="card">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => fetchEvents(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
