import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  UsersIcon, MagnifyingGlassIcon, FunnelIcon,
  EllipsisVerticalIcon, UserCircleIcon, ShieldCheckIcon,
  TrashIcon, PencilSquareIcon, CheckCircleIcon,
  XCircleIcon, ArrowPathIcon, AcademicCapIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { formatDate, getInitials } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const ROLES = ['all', 'student', 'faculty', 'admin'];

const roleTagColors = {
  student: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  faculty: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  admin:   'bg-rose-100 text-rose-700 border border-rose-200',
};

const StatCard = ({ label, value, icon: Icon, gradient }) => (
  <div className={`rounded-2xl p-5 text-white ${gradient} hover-lift`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-white/70 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-extrabold mt-1">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

/* ─── Portal Dropdown ─────────────────────────────────────────────────────────
   Renders the menu at document.body level using a fixed position calculated
   from the trigger button's bounding rect → never clipped by overflow:hidden
──────────────────────────────────────────────────────────────────────────── */
const PortalMenu = ({ triggerRef, onClose, children }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClose = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    // Small delay so the opening click doesn't immediately close it
    const t = setTimeout(() => {
      document.addEventListener('mousedown', handleClose);
    }, 50);

    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handleClose);
    };
  }, [onClose, triggerRef]);

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="w-56 bg-white border border-gray-100 rounded-2xl py-1.5 animate-scale-in origin-top-right"
      style={{
        position: 'fixed',
        top:   triggerRef.current ? triggerRef.current.getBoundingClientRect().bottom + 6 : 0,
        right: triggerRef.current ? window.innerWidth - triggerRef.current.getBoundingClientRect().right : 0,
        zIndex: 9999,
        boxShadow: '0 8px 40px -8px rgba(79,70,229,0.25), 0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {children}
    </div>,
    document.body
  );
};

