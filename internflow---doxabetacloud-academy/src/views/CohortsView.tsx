import React, { useState, useEffect } from 'react';
import { FolderGit2, Plus, Users, Calendar, Eye, X } from 'lucide-react';
import { Cohort, Student } from '../types';
import { apiService, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CSVExportButton } from '../components/CSVExportButton';
import { ErrorBanner } from '../components/ErrorBanner';

export const CohortsView: React.FC = () => {
  const { authHeader, user } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Selected cohort detail & students
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [cohortStudents, setCohortStudents] = useState<Student[]>([]);
  const [isLoadingCohortStudents, setIsLoadingCohortStudents] = useState(false);

  // Add Cohort Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    track: 'Cloud & DevOps',
    maxCapacity: 25
  });

  const isStaff = user?.role === 'ADMIN' || user?.role === 'MENTOR';

  const fetchCohorts = async () => {
    if (!authHeader) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getCohorts(authHeader);
      setCohorts(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCohorts();
  }, [authHeader]);

  const handleSelectCohort = async (c: Cohort) => {
    setSelectedCohort(c);
    if (!authHeader) return;
    setIsLoadingCohortStudents(true);
    try {
      const students = await apiService.getCohortStudents(authHeader, c.id);
      setCohortStudents(students);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoadingCohortStudents(false);
    }
  };

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader) return;
    try {
      await apiService.createCohort(authHeader, formData);
      setIsAddModalOpen(false);
      setFormData({ name: '', code: '', startDate: new Date().toISOString().split('T')[0], endDate: '2026-12-31', track: 'Cloud & DevOps', maxCapacity: 25 });
      fetchCohorts();
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onDismiss={() => setError(null)} onRetry={fetchCohorts} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Cohort Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Academy Cohorts & Class Rosters (secure cohort resource)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CSVExportButton
            data={cohorts}
            filename="doxabeta-cohorts"
            title="Export Cohorts CSV"
            columnMapping={{
              id: 'Cohort ID',
              name: 'Cohort Name',
              code: 'Code',
              track: 'Track',
              startDate: 'Start Date',
              endDate: 'End Date',
              maxCapacity: 'Max Capacity',
              studentCount: 'Enrolled Count',
              status: 'Status'
            }}
          />

          {isStaff && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Cohort</span>
            </button>
          )}
        </div>
      </div>

      {/* Cohorts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">Loading cohorts...</div>
        ) : cohorts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">No cohorts available.</div>
        ) : (
          cohorts.map(c => (
            <div
              key={c.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between hover:border-purple-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</h3>
                    <p className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">{c.code}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      c.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'Completed'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Track: <strong className="font-medium">{c.track}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dates: {c.startDate} to {c.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Enrolled: <strong className="font-semibold text-slate-900 dark:text-white">{c.studentCount ?? 0}</strong> / {c.maxCapacity} Seats</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectCohort(c)}
                className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Students (secure cohort roster)</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* CREATE COHORT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Create Cohort (secure cohort create action)</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCohort} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Cohort Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="Cloud Native Engineering 2026-Q3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                    placeholder="CNE-2026Q3"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Capacity</label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={e => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Track</label>
                <input
                  type="text"
                  value={formData.track}
                  onChange={e => setFormData({ ...formData, track: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-3 py-1.5 bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg">Create Cohort</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COHORT STUDENTS MODAL */}
      {selectedCohort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Enrolled Students in {selectedCohort.name}</h3>
                <p className="text-xs font-mono text-purple-600">{selectedCohort.code} • {selectedCohort.track}</p>
              </div>
              <button onClick={() => setSelectedCohort(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {isLoadingCohortStudents ? (
                <p className="text-xs text-slate-400 text-center py-4">Loading cohort roster...</p>
              ) : cohortStudents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No students currently enrolled in this cohort.</p>
              ) : (
                cohortStudents.map(s => (
                  <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-[11px] text-slate-400">{s.email} • Mentor: {s.mentorName || 'Unassigned'}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-full">
                      {s.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="text-right pt-2 border-t">
              <button onClick={() => setSelectedCohort(null)} className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-xs rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
