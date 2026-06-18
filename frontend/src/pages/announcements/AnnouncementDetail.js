import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon, PencilSquareIcon, TrashIcon,
  EyeIcon, CalendarIcon, UserIcon, TagIcon,
  PaperClipIcon, DocumentIcon, PhotoIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdminOrFaculty, isAdmin } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/announcements/${id}`);
        setAnnouncement(res.data.announcement);
      } catch {
        toast.error('Announcement not found');
        navigate('/announcements');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      navigate('/announcements');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handlePin = async () => {
    try {
      const res = await api.put(`/announcements/${id}/pin`);
      setAnnouncement(prev => ({ ...prev, isPinned: res.data.announcement.isPinned }));
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to update');
    }
  };

  if (loading) return <PageLoader />;
  if (!announcement) return null;

  const isAuthor = announcement.author?._id === user?._id;
  const canEdit = isAuthor || isAdmin;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back nav */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Announcements
      </button>

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {announcement.isPinned && (
                  <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">📌 Pinned</span>
                )}
                <Badge type="category" value={announcement.category} />
                <Badge type="priority" value={announcement.priority} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{announcement.title}</h1>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {isAdmin && (
                  <button onClick={handlePin} className="btn-secondary text-xs py-1.5 px-3">
                    {announcement.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                )}
                <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Delete">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
                {announcement.author?.name?.charAt(0)}
              </div>
              <span>{announcement.author?.name}</span>
              <span className="capitalize text-gray-400">({announcement.author?.role})</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5" />
              {formatDateTime(announcement.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="w-3.5 h-3.5" />
              {announcement.views} views
            </div>
          </div>

          {/* Target audience */}
          {announcement.targetAudience !== 'all' && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
              <UserIcon className="w-3.5 h-3.5" />
              For: {announcement.targetAudience.replace(/_/g, ' ')}
              {announcement.targetDepartment && ` • ${announcement.targetDepartment}`}
              {announcement.targetBatch && ` • Batch ${announcement.targetBatch}`}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {announcement.content}
          </div>

          {/* Tags */}
          {announcement.tags?.length > 0 && (
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
              <TagIcon className="w-4 h-4 text-gray-400" />
              <div className="flex flex-wrap gap-1.5">
                {announcement.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Expiry */}
          {announcement.expiryDate && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
              <CalendarIcon className="w-3.5 h-3.5" />
              Expires: {formatDateTime(announcement.expiryDate)}
            </div>
          )}

          {/* Attachments */}
          {announcement.attachments?.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <PaperClipIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Attachments ({announcement.attachments.length})</span>
              </div>
              <ul className="space-y-2">
                {announcement.attachments.map((att, i) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.filename);
                  return (
                    <li key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      {isImage
                        ? <PhotoIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        : <DocumentIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                      <span className="flex-1 text-sm text-gray-700 truncate">{att.filename}</span>
                      {att.size && <span className="text-xs text-gray-400">{(att.size / 1024).toFixed(0)} KB</span>}
                      <a
                        href={`http://localhost:5000${att.url}`}
                        target="_blank"
                        rel="noreferrer"
                        download={att.filename}
                        className="ml-2 flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
