import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon, CalendarDaysIcon, MapPinIcon,
  UserGroupIcon, ClockIcon, LinkIcon, TrashIcon,
  PaperClipIcon, DocumentIcon, PhotoIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime, formatDate } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdminOrFaculty } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.event);
      } catch {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const isRegistered = event?.registeredUsers?.some(r => r.user?._id === user?._id);
  const isFull = event?.maxParticipants && event.registeredUsers?.length >= event.maxParticipants;
  const deadlinePassed = event?.registrationDeadline && new Date() > new Date(event.registrationDeadline);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      if (isRegistered) {
        await api.delete(`/events/${id}/register`);
        toast.success('Unregistered from event');
      } else {
        await api.post(`/events/${id}/register`);
        toast.success('Successfully registered!');
      }
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.event);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      navigate('/events');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <PageLoader />;
  if (!event) return null;

  const isOrganizer = event.organizer?._id === user?._id;
  const canManage = isOrganizer || user?.role === 'admin';

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Events
      </button>

      <div className="card overflow-hidden">
        {/* Header */}
        {event.color && (
          <div className="h-2" style={{ backgroundColor: event.color }} />
        )}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge type="category" value={event.category} />
                <Badge type="status" value={event.status} />
                {event.isFeatured && <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">⭐ Featured</span>}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            </div>
            {canManage && (
              <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Delete event">
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarDaysIcon className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(event.startDate)}</p>
                {event.startTime && <p className="text-xs text-gray-500">{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</p>}
              </div>
            </div>

            {(event.venue || event.isOnline) && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">{event.isOnline ? 'Online Event' : event.venue}</p>
                  {event.isOnline && event.meetingLink && (
                    <a href={event.meetingLink} target="_blank" rel="noreferrer"
                      className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-0.5">
                      <LinkIcon className="w-3 h-3" /> Join Link
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserGroupIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Organizer</p>
                <p className="text-sm font-medium text-gray-900">{event.organizerName || event.organizer?.name}</p>
              </div>
            </div>

            {event.requiresRegistration && event.registrationDeadline && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Registration Deadline</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(event.registrationDeadline)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
            {event.description}
          </div>

          {/* Attachments */}
          {event.attachments?.length > 0 && (
            <div className="mb-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <PaperClipIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Attachments ({event.attachments.length})</span>
              </div>
              <ul className="space-y-2">
                {event.attachments.map((att, i) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.filename);
                  return (
                    <li key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      {isImage
                        ? <PhotoIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        : <DocumentIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                      <span className="flex-1 text-sm text-gray-700 truncate">{att.filename}</span>
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

          {/* Registration */}
          {event.requiresRegistration && (
            <div className="p-4 rounded-xl border" style={{ background: 'rgba(10,132,255,0.06)', borderColor: 'rgba(10,132,255,0.18)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Registration</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {event.registeredUsers?.length || 0}
                    {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} registered
                  </p>
                </div>

                {event.status === 'upcoming' ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering || (isFull && !isRegistered) || deadlinePassed}
                    className="text-sm font-semibold py-2 px-5 rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed text-white"
                    style={{
                      background: isRegistered
                        ? 'linear-gradient(135deg, #FF453A 0%, #FF375F 100%)'
                        : (isFull && !isRegistered) || deadlinePassed
                        ? 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)'
                        : 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
                      boxShadow: isRegistered
                        ? '0 4px 14px rgba(255,69,58,0.45)'
                        : (isFull && !isRegistered) || deadlinePassed
                        ? 'none'
                        : '0 4px 14px rgba(10,132,255,0.45)'
                    }}
                  >
                    {registering
                      ? 'Please wait...'
                      : isRegistered
                      ? 'Unregister'
                      : isFull
                      ? 'Event Full'
                      : deadlinePassed
                      ? 'Deadline Passed'
                      : 'Register Now'}
                  </button>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full text-white capitalize"
                    style={{
                      background: event.status === 'ongoing'
                        ? 'linear-gradient(135deg, #30D158 0%, #34C759 100%)'
                        : event.status === 'completed'
                        ? 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)'
                        : 'linear-gradient(135deg, #FF453A 0%, #FF375F 100%)',
                      boxShadow: event.status === 'ongoing' ? '0 3px 10px rgba(48,209,88,0.4)' : 'none'
                    }}
                  >
                    {event.status === 'ongoing' ? 'Event Ongoing' : event.status === 'completed' ? 'Event Completed' : 'Event Cancelled'}
                  </span>
                )}
              </div>

              {event.maxParticipants && (
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((event.registeredUsers?.length || 0) / event.maxParticipants) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
