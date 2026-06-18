import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), formatStr);
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM dd, yyyy • h:mm a');
  } catch {
    return 'Invalid date';
  }
};

export const timeAgo = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM dd, yyyy');
  } catch {
    return '';
  }
};

export const getStatusColor = (status) => {
  const colors = {
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    rejected: 'bg-red-100 text-red-700',
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
    critical: 'bg-red-100 text-red-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-700';
};

export const getCategoryColor = (category) => {
  const colors = {
    Academic: 'bg-purple-100 text-purple-700',
    Administrative: 'bg-blue-100 text-blue-700',
    Cultural: 'bg-pink-100 text-pink-700',
    Sports: 'bg-green-100 text-green-700',
    Placement: 'bg-yellow-100 text-yellow-700',
    Technical: 'bg-indigo-100 text-indigo-700',
    Holiday: 'bg-orange-100 text-orange-700',
    Exam: 'bg-red-100 text-red-700',
    General: 'bg-gray-100 text-gray-700',
    Infrastructure: 'bg-teal-100 text-teal-700',
    Hostel: 'bg-cyan-100 text-cyan-700',
    Library: 'bg-violet-100 text-violet-700',
    Canteen: 'bg-amber-100 text-amber-700',
    'IT Support': 'bg-sky-100 text-sky-700'
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

export const getRoleColor = (role) => {
  const colors = {
    admin: 'bg-red-100 text-red-700',
    faculty: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700'
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export const DEPARTMENTS = [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Management Studies'
];

export const EVENT_COLORS = {
  Academic: '#4F46E5',
  Cultural: '#EC4899',
  Sports: '#10B981',
  Technical: '#6366F1',
  Workshop: '#F59E0B',
  Seminar: '#3B82F6',
  Placement: '#8B5CF6',
  Holiday: '#EF4444',
  Exam: '#DC2626',
  Other: '#6B7280'
};
