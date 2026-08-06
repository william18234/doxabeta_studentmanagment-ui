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
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    timeIn: '08:30',
    timeOut: '16:45',
    notes: ''
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
      const fetchedStudents = Array.isArray(studentsData) ? studentsData : [];
      setDailyHours(Array.isArray(hoursData) ? hoursData : []);
      setStudents(fetchedStudents);

      if (fetchedStudents.length > 0 && !formData.studentId) {
        setFormData(prev => ({ ...prev, studentId: String(fetchedStudents[0].id) }));
      }
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

    if (!formData.studentId) {
      setError(new ApiError('Please select a student.', 400));
      return;
    }

    if (formData.timeOut <= formData.timeIn) {
      setError(new ApiError('Time Out must be later than Time In.', 400));
      return;
    }

    const payload: any = {
      studentId: Number(formData.studentId),
      date: formData.date,
      timeIn: formData.timeIn,
      timeOut: formData.timeOut
    };

    if (formData.notes && formData.notes.trim() !== '') {
      payload.notes = formData.notes.trim();
    }

    try {
      await apiService.logDailyHours(authHeader, payload);
      setIsLogModalOpen(false);
      setFormData({
        studentId: students.length > 0 ? String(students[0].id) : '',
        date: new Date().toISOString().split('T')[0],
        timeIn: '08:30',
        timeOut: '16:45',
        notes: ''
      });
      fetchData();
    } catch (err: any) {
      setError(err);
    }
  };

  const calculateHours = (timeIn?: string, timeOut?: string): number => {
    if (!timeIn || !timeOut) return 0;
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return 0;
    const diff = (outH * 60 + outM) - (inH * 60 + inM);
    return diff > 0 ? diff / 60 : 0;
  };

  const safeHours = Array.isArray(dailyHours) ? dailyHours : [];
  const filteredHours = safeHours.filter(h => {
    if (!selectedCategory) return true;
    const cat = h.category || h.notes || '';
    return cat.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const totalHours = filteredHours.reduce((sum, h) => {
    const hours = h.hoursLogged !== undefined && h.hoursLogged !== null
      ? Number(h.hoursLogged)
      : calculateHours(h.timeIn, h.timeOut);
    return sum + hours;
  }, 0);

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onDismiss={() => setError(null)} onRetry={fetchData} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Daily Hours Tracking</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log work hours, projects & task activities
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
            <option value="">All Students</option>
            {(Array.isArray(students) ? students : []).map(s => (
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
                <th className="px-4 py-3">Date (date)</th>
                <th className="px-4 py-3">Student (studentId)</th>
                <th className="px-4 py-3">Time In / Out</th>
                <th className="px-4 py-3">Notes (notes)</th>
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
                filteredHours.map((h, index) => {
                  const studentObj = students.find(s => String(s.id) === String(h.studentId));
                  const displayName = studentObj
                    ? `${studentObj.name} (ID: ${studentObj.id})`
                    : (h.studentName ? `${h.studentName} (ID: ${h.studentId})` : `Student ID: ${h.studentId}`);
                  const hoursVal = h.hoursLogged !== undefined && h.hoursLogged !== null
                    ? Number(h.hoursLogged)
                    : calculateHours(h.timeIn, h.timeOut);

                  return (
                    <tr key={h.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-slate-500">{h.date}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{displayName}</td>
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        {h.timeIn && h.timeOut ? `${h.timeIn} - ${h.timeOut}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {h.notes || h.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                        {hoursVal.toFixed(1)} hrs
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full">
                          {h.status || 'SUBMITTED'}
                        </span>
                      </td>
                    </tr>
                  );
                })
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
              <h3 className="font-bold text-sm">Log Daily Hours</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogHours} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Student (studentId)</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">Select Student</option>
                  {(Array.isArray(students) ? students : []).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (ID: {s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Date (date)</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Time In (timeIn)</label>
                  <input
                    type="time"
                    required
                    value={formData.timeIn}
                    onChange={e => setFormData({ ...formData, timeIn: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Time Out (timeOut)</label>
                  <input
                    type="time"
                    required
                    value={formData.timeOut}
                    onChange={e => setFormData({ ...formData, timeOut: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes (notes)</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="Optional notes or deliverables..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsLogModalOpen(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg cursor-pointer">Submit Time Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
