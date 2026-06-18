import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PaperClipIcon, XMarkIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar', 'Placement', 'Holiday', 'Exam', 'Other'];
const AUDIENCES = [
  { value: 'all', label: 'Everyone' },
  { value: 'students', label: 'All Students' },
  { value: 'faculty', label: 'All Faculty' },
  { value: 'specific_department', label: 'Specific Department' },
  { value: 'specific_batch', label: 'Specific Batch' }
];

const EVENT_COLORS = {
  Academic: '#4F46E5', Cultural: '#EC4899', Sports: '#10B981',
  Technical: '#6366F1', Workshop: '#F59E0B', Seminar: '#3B82F6',
  Placement: '#8B5CF6', Holiday: '#EF4444', Exam: '#DC2626', Other: '#6B7280'
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Academic',
    startDate: '', endDate: '', startTime: '', endTime: '',
    venue: '', isOnline: false, meetingLink: '',
    targetAudience: 'all', targetDepartment: '', targetBatch: '',
    requiresRegistration: false, maxParticipants: '',
    registrationDeadline: '', isFeatured: false
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);

  const update = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'category' ? { color: EVENT_COLORS[value] } : {})
    }));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
    e.target.value = '';
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <PhotoIcon className="w-4 h-4 text-blue-500" />;
    return <DocumentIcon className="w-4 h-4 text-gray-500" />;
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errs.endDate = 'End date must be after start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== undefined) formData.append(k, v);
      });
      formData.set('color', EVENT_COLORS[form.category]);
      files.forEach(f => formData.append('attachments', f));

      await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Event created successfully');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </button>

      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Create Event</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule a new campus event</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input type="text" className={`input-field ${errors.title ? 'border-red-400' : ''}`}
              placeholder="Event title" value={form.title}
              onChange={e => update('title', e.target.value)} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="label">Category <span className="text-red-500">*</span></label>
            <select className="input-field" value={form.category} onChange={e => update('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea rows={4} className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
              placeholder="Describe the event..." value={form.description}
              onChange={e => update('description', e.target.value)} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date <span className="text-red-500">*</span></label>
              <input type="date" className={`input-field ${errors.startDate ? 'border-red-400' : ''}`}
                value={form.startDate} onChange={e => update('startDate', e.target.value)} />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="label">End Date <span className="text-red-500">*</span></label>
              <input type="date" className={`input-field ${errors.endDate ? 'border-red-400' : ''}`}
                value={form.endDate} onChange={e => update('endDate', e.target.value)} />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time</label>
              <input type="time" className="input-field" value={form.startTime}
                onChange={e => update('startTime', e.target.value)} />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" className="input-field" value={form.endTime}
                onChange={e => update('endTime', e.target.value)} />
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="label mb-0">Location</label>
              <button type="button" onClick={() => update('isOnline', !form.isOnline)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  form.isOnline ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                {form.isOnline ? 'Online' : 'In-Person'}
              </button>
            </div>
            {form.isOnline ? (
              <input type="url" className="input-field" placeholder="Meeting link (optional)"
                value={form.meetingLink} onChange={e => update('meetingLink', e.target.value)} />
            ) : (
              <input type="text" className="input-field" placeholder="Venue name or address"
                value={form.venue} onChange={e => update('venue', e.target.value)} />
            )}
          </div>

          {/* Audience */}
          <div>
            <label className="label">Target Audience</label>
            <select className="input-field" value={form.targetAudience}
              onChange={e => update('targetAudience', e.target.value)}>
              {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>

          {form.targetAudience === 'specific_department' && (
            <div>
              <label className="label">Department</label>
              <input type="text" className="input-field" placeholder="e.g. Computer Science Engineering"
                value={form.targetDepartment} onChange={e => update('targetDepartment', e.target.value)} />
            </div>
          )}
          {form.targetAudience === 'specific_batch' && (
            <div>
              <label className="label">Batch</label>
              <input type="text" className="input-field" placeholder="e.g. 2021-25"
                value={form.targetBatch} onChange={e => update('targetBatch', e.target.value)} />
            </div>
          )}

          {/* Registration */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <button type="button" role="switch" aria-checked={form.requiresRegistration}
                onClick={() => update('requiresRegistration', !form.requiresRegistration)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.requiresRegistration ? 'bg-primary-600' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.requiresRegistration ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <label className="text-sm font-medium text-gray-700">Requires Registration</label>
            </div>

            {form.requiresRegistration && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Max Participants</label>
                  <input type="number" className="input-field" placeholder="Leave blank for unlimited"
                    min="1" value={form.maxParticipants}
                    onChange={e => update('maxParticipants', e.target.value)} />
                </div>
                <div>
                  <label className="label">Registration Deadline</label>
                  <input type="date" className="input-field" value={form.registrationDeadline}
                    onChange={e => update('registrationDeadline', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <button type="button" role="switch" aria-checked={form.isFeatured}
              onClick={() => update('isFeatured', !form.isFeatured)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.isFeatured ? 'bg-yellow-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <label className="text-sm font-medium text-gray-700">Mark as Featured</label>
          </div>

          {/* Attachments */}
          <div>
            <label className="label">Attachments <span className="text-gray-400 font-normal">(images, PDF, Word, Excel — max 10MB each)</span></label>
            <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <PaperClipIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Click to attach files</span>
              <input type="file" multiple className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={handleFileChange} />
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    {getFileIcon(f)}
                    <span className="flex-1 truncate text-gray-700">{f.name}</span>
                    <span className="text-gray-400 text-xs">{(f.size / 1024).toFixed(0)} KB</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
