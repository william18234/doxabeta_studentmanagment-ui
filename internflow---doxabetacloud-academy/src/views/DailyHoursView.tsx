import React, { useState, useEffect } from 'react';
import { Clock, Plus, Filter, Calendar, CheckCircle2, FileText, User, X } from 'lucide-react';
import { DailyHour, Student } from '../types';
import { apiService, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CSVExportButton } from '../components/CSVExportButton';
import { ErrorBanner } from '../components/ErrorBanner';

export const DailyHoursView: React.FC = () => {
  const { authHeader, user } = useAuth();
  const [dailyHours, setDailyHours] = useState<DailyHour[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Filters
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Log Hours Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: user?.studentId || 's1',
    date: new Date().toISOString().split('T')[0],
    hoursLogged: 8.0,
    project: 'InternFlow Dashboard API',
    category: 'Backend & REST API',
    description: ''
  });

  const isStudentRole = user?.role === 'STUDENT';

  const fetchData = async () => {
    if (!authHeader) return;
    setIsLoading(true);
    setError(null);
    try {
      const [hoursData, studentsData] = await Promise.all([
        apiService.getDailyHours(authHeader, selectedStudentId || undefined),
        apiService.getStudents(authHeader)
      ]);
      setDailyHours(hoursData);
      setStudents(studentsData);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authHeader, selectedStudentId]);

  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader) return;
    try {
      await apiService.logDailyHours(authHeader, {
        ...formData,
        studentId: isStudentRole ? (user?.studentId || 's1') : formData.studentId
      });
      setIsLogModalOpen(false);
      setFormData({
        studentId: user?.studentId || 's1',
        date: new Date().toISOString().split('T')[0],
        hoursLogged: 8.0,
        project: 'InternFlow Dashboard API',
        category: 'Backend & REST API',
        description: ''
      });
      fetchData();
    } catch (err: any) {
      setError(err);
    }
  };

  const filteredHours = dailyHours.filter(h => {
    if (!selectedCategory) return true;
    return h.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const totalHours = filteredHours.reduce((sum, h) => sum + Number(h.hoursLogged), 0);

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onDismiss={() => setError(null)} onRetry={fetchData} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Daily Hours Tracking</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log work hours, projects & task activities (`GET /api/daily-hours`, `POST /api/daily-hours`)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CSVExportButton
            data={filteredHours}
            filename="doxabeta-daily-hours"
            title="Export Hours CSV"
            columnMapping={{
              id: 'Log ID',
              date: 'Date',
              studentName: 'Student',
              hoursLogged: 'Hours Logged',
              project: 'Project Name',
              category: 'Category',
              description: 'Activity Description',
              status: 'Approval Status'
            }}
          />

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Work Hours</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Hours Visible</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalHours.toFixed(1)} hrs</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Logged Entries</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{filteredHours.length} logs</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Avg Hours/Entry</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {filteredHours.length > 0 ? (totalHours / filteredHours.length).toFixed(1) : 0} hrs
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filter Daily Hours</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Student filter */}
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
          >
            <option value="">All Students (`GET /api/daily-hours`)</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.track})
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="Backend & REST API">Backend & REST API</option>
            <option value="Cloud Infrastructure">Cloud Infrastructure</option>
            <option value="Frontend & Analytics">Frontend & Analytics</option>
            <option value="AI & Data Engineering">AI & Data Engineering</option>
          </select>
        </div>
      </div>

      {/* Daily Hours Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Project & Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Hours</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading daily hours...</td>
                </tr>
              ) : filteredHours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No time logs recorded yet.</td>
                </tr>
              ) : (
                filteredHours.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-slate-500">{h.date}</td>

                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {h.studentName || 'Student'}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{h.project}</div>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400">{h.category}</span>
                    </td>

                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {h.description || 'No detailed description provided.'}
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                      {Number(h.hoursLogged).toFixed(1)} hrs
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full">
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG HOURS MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Log Daily Hours (POST /api/daily-hours)</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogHours} className="space-y-3 text-xs">
              {!isStudentRole && (
                <div>
                  <label className="block font-semibold mb-1">Select Student</label>
                  <select
                    value={formData.studentId}
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={formData.hoursLogged}
                    onChange={e => setFormData({ ...formData, hoursLogged: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.project}
                  onChange={e => setFormData({ ...formData, project: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="e.g. InternFlow Dashboard"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Backend & REST API">Backend & REST API</option>
                  <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  <option value="Frontend & Analytics">Frontend & Analytics</option>
                  <option value="AI & Data Engineering">AI & Data Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Deliverables</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="Summarize tasks accomplished today..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsLogModalOpen(false)} className="px-3 py-1.5 bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg">Submit Time Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
