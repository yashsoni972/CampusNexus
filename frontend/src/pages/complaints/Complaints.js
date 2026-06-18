import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon, MagnifyingGlassIcon, FunnelIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { timeAgo } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/LoadingSpinner';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'rejected'];
const CATEGORIES = ['Academic', 'Infrastructure', 'Administrative', 'Hostel', 'Library', 'Canteen', 'IT Support', 'Harassment', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const Complaints = () => {
  const { isAdminOrFaculty } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchComplaints = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      if (search) params.search = search;
      const res = await api.get('/complaints', { params });
      setComplaints(res.data.complaints);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    const t = setTimeout(() => fetchComplaints(1), 300);
    return () => clearTimeout(t);
  }, [fetchComplaints]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Complaints</h1>
          <p className="text-sm text-gray-500 mt-0.5">Submit and track your support tickets</p>
        </div>
        <Link to="/complaints/create" className="btn-primary gap-1.5">
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">New Complaint</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or ticket ID..."
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
            <select className="input-field text-sm" value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
            </select>
            <select className="input-field text-sm" value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input-field text-sm" value={filters.priority}
              onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
            <button
              onClick={() => setFilters({ status: '', category: '', priority: '' })}
              className="btn-secondary text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading ? <PageLoader /> : complaints.length === 0 ? (
        <EmptyState
          icon={ExclamationCircleIcon}
          title="No complaints found"
          description={search ? 'Try adjusting your search.' : 'No complaints submitted yet.'}
          action={
            <Link to="/complaints/create" className="btn-primary text-sm py-2 px-4">
              Submit a Complaint
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Priority</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {complaints.map(complaint => (
                  <tr key={complaint._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link to={`/complaints/${complaint._id}`} className="text-xs font-mono text-primary-600 hover:text-primary-700 font-medium">
                        {complaint.ticketId}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/complaints/${complaint._id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">
                        {complaint.title}
                      </Link>
                      {isAdminOrFaculty && complaint.submittedBy && (
                        <p className="text-xs text-gray-400 mt-0.5">{complaint.submittedBy.name}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <Badge type="category" value={complaint.category} />
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <Badge type="priority" value={complaint.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge type="status" value={complaint.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400 hidden lg:table-cell">
                      {timeAgo(complaint.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchComplaints(p)}
          />
        </div>
      )}
    </div>
  );
};

export default Complaints;
