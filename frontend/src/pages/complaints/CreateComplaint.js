import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Academic', 'Infrastructure', 'Administrative', 'Hostel', 'Library', 'Canteen', 'IT Support', 'Harassment', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Academic',
    priority: 'medium', isAnonymous: false
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category) errs.category = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/complaints', form);
      toast.success(`Complaint submitted. Ticket: ${res.data.complaint.ticketId}`);
      navigate('/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
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
          <h1 className="text-xl font-bold text-gray-900">Submit a Complaint</h1>
          <p className="text-sm text-gray-500 mt-0.5">Describe your issue and we'll look into it</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input type="text" className={`input-field ${errors.title ? 'border-red-400' : ''}`}
              placeholder="Brief description of the issue" value={form.title}
              onChange={e => update('title', e.target.value)} maxLength={200} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

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

          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea rows={6} className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
              placeholder="Provide detailed information about your complaint..." value={form.description}
              onChange={e => update('description', e.target.value)} maxLength={2000} />
            <div className="flex justify-between mt-1">
              {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
              <p className="text-xs text-gray-400 ml-auto">{form.description.length}/2000</p>
            </div>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-3 py-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <button
              type="button"
              role="switch"
              aria-checked={form.isAnonymous}
              onClick={() => update('isAnonymous', !form.isAnonymous)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 ${
                form.isAnonymous ? 'bg-yellow-500' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                form.isAnonymous ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
            <div>
              <p className="text-sm font-medium text-gray-700">Submit anonymously</p>
              <p className="text-xs text-gray-500">Your identity will be hidden from the response team</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
