import React, { useState, useEffect } from 'react';
import { Star, Plus, Filter, User, Award, CheckCircle, X } from 'lucide-react';
import { Review, Student } from '../types';
import { apiService, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CSVExportButton } from '../components/CSVExportButton';
import { ErrorBanner } from '../components/ErrorBanner';

export const ReviewsView: React.FC = () => {
  const { authHeader, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Create Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    rating: 5,
    technicalSkills: 5,
    communication: 5,
    initiative: 5,
    feedback: '',
    recommendations: ''
  });

  const isStaff = user?.role === 'ADMIN' || user?.role === 'MENTOR';

  const fetchData = async () => {
    if (!authHeader) return;
    setIsLoading(true);
    setError(null);
    try {
      const [reviewsData, studentsData] = await Promise.all([
        apiService.getReviews(authHeader, selectedStudentId || undefined),
        apiService.getStudents(authHeader)
      ]);
      setReviews(reviewsData);
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

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader) return;
    try {
      await apiService.createReview(authHeader, formData);
      setIsModalOpen(false);
      setFormData({
        studentId: '',
        rating: 5,
        technicalSkills: 5,
        communication: 5,
        initiative: 5,
        feedback: '',
        recommendations: ''
      });
      fetchData();
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onDismiss={() => setError(null)} onRetry={fetchData} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Performance Reviews</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mentor Evaluations & Skill Rubrics (`GET /api/reviews`, `POST /api/reviews`)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CSVExportButton
            data={reviews}
            filename="doxabeta-reviews"
            title="Export Reviews CSV"
            columnMapping={{
              id: 'Review ID',
              studentName: 'Student Name',
              reviewerName: 'Mentor Evaluator',
              reviewDate: 'Date Evaluated',
              rating: 'Overall Rating (1-5)',
              technicalSkills: 'Technical Score',
              communication: 'Communication Score',
              initiative: 'Initiative Score',
              feedback: 'Feedback Notes',
              recommendations: 'Recommendations'
            }}
          />

          {isStaff ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write Performance Review</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              Mentor/Admin Role Required to Create
            </span>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 max-w-md">
          <Filter className="w-4 h-4 text-amber-500 shrink-0" />
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
          >
            <option value="">All Students (`GET /api/reviews`)</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">No performance reviews recorded yet.</div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2 border-b pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{r.studentName}</h3>
                  <p className="text-[11px] text-slate-400">Evaluated by {r.reviewerName} on {r.reviewDate}</p>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-extrabold text-amber-800 dark:text-amber-200">{r.rating}.0 / 5</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] py-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Technical</span>
                  <span className="font-bold text-slate-900 dark:text-white">{r.technicalSkills}/5</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Communication</span>
                  <span className="font-bold text-slate-900 dark:text-white">{r.communication}/5</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Initiative</span>
                  <span className="font-bold text-slate-900 dark:text-white">{r.initiative}/5</span>
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-700 dark:text-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Mentor Feedback</span>
                  <p className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    {r.feedback}
                  </p>
                </div>

                {r.recommendations && (
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Key Recommendations</span>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 italic">
                      "{r.recommendations}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Write Performance Review (POST /api/reviews)</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Student</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">Select Student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.track})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Overall Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Technical Score (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.technicalSkills}
                    onChange={e => setFormData({ ...formData, technicalSkills: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Feedback</label>
                <textarea
                  required
                  value={formData.feedback}
                  onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                  rows={3}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="Evaluate problem solving, code quality, and project progress..."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Recommendations & Next Steps</label>
                <input
                  type="text"
                  value={formData.recommendations}
                  onChange={e => setFormData({ ...formData, recommendations: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="e.g. Focus on GCP Docker deployments next"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 bg-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
