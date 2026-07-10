import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PaperClipIcon, XMarkIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = ['Academic', 'Administrative', 'Cultural', 'Sports', 'Placement', 'Holiday', 'Exam', 'General'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const AUDIENCES = [
  { value: 'all', label: 'Everyone' },
  { value: 'students', label: 'All Students' },
  { value: 'faculty', label: 'All Faculty' },
  { value: 'specific_department', label: 'Specific Department' },
  { value: 'specific_batch', label: 'Specific Batch' }
];

const CreateAnnouncement = () => {
  const navigate = useNavigate();
  const { user, isFaculty } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', category: 'General', priority: 'medium',
    targetAudience: isFaculty ? 'specific_department' : 'all',
    targetDepartment: isFaculty && user?.department ? user.department : '',
    targetBatch: '',
    isPinned: false, expiryDate: '', tags: ''
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

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
    if (!form.content.trim()) errs.content = 'Content is required';
    if (!form.category) errs.category = 'Category is required';
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
        if (k === 'tags') {
          formData.append(k, v);
        } else if (v !== '' && v !== undefined) {
          formData.append(k, v);
        }
      });
      files.forEach(f => formData.append('attachments', f));

      await api.post('/announcements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Announcement published successfully');
      navigate('/announcements');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create announcement');
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
          <h1 className="text-xl font-bold text-gray-900">Create Announcement</h1>
          <p className="text-sm text-gray-500 mt-0.5">Publish an announcement to the campus community</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input type="text" className={`input-field ${errors.title ? 'border-red-400' : ''}`}
              placeholder="Enter announcement title" value={form.title}
              onChange={e => update('title', e.target.value)} maxLength={200} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Content */}
          <div>
            <label className="label">Content <span className="text-red-500">*</span></label>
            <textarea rows={6} className={`input-field resize-none ${errors.content ? 'border-red-400' : ''}`}
              placeholder="Write the announcement content here..." value={form.content}
              onChange={e => update('content', e.target.value)} maxLength={5000} />
            <div className="flex justify-between mt-1">
              {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
              <p className="text-xs text-gray-400 ml-auto">{form.content.length}/5000</p>
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category <span className="text-red-500">*</span></label>
              <select className={`input-field ${errors.category ? 'border-red-400' : ''}`}
                value={form.category} onChange={e => update('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => update('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Target Audience */}
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

          {/* Tags & Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
              <input type="text" className="input-field" placeholder="exam, results, important"
                value={form.tags} onChange={e => update('tags', e.target.value)} />
            </div>
            <div>
              <label className="label">Expiry Date <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="datetime-local" className="input-field"
                value={form.expiryDate} onChange={e => update('expiryDate', e.target.value)} />
            </div>
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

          {/* Pin toggle */}
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              role="switch"
              aria-checked={form.isPinned}
              onClick={() => update('isPinned', !form.isPinned)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                form.isPinned ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                form.isPinned ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
            <label className="text-sm font-medium text-gray-700">Pin this announcement</label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </span>
              ) : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncement;
