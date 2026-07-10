import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  TrophyIcon, PlusIcon, PencilSquareIcon, TrashIcon,
  CodeBracketIcon, StarIcon, XMarkIcon, CheckIcon,
  ArrowLeftIcon, GlobeAltIcon, LinkIcon,
  DocumentArrowUpIcon, DocumentCheckIcon,
  BriefcaseIcon, WrenchScrewdriverIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { getInitials } from '../../utils/helpers';

// ─── helpers ────────────────────────────────────────────────────────────────
const ACHIEVEMENT_TYPES = ['Award', 'Certification', 'Leadership', 'Publication', 'Competition', 'Other'];
const ACHIEVEMENT_ICON_MAP = {
  Award: TrophyIcon, Certification: DocumentCheckIcon, Leadership: StarIcon,
  Publication: CodeBracketIcon, Competition: TrophyIcon, Other: StarIcon,
};
const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Proficient', 'Expert'];
const PROFICIENCY_COLORS = {
  Beginner: 'bg-gray-100 text-gray-600',
  Intermediate: 'bg-blue-100 text-blue-700',
  Proficient: 'bg-indigo-100 text-indigo-700',
  Expert: 'bg-purple-100 text-purple-700',
};
const PROFICIENCY_WIDTH = { Beginner: 'w-1/4', Intermediate: 'w-2/4', Proficient: 'w-3/4', Expert: 'w-full' };

