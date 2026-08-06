import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, Search, Eye, Users, Mail, Phone, Building2, X } from 'lucide-react';
import { Mentor, Student } from '../types';
import { apiService, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CSVExportButton } from '../components/CSVExportButton';
import { ErrorBanner } from '../components/ErrorBanner';

export const MentorsView: React.FC = () => {
  const { authHeader, user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Selected Mentor detail & Mentees
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [mentorStudents, setMentorStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Add Mentor Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMentorId, setDeleteMentorId] = useState('');
  const [formData, setFormData] = useState({
    code: 'MEN001',
    name: '',
    email: '',
    phone: '',
    title: 'Senior Cloud Architect',
    department: 'Cloud Infrastructure & DevOps',
    maxMentees: 10,
    bio: ''
  });

  const isAdmin = user?.role === 'ADMIN';

  const fetchMentors = async () => {
    if (!authHeader) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getMentors(authHeader);
      setMentors(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [authHeader]);

  const handleSelectMentor = async (m: Mentor) => {
    setSelectedMentor(m);
    if (!authHeader) return;
    setIsLoadingStudents(true);
    try {
      const students = await apiService.getMentorStudents(authHeader, m.id);
      setMentorStudents(Array.isArray(students) ? students : []);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader) return;
    try {
      const payload = {
        code: formData.code || 'MEN001',
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        title: formData.title || 'Senior Cloud Architect',
        department: formData.department || 'Cloud Infrastructure & DevOps',
        maxMentees: Number(formData.maxMentees) || 10,
        bio: formData.bio || ''
      };
      await apiService.createMentor(authHeader, payload);
      setIsAddModalOpen(false);
      setFormData({ code: 'MEN001', name: '', email: '', phone: '', title: 'Senior Cloud Architect', department: 'Cloud Infrastructure & DevOps', maxMentees: 10, bio: '' });
      fetchMentors();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleDeleteMentor = async (id: string) => {
    if (!authHeader || !id) return;
    try {
      await apiService.deleteMentor(authHeader, id);
      setIsDeleteModalOpen(false);
      setDeleteMentorId('');
      fetchMentors();
    } catch (err: any) {
      setError(err);
    }
  };

  const safeMentors = Array.isArray(mentors) ? mentors : [];
  const filteredMentors = safeMentors.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.department.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onDismiss={() => setError(null)} onRetry={fetchMentors} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mentor Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            DoxabetaCloud Academy Faculty & Mentors
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CSVExportButton
            data={filteredMentors}
            filename="doxabeta-mentors"
            title="Export Mentors CSV"
            columnMapping={{
              id: 'Mentor ID',
              name: 'Full Name',
              email: 'Email',
              phone: 'Phone',
              title: 'Title',
              department: 'Department',
              maxMentees: 'Max Capacity',
              activeMenteesCount: 'Active Mentees'
            }}
          />

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Mentor</span>
              </button>

              <button
                onClick={() => {
                  if (mentors.length > 0) setDeleteMentorId(String(mentors[0].id));
                  setIsDeleteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Mentor</span>
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              Admin Role Required to Create
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search mentor name, email, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
          />
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">Loading mentors...</div>
        ) : filteredMentors.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">No mentors found.</div>
        ) : (
          filteredMentors.map(m => (
            <div
              key={m.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{m.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-full">
                      {m.department}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setDeleteMentorId(String(m.id));
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="Remove Mentor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{m.bio || 'Instructor & Cloud Specialist'}</p>

                <div className="pt-2 border-t text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Capacity: {m.activeMenteesCount ?? 0} / {m.maxMentees} Mentees Assigned</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectMentor(m)}
                className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Mentees</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* CREATE MENTOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Add New Mentor</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMentor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Mentor Code (code)</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 font-mono"
                  placeholder="e.g. MEN001"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Name (name)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="e.g. Dr. Marcus Vance"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email (email)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="m.vance@doxabetacloudacademy.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone (phone)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Title (title)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Department (department)</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Max Mentees (maxMentees)</label>
                  <input
                    type="number"
                    value={formData.maxMentees}
                    onChange={e => setFormData({ ...formData, maxMentees: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Bio (bio)</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-3 py-1.5 bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg">Create Mentor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MENTOR MENTEES MODAL */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedMentor.name}'s Assigned Mentees</h3>
                <p className="text-xs text-indigo-600 font-medium">{selectedMentor.title} • {selectedMentor.department}</p>
              </div>
              <button onClick={() => setSelectedMentor(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {isLoadingStudents ? (
                <p className="text-xs text-slate-400 text-center py-4">Fetching mentees list...</p>
              ) : !Array.isArray(mentorStudents) || mentorStudents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active mentees assigned to this mentor yet.</p>
              ) : (
                mentorStudents.map(s => (
                  <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-[11px] text-slate-400">{s.email} • Track: {s.track}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                      {s.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="text-right pt-2 border-t">
              <button onClick={() => setSelectedMentor(null)} className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-xs rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE MENTOR MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Remove Mentor</span>
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a faculty mentor to permanently remove from the system database.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Select Mentor to Delete
                </label>
                <select
                  value={deleteMentorId}
                  onChange={e => setDeleteMentorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- Choose a Mentor --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.title}) - ID: {m.id}
                    </option>
                  ))}
                </select>
              </div>

              {deleteMentorId && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200 space-y-1">
                  <p className="font-semibold">⚠️ Confirmation Warning</p>
                  <p className="text-[11px] opacity-90">
                    Deleting mentor <strong>{mentors.find(m => String(m.id) === String(deleteMentorId))?.name}</strong> will remove them from faculty directory and unassign their mentees.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!deleteMentorId}
                onClick={() => handleDeleteMentor(deleteMentorId)}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Delete Mentor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