/* ─── Action Menu Button ──────────────────────────────────────────────────── */
const ActionMenu = ({ user: u, onChangeRole, onToggleStatus, onDelete }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        className={`p-1.5 rounded-lg transition-all text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 ${open ? 'bg-indigo-50 text-indigo-600' : ''}`}
        title="Actions"
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>

      {open && (
        <PortalMenu triggerRef={btnRef} onClose={close}>
          {/* Change Role */}
          <button
            onClick={() => { onChangeRole(u); close(); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <PencilSquareIcon className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <span className="font-medium">Change Role</span>
          </button>

          {/* Activate / Deactivate */}
          <button
            onClick={() => { onToggleStatus(u); close(); }}
            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
              u.isActive
                ? 'text-amber-700 hover:bg-amber-50'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${u.isActive ? 'bg-amber-50' : 'bg-emerald-50'}`}>
              {u.isActive
                ? <XCircleIcon className="w-3.5 h-3.5 text-amber-600" />
                : <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
              }
            </div>
            <span className="font-medium">{u.isActive ? 'Deactivate User' : 'Activate User'}</span>
          </button>

          {/* Divider */}
          <div className="mx-3 my-1 border-t border-gray-100" />

          {/* Delete */}
          <button
            onClick={() => { onDelete(u); close(); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <TrashIcon className="w-3.5 h-3.5 text-red-500" />
            </div>
            <span className="font-medium">Delete User</span>
          </button>
        </PortalMenu>
      )}
    </>
  );
};

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function AdminUsers() {
  const { isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [roleModal, setRoleModal] = useState({ open: false, user: null, newRole: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const LIMIT = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'all') params.role = roleFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;
    setActionLoading(true);
    try {
      await api.delete(`/users/${deleteModal.user._id}`);
      toast.success(`"${deleteModal.user.name}" deleted successfully`);
      setDeleteModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleModal.user || !roleModal.newRole) return;
    setActionLoading(true);
    try {
      await api.put(`/users/${roleModal.user._id}/role`, { role: roleModal.newRole });
      toast.success(`Role updated to "${roleModal.newRole}"`);
      setRoleModal({ open: false, user: null, newRole: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/users/${user._id}/toggle-status`);
      toast.success(user.isActive ? `${user.name} deactivated` : `${user.name} activated`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const counts = {
    students: users.filter(u => u.role === 'student').length,
    faculty:  users.filter(u => u.role === 'faculty').length,
    admins:   users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 page-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            {isAdmin ? 'User Management' : 'Manage Users'}
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-11">
            {isAdmin ? 'Manage all registered users on CampusNexus' : 'Manage roles, status and access of users'}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={total}           icon={UsersIcon}       gradient="bg-gradient-to-br from-indigo-500 to-violet-600" />
        <StatCard label="Students"    value={counts.students} icon={UserCircleIcon}  gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard label="Faculty"     value={counts.faculty}  icon={AcademicCapIcon} gradient="bg-gradient-to-br from-cyan-500 to-blue-600" />
        <StatCard label="Admins"      value={counts.admins}   icon={ShieldCheckIcon} gradient="bg-gradient-to-br from-rose-500 to-pink-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex gap-1.5 flex-wrap">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                    roleFilter === role
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {role === 'all' ? 'All Roles' : role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table — NO overflow-hidden so dropdowns are not clipped */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="py-16"><LoadingSpinner /></div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description={search ? 'Try adjusting your search or filters' : 'No users registered yet'}
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Role</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Department</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-indigo-50/20 transition-colors">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${
                            u.role === 'admin'   ? 'bg-rose-100 text-rose-700'
                            : u.role === 'faculty' ? 'bg-cyan-100 text-cyan-700'
                            : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {getInitials(u.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${roleTagColors[u.role] || 'bg-gray-100 text-gray-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      {/* Department */}
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-gray-500 text-xs font-medium">{u.department || '—'}</span>
                      </td>
                      {/* Joined */}
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-gray-400 text-xs">{formatDate(u.createdAt)}</span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Inactive
                          </span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {isAdmin ? (
                          <ActionMenu
                            user={u}
                            onChangeRole={(user) => setRoleModal({ open: true, user, newRole: user.role })}
                            onToggleStatus={handleToggleStatus}
                            onDelete={(user) => setDeleteModal({ open: true, user })}
                          />
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">View only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Delete User"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 bg-red-50 rounded-xl border border-red-100">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-sm font-extrabold text-red-700 flex-shrink-0">
              {getInitials(deleteModal.user?.name)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{deleteModal.user?.name}</p>
              <p className="text-xs text-gray-500">{deleteModal.user?.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete this user? This action{' '}
            <span className="font-bold text-red-600">cannot be undone</span> and will permanently remove all their data.
          </p>
          <div className="flex gap-3 justify-end pt-1">
            <button
              onClick={() => setDeleteModal({ open: false, user: null })}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
            >
              {actionLoading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                : <><TrashIcon className="w-4 h-4" /> Delete User</>
              }
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Change Role Modal ── */}
      <Modal
        isOpen={roleModal.open}
        onClose={() => setRoleModal({ open: false, user: null, newRole: '' })}
        title="Change User Role"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${roleTagColors[roleModal.user?.role] || 'bg-gray-100 text-gray-700'}`}>
              {getInitials(roleModal.user?.name)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{roleModal.user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">Current role: {roleModal.user?.role}</p>
            </div>
          </div>

          <div className="space-y-2">
            {['student', 'faculty', 'admin'].map((role) => (
              <label
                key={role}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  roleModal.newRole === role
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={roleModal.newRole === role}
                  onChange={(e) => setRoleModal((p) => ({ ...p, newRole: e.target.value }))}
                  className="text-indigo-600 accent-indigo-600"
                />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold ${roleTagColors[role]}`}>
                  {role[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold capitalize text-gray-800">{role}</p>
                  <p className="text-xs text-gray-400">
                    {role === 'student' ? 'Standard student access' : role === 'faculty' ? 'Faculty & management access' : 'Full system access'}
                  </p>
                </div>
                {roleModal.user?.role === role && (
                  <span className="text-xs font-bold text-indigo-500 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                    Current
                  </span>
                )}
              </label>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <button
              onClick={() => setRoleModal({ open: false, user: null, newRole: '' })}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRoleChange}
              disabled={actionLoading || roleModal.newRole === roleModal.user?.role}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
            >
              {actionLoading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                : <><ShieldCheckIcon className="w-4 h-4" /> Update Role</>
              }
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