// ─── Modal wrapper ───────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><XMarkIcon className="w-5 h-5" /></button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ─── Input/Select helpers ────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);
const Input = ({ ...props }) => (
  <input className="w-full rounded-xl border border-gray-200 bg-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-colors" {...props} />
);
const Textarea = ({ ...props }) => (
  <textarea className="w-full rounded-xl border border-gray-200 bg-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-colors resize-none" rows={3} {...props} />
);
const Select = ({ options, ...props }) => (
  <select className="w-full rounded-xl border border-gray-200 bg-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-colors appearance-none" {...props}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

// ─── Empty state ─────────────────────────────────────────────────────────────
const Empty = ({ icon: Icon, text, sub }) => (
  <div className="text-center py-10">
    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
      <Icon className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-600">{text}</p>
    <p className="text-xs text-gray-400 mt-1">{sub}</p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function AchievementPassport() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('achievements');

  // modal states
  const [achModal, setAchModal] = useState(null);     // null | 'add' | index
  const [skillModal, setSkillModal] = useState(null); // null | 'add' | index
  const [projModal, setProjModal] = useState(null);   // null | 'add' | index

  // form states
  const [achForm, setAchForm] = useState({ title: '', type: 'Award', organization: '', date: '', description: '', certificateUrl: '' });
  const [certFile, setCertFile] = useState(null);
  const [certUploading, setCertUploading] = useState(false);
  const [skillForm, setSkillForm] = useState({ name: '', proficiency: 'Intermediate' });
  const [projForm, setProjForm] = useState({ name: '', description: '', technologies: '', status: 'In Progress', githubUrl: '', liveUrl: '' });

  useEffect(() => {
    api.get('/users/profile/me').then(res => {
      setProfile(res.data.user || res.data);
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  const save = async (field, data) => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', { [field]: data });
      const updated = res.data.user || res.data;
      setProfile(updated);
      updateUser(updated);
      toast.success('Saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── Achievements ─────────────────────────────────────────────────────────
  const openAddAch = () => {
    setAchForm({ title: '', type: 'Award', organization: '', date: '', description: '', certificateUrl: '' });
    setCertFile(null);
    setAchModal('add');
  };
  const openEditAch = (i) => {
    const a = profile.achievements[i];
    setAchForm({ title: a.title, type: a.type, organization: a.organization || '', date: a.date ? a.date.slice(0, 7) : '', description: a.description || '', certificateUrl: a.certificateUrl || '' });
    setCertFile(null);
    setAchModal(i);
  };
  const saveAch = async () => {
    if (!achForm.title.trim()) return toast.error('Title is required');
    let certificateUrl = achForm.certificateUrl;

    // Upload PDF first if a new file was selected
    if (certFile) {
      setCertUploading(true);
      try {
        const fd = new FormData();
        fd.append('certificate', certFile);
        const res = await api.post('/users/achievements/certificate', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        certificateUrl = res.data.url;
      } catch {
        toast.error('Certificate upload failed');
        setCertUploading(false);
        return;
      }
      setCertUploading(false);
    }

    const list = [...(profile.achievements || [])];
    const item = { ...achForm, certificateUrl, date: achForm.date ? new Date(achForm.date + '-01') : undefined };
    if (achModal === 'add') list.push(item);
    else list[achModal] = item;
    await save('achievements', list);
    setAchModal(null);
  };
  const deleteAch = async (i) => {
    const list = (profile.achievements || []).filter((_, idx) => idx !== i);
    await save('achievements', list);
  };

  // ── Skills ────────────────────────────────────────────────────────────────
  const openAddSkill = () => {
    setSkillForm({ name: '', proficiency: 'Intermediate' });
    setSkillModal('add');
  };
  const openEditSkill = (i) => {
    const s = profile.skills[i];
    setSkillForm({ name: s.name || s, proficiency: s.proficiency || 'Intermediate' });
    setSkillModal(i);
  };
  const saveSkill = async () => {
    if (!skillForm.name.trim()) return toast.error('Skill name is required');
    const list = [...(profile.skills || [])];
    if (skillModal === 'add') list.push(skillForm);
    else list[skillModal] = skillForm;
    await save('skills', list);
    setSkillModal(null);
  };
  const deleteSkill = async (i) => {
    const list = (profile.skills || []).filter((_, idx) => idx !== i);
    await save('skills', list);
  };

  // ── Projects ──────────────────────────────────────────────────────────────
  const openAddProj = () => {
    setProjForm({ name: '', description: '', technologies: '', status: 'In Progress', githubUrl: '', liveUrl: '' });
    setProjModal('add');
  };
  const openEditProj = (i) => {
    const p = profile.projects[i];
    setProjForm({ name: p.name, description: p.description || '', technologies: p.technologies || '', status: p.status || 'In Progress', githubUrl: p.githubUrl || '', liveUrl: p.liveUrl || '' });
    setProjModal(i);
  };
  const saveProj = async () => {
    if (!projForm.name.trim()) return toast.error('Project name is required');
    const list = [...(profile.projects || [])];
    if (projModal === 'add') list.push(projForm);
    else list[projModal] = projForm;
    await save('projects', list);
    setProjModal(null);
  };
  const deleteProj = async (i) => {
    const list = (profile.projects || []).filter((_, idx) => idx !== i);
    await save('projects', list);
  };

  const handlePrintExport = () => window.print();

  if (loading) return <LoadingSpinner fullPage />;
  if (!profile) return null;

  const achievements = profile.achievements || [];
  const skills = profile.skills || [];
  const projects = profile.projects || [];

  const tabs = [
    { id: 'achievements', label: 'Achievements', icon: TrophyIcon, count: achievements.length },
    { id: 'skills',       label: 'Skills',       icon: WrenchScrewdriverIcon, count: skills.length },
    { id: 'projects',     label: 'Projects',     icon: BriefcaseIcon, count: projects.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/profile" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Achievement Passport</h1>
          <p className="text-sm text-gray-500">Your skills, achievements & projects</p>
        </div>
        <button
          onClick={handlePrintExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <ArrowDownTrayIcon className="w-4 h-4" /> Export PDF
        </button>
      </div>
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      {/* Passport card */}
      <div className="bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl font-bold flex-shrink-0 border-2 border-white/20">
            {getInitials(profile.name)}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-1">Achievement Passport</p>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm text-white/60 mt-0.5">{profile.department || 'Department not set'} {profile.semester ? `· Sem ${profile.semester}` : ''}</p>
          </div>
          <div className="flex gap-3 sm:flex-col sm:text-right w-full sm:w-auto">
            {[
              [achievements.length, 'Achievements'],
              [skills.length, 'Skills'],
              [projects.length, 'Projects'],
            ].map(([val, lbl]) => (
              <div key={lbl} className="flex-1 sm:flex-none bg-white/10 rounded-xl px-4 py-2 text-center">
                <p className="text-xl font-bold">{val}</p>
                <p className="text-xs text-white/60">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs — full width on mobile, inline on larger screens */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-full">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <t.icon className="w-4 h-4 flex-shrink-0" />
            <span>{t.label}</span>
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === t.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Achievements tab ── */}
      {activeTab === 'achievements' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><TrophyIcon className="w-4 h-4 text-amber-500" /> Achievements</h3>
            <button onClick={openAddAch} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              <PlusIcon className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {achievements.length === 0 ? (
            <Empty icon={TrophyIcon} text="No achievements yet" sub="Add your awards, certifications, and more" />
          ) : (
            <div className="divide-y divide-gray-50">
              {achievements.map((a, i) => {
                const AchIcon = ACHIEVEMENT_ICON_MAP[a.type] || StarIcon;
                return (
                <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <AchIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{a.organization}</span>
                      {a.date && <span className="text-xs text-gray-400">· {new Date(a.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
                    </div>
                    {a.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">{a.type}</span>
                      {a.certificateUrl && (
                        <a
                          href={`http://localhost:5000${a.certificateUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium hover:bg-green-100 transition-colors"
                        >
                          <DocumentCheckIcon className="w-3 h-3" /> View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEditAch(i)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"><PencilSquareIcon className="w-4 h-4" /></button>
                    <button onClick={() => deleteAch(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Skills tab ── */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><StarIcon className="w-4 h-4 text-blue-500" /> Skills</h3>
            <button onClick={openAddSkill} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              <PlusIcon className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {skills.length === 0 ? (
            <Empty icon={WrenchScrewdriverIcon} text="No skills added yet" sub="Add your technical and soft skills" />
          ) : (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills.map((s, i) => {
                const name = s.name || s;
                const level = s.proficiency || 'Intermediate';
                return (
                  <div key={i} className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-900 truncate">{name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROFICIENCY_COLORS[level]}`}>{level}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-indigo-500 transition-all ${PROFICIENCY_WIDTH[level]}`} />
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEditSkill(i)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-indigo-600 transition-colors"><PencilSquareIcon className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteSkill(i)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Projects tab ── */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><CodeBracketIcon className="w-4 h-4 text-green-500" /> Projects</h3>
            <button onClick={openAddProj} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              <PlusIcon className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {projects.length === 0 ? (
            <Empty icon={BriefcaseIcon} text="No projects added yet" sub="Showcase your work and side projects" />
          ) : (
            <div className="divide-y divide-gray-50">
              {projects.map((p, i) => (
                <div key={i} className="group px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                      </div>
                      {p.description && <p className="text-xs text-gray-500 line-clamp-2 mb-1.5">{p.description}</p>}
                      {p.technologies && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {p.technologies.split('·').map(t => t.trim()).filter(Boolean).map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">{t}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3 mt-2">
                        {p.githubUrl && (
                          <a href={p.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors" onClick={e => e.stopPropagation()}>
                            <LinkIcon className="w-3 h-3" /> GitHub
                          </a>
                        )}
                        {p.liveUrl && (
                          <a href={p.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors" onClick={e => e.stopPropagation()}>
                            <GlobeAltIcon className="w-3 h-3" /> Live
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEditProj(i)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"><PencilSquareIcon className="w-4 h-4" /></button>
                      <button onClick={() => deleteProj(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Achievement Modal ── */}
      {achModal !== null && (
        <Modal title={achModal === 'add' ? 'Add Achievement' : 'Edit Achievement'} onClose={() => setAchModal(null)}>
          <div className="space-y-4">
            <Field label="Title *">
              <Input placeholder="e.g. 1st Place – State Level Hackathon" value={achForm.title} onChange={e => setAchForm(p => ({ ...p, title: e.target.value }))} />
            </Field>
            <Field label="Type">
              <Select options={ACHIEVEMENT_TYPES} value={achForm.type} onChange={e => setAchForm(p => ({ ...p, type: e.target.value }))} />
            </Field>
            <Field label="Organization / Event">
              <Input placeholder="e.g. Google, TechFest 2024" value={achForm.organization} onChange={e => setAchForm(p => ({ ...p, organization: e.target.value }))} />
            </Field>
            <Field label="Date (Month & Year)">
              <Input type="month" value={achForm.date} onChange={e => setAchForm(p => ({ ...p, date: e.target.value }))} />
            </Field>
            <Field label="Description (optional)">
              <Textarea placeholder="Brief description..." value={achForm.description} onChange={e => setAchForm(p => ({ ...p, description: e.target.value }))} maxLength={500} />
            </Field>
            <Field label="Certificate (PDF only, optional)">
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-xl px-3 py-2.5 hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                <DocumentArrowUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500 truncate flex-1">
                {certFile ? certFile.name : achForm.certificateUrl ? 'Certificate uploaded — click to replace' : 'Click to upload PDF certificate'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={e => setCertFile(e.target.files[0] || null)}
                />
              </label>
              {achForm.certificateUrl && !certFile && (
                <a
                  href={`http://localhost:5000${achForm.certificateUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-xs text-green-700 hover:underline"
                >
                  <DocumentCheckIcon className="w-3.5 h-3.5" /> View current certificate
                </a>
              )}
            </Field>
            <div className="flex gap-3 pt-1">
              <button onClick={saveAch} disabled={saving || certUploading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                <CheckIcon className="w-4 h-4" /> {certUploading ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setAchModal(null)} className="px-4 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Skill Modal ── */}
      {skillModal !== null && (
        <Modal title={skillModal === 'add' ? 'Add Skill' : 'Edit Skill'} onClose={() => setSkillModal(null)}>
          <div className="space-y-4">
            <Field label="Skill Name *">
              <Input placeholder="e.g. React.js, Python, Docker..." value={skillForm.name} onChange={e => setSkillForm(p => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="Proficiency Level">
              <Select options={PROFICIENCY_LEVELS} value={skillForm.proficiency} onChange={e => setSkillForm(p => ({ ...p, proficiency: e.target.value }))} />
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-indigo-500 transition-all ${PROFICIENCY_WIDTH[skillForm.proficiency]}`} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{skillForm.proficiency}</p>
            </Field>
            <div className="flex gap-3 pt-1">
              <button onClick={saveSkill} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                <CheckIcon className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setSkillModal(null)} className="px-4 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Project Modal ── */}
      {projModal !== null && (
        <Modal title={projModal === 'add' ? 'Add Project' : 'Edit Project'} onClose={() => setProjModal(null)}>
          <div className="space-y-4">
            <Field label="Project Name *">
              <Input placeholder="e.g. Smart Attendance System" value={projForm.name} onChange={e => setProjForm(p => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="Description">
              <Textarea placeholder="Brief description of the project..." value={projForm.description} onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))} maxLength={500} />
            </Field>
            <Field label="Technologies (separate with ·)">
              <Input placeholder="e.g. React · Node.js · MongoDB" value={projForm.technologies} onChange={e => setProjForm(p => ({ ...p, technologies: e.target.value }))} />
            </Field>
            <Field label="Status">
              <Select options={['In Progress', 'Completed']} value={projForm.status} onChange={e => setProjForm(p => ({ ...p, status: e.target.value }))} />
            </Field>
            <Field label="GitHub URL (optional)">
              <Input type="url" placeholder="https://github.com/..." value={projForm.githubUrl} onChange={e => setProjForm(p => ({ ...p, githubUrl: e.target.value }))} />
            </Field>
            <Field label="Live URL (optional)">
              <Input type="url" placeholder="https://..." value={projForm.liveUrl} onChange={e => setProjForm(p => ({ ...p, liveUrl: e.target.value }))} />
            </Field>
            <div className="flex gap-3 pt-1">
              <button onClick={saveProj} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                <CheckIcon className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setProjModal(null)} className="px-4 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
