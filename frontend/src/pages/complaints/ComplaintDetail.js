import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon, PaperAirplaneIcon, StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime, timeAgo } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'rejected'];

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdminOrFaculty } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', note: '', assignedTo: '' });
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/complaints/${id}`);
        setComplaint(res.data.complaint);
        setStatusForm(f => ({ ...f, status: res.data.complaint.status, assignedTo: res.data.complaint.assignedTo?._id || '' }));
      } catch {
        toast.error('Complaint not found');
        navigate('/complaints');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // Load faculty list for assignment
    api.get('/users', { params: { role: 'faculty', limit: 50 } })
      .then(r => setFacultyList(r.data.users || []))
      .catch(() => {});
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/complaints/${id}/comments`, { content: comment });
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
      setComment('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/complaints/${id}/status`, statusForm);
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
      setShowStatusForm(false);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmittingFeedback(true);
    try {
      await api.post(`/complaints/${id}/feedback`, { rating, comment: feedbackComment });
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
      toast.success('Feedback submitted');
    } catch {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!complaint) return null;

  const isOwner = complaint.submittedBy?._id === user?._id;
  const canRate = isOwner && complaint.status === 'resolved' && !complaint.feedback?.rating;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Complaints
      </button>

      {/* Main Card */}
      <div className="card overflow-hidden mb-4">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-mono font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                  {complaint.ticketId}
                </span>
                <Badge type="category" value={complaint.category} />
                <Badge type="priority" value={complaint.priority} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{complaint.title}</h1>
            </div>
            <Badge type="status" value={complaint.status} className="text-sm" />
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
                {complaint.submittedBy?.name?.charAt(0)}
              </div>
              <span>{complaint.isAnonymous ? 'Anonymous' : complaint.submittedBy?.name}</span>
            </div>
            <span>•</span>
            <span>{formatDateTime(complaint.createdAt)}</span>
            {complaint.assignedTo && (
              <>
                <span>•</span>
                <span>Assigned to: <strong>{complaint.assignedTo.name}</strong></span>
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>

          {complaint.resolutionNote && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-xs font-semibold text-green-700 mb-1">Resolution Note</p>
              <p className="text-sm text-green-800">{complaint.resolutionNote}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status History */}
      {complaint.statusHistory?.length > 0 && (
        <div className="card p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Timeline</h3>
          <div className="space-y-3">
            {complaint.statusHistory.map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  h.status === 'resolved' ? 'bg-green-500' :
                  h.status === 'in_progress' ? 'bg-yellow-500' :
                  h.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Badge type="status" value={h.status} />
                    <span className="text-xs text-gray-400">{timeAgo(h.changedAt)}</span>
                  </div>
                  {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin: Update Status */}
      {isAdminOrFaculty && (
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Update Status</h3>
            <button onClick={() => setShowStatusForm(!showStatusForm)} className="btn-secondary text-xs py-1.5">
              {showStatusForm ? 'Cancel' : 'Update'}
            </button>
          </div>
          {showStatusForm && (
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <select className="input-field text-sm" value={statusForm.status}
                onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <select className="input-field text-sm" value={statusForm.assignedTo}
                onChange={e => setStatusForm(f => ({ ...f, assignedTo: e.target.value }))}>
                <option value="">— Assign to faculty (optional) —</option>
                {facultyList.map(f => (
                  <option key={f._id} value={f._id}>{f.name} ({f.department || 'No dept'})</option>
                ))}
              </select>
              <input type="text" className="input-field text-sm" placeholder="Add a note (optional)"
                value={statusForm.note} onChange={e => setStatusForm(f => ({ ...f, note: e.target.value }))} />
              <button type="submit" className="btn-primary text-sm w-full">Update Status</button>
            </form>
          )}
        </div>
      )}

      {/* Comments */}
      <div className="card p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Comments {complaint.comments?.length > 0 && `(${complaint.comments.length})`}
        </h3>

        {complaint.comments?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
        ) : (
          <div className="space-y-4 mb-4">
            {complaint.comments?.filter(c => !c.isInternal || isAdminOrFaculty).map((c, i) => (
              <div key={i} className={`flex items-start gap-3 ${c.isInternal ? 'opacity-75' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold flex-shrink-0">
                  {c.author?.name?.charAt(0) || '?'}
                </div>
                <div className={`flex-1 p-3 rounded-xl text-sm ${
                  c.isInternal ? 'bg-yellow-50 border border-yellow-100' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 text-xs">{c.author?.name}</span>
                    <div className="flex items-center gap-1.5">
                      {c.isInternal && <span className="text-[10px] text-yellow-600 font-medium">Internal</span>}
                      <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1 text-sm"
            placeholder="Add a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button type="submit" disabled={submitting || !comment.trim()} className="btn-primary px-3 py-2">
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Feedback */}
      {canRate && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Rate the Resolution</h3>
          <form onSubmit={handleFeedback} className="space-y-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-0.5 transition-transform hover:scale-110"
                  aria-label={`Rate ${star} stars`}
                >
                  {star <= rating ? (
                    <StarSolid className="w-7 h-7 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-7 h-7 text-gray-300" />
                  )}
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-500 ml-2">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</span>
              )}
            </div>
            <input type="text" className="input-field text-sm" placeholder="Additional feedback (optional)"
              value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} />
            <button type="submit" disabled={!rating || submittingFeedback} className="btn-primary text-sm w-full">
              Submit Feedback
            </button>
          </form>
        </div>
      )}

      {complaint.feedback?.rating && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Feedback</h3>
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(star => (
              <StarSolid key={star} className={`w-5 h-5 ${star <= complaint.feedback.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
            ))}
            <span className="text-sm text-gray-500 ml-1">{complaint.feedback.rating}/5</span>
          </div>
          {complaint.feedback.comment && <p className="text-sm text-gray-600">{complaint.feedback.comment}</p>}
        </div>
      )}
    </div>
  );
};

export default ComplaintDetail;
