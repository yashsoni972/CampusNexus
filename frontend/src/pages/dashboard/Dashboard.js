import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MegaphoneIcon, ExclamationCircleIcon, CalendarDaysIcon,
  UsersIcon, ChartBarIcon, PlusIcon, CheckCircleIcon,
  ArrowTrendingUpIcon, AcademicCapIcon,
  PencilSquareIcon, XMarkIcon, MagnifyingGlassIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { timeAgo } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

/* ─── Shared stat card ─── */
const StatCard = ({ icon: Icon, label, value, sub, color, href }) => (
  <Link to={href || '#'} className="card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group block">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 mt-1">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </Link>
);

/* ─────────────────────────────── ADMIN DASHBOARD ─────────────────────────────── */
const AdminDashboard = ({ data }) => {
  const { overview, charts, recentActivity } = data;
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', content: '', priority: 'medium' });
  const [broadcasting, setBroadcasting] = useState(false);

  const handleBroadcast = async () => {
    if (!broadcastForm.title.trim() || !broadcastForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setBroadcasting(true);
    try {
      await api.post('/announcements', {
        ...broadcastForm,
        category: 'Administrative',
        targetAudience: 'all',
        isPinned: true,
      });
      toast.success('Broadcast sent to all users!');
      setBroadcastModal(false);
      setBroadcastForm({ title: '', content: '', priority: 'medium' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Broadcast failed');
    } finally {
      setBroadcasting(false);
    }
  };

  const statusData = charts?.complaintStatusBreakdown || [];
  const trendData = (charts?.complaintsTrend || []).map(d => ({
    name: `${d._id.month}/${d._id.year}`,
    Complaints: d.count,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={UsersIcon}              label="Total Students"   value={overview.totalStudents}      sub={`+${overview.newUsersThisMonth} this month`}         color="bg-indigo-100 text-indigo-600"  href="/admin/users" />
        <StatCard icon={AcademicCapIcon}        label="Total Faculty"    value={overview.totalFaculty}       sub="Active faculty members"                              color="bg-cyan-100 text-cyan-600"      href="/admin/users" />
        <StatCard icon={ExclamationCircleIcon}  label="Open Tickets"     value={overview.openComplaints}     sub={`${overview.resolutionRate}% resolution rate`}       color="bg-amber-100 text-amber-600"    href="/complaints" />
        <StatCard icon={CalendarDaysIcon}       label="Upcoming Events"  value={overview.upcomingEvents}     sub={`${overview.eventsThisMonth} this month`}            color="bg-emerald-100 text-emerald-600" href="/events" />
      </div>

      {/* Quick Broadcast Banner */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <MegaphoneIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Quick Broadcast</p>
            <p className="text-xs text-gray-500">Send an announcement to all students, faculty and admins instantly</p>
          </div>
        </div>
        <button onClick={() => setBroadcastModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex-shrink-0">
          <PlusIcon className="w-4 h-4" /> Broadcast Now
        </button>
      </div>

      {/* Broadcast Modal */}
      {broadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MegaphoneIcon className="w-5 h-5 text-indigo-600" /> Broadcast to All Users
              </h3>
              <button onClick={() => setBroadcastModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Title *</label>
                <input type="text" value={broadcastForm.title}
                  onChange={e => setBroadcastForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Important Notice — Campus Closure"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Message *</label>
                <textarea rows={4} value={broadcastForm.content}
                  onChange={e => setBroadcastForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Your announcement message..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Priority</label>
                <select value={broadcastForm.priority}
                  onChange={e => setBroadcastForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setBroadcastModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                <button onClick={handleBroadcast} disabled={broadcasting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {broadcasting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <><MegaphoneIcon className="w-4 h-4" /> Send Broadcast</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
              <ChartBarIcon className="w-3.5 h-3.5 text-indigo-600" />
            </span>
            Complaints Trend (Last 6 Months)
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="Complaints" fill="url(#barGrad)" radius={[5, 5, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No trend data yet</div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Complaint Status</h3>
          {statusData.some(s => s.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} label={false}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No complaint data</div>
          )}
        </div>
      </div>

      {charts?.complaintsByCategory?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Complaints by Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {charts.complaintsByCategory.map((cat, i) => (
              <div key={cat._id} className="text-center p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors">
                <p className="text-xl font-bold text-gray-900">{cat.count}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{cat._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Recent Complaints</h3>
            <Link to="/complaints" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity?.complaints?.length > 0 ? recentActivity.complaints.map(c => (
              <Link to={`/complaints/${c._id}`} key={c._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{c.ticketId}</span>
                    <Badge type="category" value={c.category} />
                  </div>
                </div>
                <Badge type="status" value={c.status} />
              </Link>
            )) : <p className="px-5 py-4 text-sm text-gray-400">No complaints yet</p>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Recent Announcements</h3>
            <Link to="/announcements" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity?.announcements?.length > 0 ? recentActivity.announcements.map(a => (
              <Link to={`/announcements/${a._id}`} key={a._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                </div>
                <Badge type="category" value={a.category} />
              </Link>
            )) : <p className="px-5 py-4 text-sm text-gray-400">No announcements yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────── FACULTY DASHBOARD ─────────────────────────────── */
const FacultyDashboard = ({ data }) => {
  const { overview, recentActivity, myEvents } = data;
  const { user: facultyUser } = useAuth();

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [attendanceModal, setAttendanceModal] = useState({ open: false, student: null });
  const [attendanceValue, setAttendanceValue] = useState('');
  const [cgpaModal, setCgpaModal] = useState({ open: false, student: null });
  const [cgpaValue, setCgpaValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchStudents = async (query = '', semester = '') => {
    setLoadingStudents(true);
    try {
      const params = {};
      // Faculty can only see students from their own department
      if (facultyUser?.department) params.department = facultyUser.department;
      if (query.trim()) params.search = query.trim();
      if (semester) params.semester = semester;
      const res = await api.get('/users/students', { params });
      setStudents(res.data.students || []);
      setStudentsLoaded(true);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const openAttendanceModal = (student) => {
    setAttendanceModal({ open: true, student });
    setAttendanceValue(student.attendance !== undefined ? String(student.attendance) : '0');
  };

  const openCgpaModal = (student) => {
    setCgpaModal({ open: true, student });
    setCgpaValue(student.cgpa !== undefined ? String(student.cgpa) : '');
  };

  const handleUpdateCgpa = async () => {
    const val = parseFloat(cgpaValue);
    if (isNaN(val) || val < 0 || val > 10) {
      toast.error('Enter a valid CGPA between 0.0 and 10.0');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/users/${cgpaModal.student._id}`, { cgpa: val });
      setStudents(prev => prev.map(s =>
        s._id === cgpaModal.student._id ? { ...s, cgpa: val } : s
      ));
      toast.success(`CGPA updated to ${val} for ${cgpaModal.student.name}`);
      setCgpaModal({ open: false, student: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update CGPA');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAttendance = async () => {
    const val = parseFloat(attendanceValue);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error('Enter a valid attendance between 0 and 100');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/users/${attendanceModal.student._id}`, { attendance: val });
      // Update row in-place immediately — no full reload needed
      setStudents(prev => prev.map(s =>
        s._id === attendanceModal.student._id ? { ...s, attendance: val } : s
      ));
      toast.success(`Attendance updated to ${val}% for ${attendanceModal.student.name}`);
      setAttendanceModal({ open: false, student: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard icon={UsersIcon}             label="Total Students"  value={overview?.totalStudents}      color="bg-cyan-100 text-cyan-600"      href="/admin/users" />
        <StatCard icon={MegaphoneIcon}         label="Announcements"   value={overview?.totalAnnouncements} color="bg-indigo-100 text-indigo-600"  href="/announcements" />
        <StatCard icon={ExclamationCircleIcon} label="Open Tickets"    value={overview?.openComplaints}     color="bg-amber-100 text-amber-600"    href="/complaints" />
        <StatCard icon={CalendarDaysIcon}      label="Upcoming Events" value={overview?.upcomingEvents}     color="bg-emerald-100 text-emerald-600" href="/events" />
      </div>

      {/* ── Attendance Management ── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-cyan-50 flex items-center justify-center">
                <AcademicCapIcon className="w-3.5 h-3.5 text-cyan-600" />
              </span>
              Student Attendance — {facultyUser?.department || 'Your Department'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 ml-8">Showing students from your department only. Click the edit icon to update attendance.</p>
          </div>
          <button
            onClick={() => fetchStudents(searchStudent, semesterFilter)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
            {studentsLoaded ? 'Refresh' : 'Load Students'}
          </button>
        </div>

        {/* Search + Semester Filter */}
        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[160px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or roll no..."
              value={searchStudent}
              onChange={(e) => { setSearchStudent(e.target.value); if (studentsLoaded) fetchStudents(e.target.value, semesterFilter); }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={semesterFilter}
            onChange={(e) => { setSemesterFilter(e.target.value); if (studentsLoaded) fetchStudents(searchStudent, e.target.value); }}
            className="py-2 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
        </div>

        {loadingStudents ? (
          <div className="py-10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            Click "Load Students" to view students
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {students.map(s => (
              <div key={s._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700 flex-shrink-0">
                  {s.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.rollNumber || s.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="text-sm font-bold px-2.5 py-1 rounded-lg bg-violet-100 text-violet-700">
                      {s.cgpa !== undefined ? s.cgpa : '—'}
                    </div>
                    <button
                      onClick={() => openCgpaModal(s)}
                      className="p-1.5 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors"
                      title="Update CGPA"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                      (s.attendance ?? 0) >= 75 ? 'bg-emerald-100 text-emerald-700'
                      : (s.attendance ?? 0) >= 60 ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                      {s.attendance ?? 0}%
                    </div>
                    <button
                      onClick={() => openAttendanceModal(s)}
                      className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Update attendance"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CGPA Update Modal */}
      {cgpaModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCgpaModal({ open: false, student: null })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Update CGPA</h3>
              <button onClick={() => setCgpaModal({ open: false, student: null })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700">
                  {cgpaModal.student?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{cgpaModal.student?.name}</p>
                  <p className="text-xs text-gray-500">{cgpaModal.student?.rollNumber || cgpaModal.student?.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  CGPA (0.0 – 10.0)
                </label>
                <input
                  type="number" min="0" max="10" step="0.01"
                  value={cgpaValue}
                  onChange={(e) => setCgpaValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="e.g. 8.5"
                  autoFocus
                />
              </div>
              {cgpaValue !== '' && !isNaN(parseFloat(cgpaValue)) && (
                <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                  parseFloat(cgpaValue) >= 8 ? 'bg-emerald-50 text-emerald-700'
                  : parseFloat(cgpaValue) >= 6 ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
                }`}>
                  {parseFloat(cgpaValue) >= 8 ? 'Distinction' : parseFloat(cgpaValue) >= 6 ? 'Average' : 'Below average'}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setCgpaModal({ open: false, student: null })}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleUpdateCgpa} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:shadow-md transition-all disabled:opacity-50">
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><CheckCircleIcon className="w-4 h-4" /> Update</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Update Modal */}
      {attendanceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAttendanceModal({ open: false, student: null })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Update Attendance</h3>
              <button onClick={() => setAttendanceModal({ open: false, student: null })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center text-sm font-bold text-cyan-700">
                  {attendanceModal.student?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{attendanceModal.student?.name}</p>
                  <p className="text-xs text-gray-500">{attendanceModal.student?.rollNumber || attendanceModal.student?.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Attendance % (0–100)
                </label>
                <input
                  type="number" min="0" max="100"
                  value={attendanceValue}
                  onChange={(e) => setAttendanceValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g. 85"
                  autoFocus
                />
              </div>
              {attendanceValue !== '' && (
                <div className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                  parseFloat(attendanceValue) >= 75 ? 'bg-emerald-50 text-emerald-700'
                  : parseFloat(attendanceValue) >= 60 ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
                }`}>
                  {parseFloat(attendanceValue) >= 75 ? 'Good standing' : parseFloat(attendanceValue) >= 60 ? 'Borderline' : 'Below minimum'}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setAttendanceModal({ open: false, student: null })}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleUpdateAttendance} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-md transition-all disabled:opacity-50">
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><CheckCircleIcon className="w-4 h-4" /> Update</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Recent Complaints</h3>
            <Link to="/complaints" className="text-xs text-indigo-600 font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity?.complaints?.length > 0 ? recentActivity.complaints.map(c => (
              <Link to={`/complaints/${c._id}`} key={c._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                  <span className="text-xs text-gray-400">{c.ticketId}</span>
                </div>
                <Badge type="status" value={c.status} />
              </Link>
            )) : <p className="px-5 py-4 text-sm text-gray-400">No complaints yet</p>}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">My Announcements</h3>
            <Link to="/announcements" className="text-xs text-indigo-600 font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity?.announcements?.length > 0 ? recentActivity.announcements.map(a => (
              <Link to={`/announcements/${a._id}`} key={a._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                </div>
                <Badge type="category" value={a.category} />
              </Link>
            )) : <p className="px-5 py-4 text-sm text-gray-400">No announcements yet</p>}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">My Upcoming Events</h3>
            <Link to="/events/create" className="text-xs text-indigo-600 font-semibold">+ Create</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {myEvents?.length > 0 ? myEvents.map(e => (
              <Link to={`/events/${e._id}`} key={e._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CalendarDaysIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{e.title}</p>
                  <p className="text-xs text-gray-400">{new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </Link>
            )) : (
              <div className="px-5 py-6 text-center">
                <p className="text-sm text-gray-400">No upcoming events</p>
                <Link to="/events/create" className="text-xs text-indigo-600 font-semibold mt-1 block">Create one →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────── STUDENT DASHBOARD ─────────────────────────────── */
const StudentDashboard = ({ data: initialData }) => {
  // Keep local state so attendance refreshes without full page reload
  const [data, setData] = useState(initialData);

  useEffect(() => {
    // Re-fetch fresh data from backend so attendance updated by faculty shows immediately
    api.get('/dashboard/student')
      .then(res => setData(res.data))
      .catch(() => {});
  }, []);

  const { profile, complaints, announcements, events } = data;

  const attendance = profile?.attendance ?? 0;
  const cgpa = profile?.cgpa;

  return (
    <div className="space-y-5">
      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 animate-float" />
        <div className="absolute bottom-0 right-1/4 w-20 h-20 rounded-full bg-white/10 animate-float" style={{ animationDelay: '1s' }} />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},
            </p>
            <h2 className="text-2xl font-extrabold mt-0.5">{profile?.name?.split(' ')[0]}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {profile?.rollNumber && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">{profile.rollNumber}</span>}
              {profile?.department && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">{profile.department}</span>}
              {profile?.semester && <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">Sem {profile.semester}</span>}
            </div>
          </div>
          <div className="hidden sm:flex flex-col gap-2">
            {cgpa !== undefined && (
              <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[80px]">
                <p className="text-2xl font-extrabold">{cgpa}</p>
                <p className="text-xs text-indigo-200 font-medium">CGPA</p>
              </div>
            )}
            <div className={`backdrop-blur rounded-xl px-4 py-3 text-center min-w-[80px] ${attendance >= 75 ? 'bg-emerald-500/30' : attendance >= 60 ? 'bg-amber-500/30' : 'bg-red-500/30'}`}>
              <p className="text-2xl font-extrabold">{attendance}%</p>
              <p className="text-xs text-white/80 font-medium">Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance detail card - students see their attendance here */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
            <AcademicCapIcon className="w-3.5 h-3.5 text-emerald-600" />
          </span>
          Attendance Overview
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Current Attendance</span>
              <span className={`text-sm font-extrabold ${attendance >= 75 ? 'text-emerald-600' : attendance >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {attendance}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${attendance >= 75 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : attendance >= 60 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}
                style={{ width: `${Math.min(attendance, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-gray-400">0%</span>
              <span className="text-xs text-gray-400 font-medium">75% required</span>
              <span className="text-xs text-gray-400">100%</span>
            </div>
          </div>
          <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg ${attendance >= 75 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : attendance >= 60 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
            {attendance}%
          </div>
        </div>
        <p className={`text-xs font-semibold mt-3 px-3 py-1.5 rounded-lg inline-block ${attendance >= 75 ? 'bg-emerald-50 text-emerald-700' : attendance >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
          {attendance >= 75 ? 'Good standing — keep it up' : attendance >= 60 ? 'Borderline — improve attendance to stay eligible' : 'Below minimum requirement — please attend more classes.'}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 stagger">
        <div className="card p-4 text-center hover-lift">
          <p className="text-2xl font-extrabold text-gray-900">{complaints?.stats?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">My Tickets</p>
        </div>
        <div className="card p-4 text-center hover-lift">
          <p className="text-2xl font-extrabold text-indigo-600">{complaints?.stats?.open || 0}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Open</p>
        </div>
        <div className="card p-4 text-center hover-lift">
          <p className="text-2xl font-extrabold text-emerald-600">{complaints?.stats?.resolved || 0}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Resolved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Announcements */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Latest Announcements</h3>
            <Link to="/announcements" className="text-xs text-indigo-600 font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {announcements?.list?.length > 0 ? announcements.list.map(a => (
              <Link to={`/announcements/${a._id}`} key={a._id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {a.isPinned && <BookmarkIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                    <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                </div>
                <Badge type="priority" value={a.priority} />
              </Link>
            )) : <p className="px-5 py-4 text-sm text-gray-400">No announcements</p>}
          </div>
        </div>

        {/* Events */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">Upcoming Events</h3>
            <Link to="/events" className="text-xs text-indigo-600 font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {events?.upcoming?.length > 0 ? events.upcoming.map(e => (
              <Link to={`/events/${e._id}`} key={e._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                  <CalendarDaysIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{e.title}</p>
                  <p className="text-xs text-gray-400">{new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {e.venue || 'Online'}</p>
                </div>
                <Badge type="category" value={e.category} />
              </Link>
            )) : <p className="px-5 py-4 text-sm text-gray-400">No upcoming events</p>}
          </div>
        </div>
      </div>

      {/* My complaints */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-bold text-gray-800">My Recent Complaints</h3>
          <div className="flex items-center gap-2">
            <Link to="/complaints/create" className="btn-primary text-xs py-1.5 px-3">
              <PlusIcon className="w-3.5 h-3.5" /> New
            </Link>
            <Link to="/complaints" className="text-xs text-indigo-600 font-semibold">View all →</Link>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {complaints?.list?.length > 0 ? complaints.list.map(c => (
            <Link to={`/complaints/${c._id}`} key={c._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{c.ticketId}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                </div>
              </div>
              <Badge type="status" value={c.status} />
            </Link>
          )) : (
            <div className="px-5 py-8 text-center">
              <ExclamationCircleIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No complaints submitted yet</p>
              <Link to="/complaints/create" className="btn-primary text-xs mt-3 py-1.5 px-4 inline-flex">Submit a complaint</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────── ROOT ─────────────────────────────── */
const Dashboard = () => {
  const { isAdmin, isFaculty } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const res = await api.get('/dashboard/analytics');
          setData(res.data);
        } else if (isFaculty) {
          const res = await api.get('/dashboard/faculty');
          setData(res.data);
        } else {
          const res = await api.get('/dashboard/student');
          setData(res.data);
        }
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, isFaculty]);

  if (loading) return <PageLoader />;
  if (!data) return <div className="text-center py-16 text-gray-400">Failed to load dashboard data.</div>;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5 font-medium">
          {isAdmin ? 'System overview and analytics' : isFaculty ? 'Faculty portal — manage students & content' : 'Your academic overview'}
        </p>
      </div>
      {isAdmin ? <AdminDashboard data={data} />
        : isFaculty ? <FacultyDashboard data={data} />
        : <StudentDashboard data={data} />}
    </div>
  );
};

export default Dashboard;
