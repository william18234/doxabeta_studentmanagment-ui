import React, { useState, useEffect } from 'react';
import { Star, Plus, Filter, User, Award, CheckCircle, X } from 'lucide-react';
import { Review, Student, Mentor } from '../types';
import { apiService, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CSVExportButton } from '../components/CSVExportButton';
import { ErrorBanner } from '../components/ErrorBanner';

export const ReviewsView: React.FC = () => {
  const { authHeader, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Create Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    mentorId: '',
    reviewDate: new Date().toISOString().split('T')[0],
    score: '5',
    learningOutcomes: 'Completed cloud security module with high accuracy.',
    notes: 'Excellent participation and initiative.',
    nextSteps: 'Begin advanced IAM and KMS training.'
  });

  const isStaff = user?.role === 'ADMIN' || user?.role === 'MENTOR';

  const fetchData = async () => {
    if (!authHeader) return;
    setIsLoading(true);
    setError(null);
    try {
      const [reviewsData, studentsData, mentorsData] = await Promise.all([
        apiService.getReviews(authHeader, selectedStudentId || undefined),
        apiService.getStudents(authHeader),
        apiService.getMentors(authHeader)
      ]);
      const fetchedStudents = Array.isArray(studentsData) ? studentsData : [];
      const fetchedMentors = Array.isArray(mentorsData) ? mentorsData : [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setStudents(fetchedStudents);
      setMentors(fetchedMentors);

      if (fetchedStudents.length > 0 && !formData.studentId) {
        setFormData(prev => ({ ...prev, studentId: String(fetchedStudents[0].id) }));
      }
      if (fetchedMentors.length > 0 && !formData.mentorId) {
        setFormData(prev => ({ ...prev, mentorId: String(fetchedMentors[0].id) }));
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

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHeader) return;

    if (!formData.studentId) {
      setError(new ApiError('Please select a student.', 400));
      return;
    }

    if (!formData.mentorId) {
      setError(new ApiError('Please select a mentor.', 400));
      return;
    }

    if (!formData.reviewDate) {
      setError(new ApiError('Review date is required.', 400));
      return;
    }

    const payload: any = {
      studentId: Number(formData.studentId),
      mentorId: Number(formData.mentorId),
      reviewDate: formData.reviewDate
    };

    if (formData.score !== '') {
      const scoreNum = Number(formData.score);
      if (scoreNum >= 1 && scoreNum <= 5) {
        payload.score = scoreNum;
      }
    }

    if (formData.learningOutcomes && formData.learningOutcomes.trim() !== '') {
      payload.learningOutcomes = formData.learningOutcomes.trim();
    }

    if (formData.notes && formData.notes.trim() !== '') {
      payload.notes = formData.notes.trim();
    }

    if (formData.nextSteps && formData.nextSteps.trim() !== '') {
      payload.nextSteps = formData.nextSteps.trim();
    }

    try {
      await apiService.createReview(authHeader, payload);
      setIsModalOpen(false);
      setFormData({
        studentId: students.length > 0 ? String(students[0].id) : '',
        mentorId: mentors.length > 0 ? String(mentors[0].id) : '',
        reviewDate: new Date().toISOString().split('T')[0],
        score: '5',
        learningOutcomes: '',
        notes: '',
        nextSteps: ''
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
            Mentor Evaluations & Performance Rubrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CSVExportButton
            data={reviews}
            filename="doxabeta-reviews"
            title="Export Reviews CSV"
            columnMapping={{
              id: 'Review ID',
              studentId: 'Student ID',
              mentorId: 'Mentor ID',
              studentName: 'Student Name',
              reviewerName: 'Mentor Evaluator',
              reviewDate: 'Date Evaluated',
              score: 'Score (1-5)',
              learningOutcomes: 'Learning Outcomes',
              notes: 'Notes',
              nextSteps: 'Next Steps'
            }}
          />

          {isStaff ? (
            <button
              onClick={() => {
                if (students.length > 0 && !formData.studentId) {
                  setFormData(prev => ({ ...prev, studentId: String(students[0].id) }));
                }
                if (mentors.length > 0 && !formData.mentorId) {
                  setFormData(prev => ({ ...prev, mentorId: String(mentors[0].id) }));
                }
                setIsModalOpen(true);
              }}
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
            <option value="">All Students</option>
            {(Array.isArray(students) ? students : []).map(s => (
              <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">Loading reviews...</div>
        ) : !Array.isArray(reviews) || reviews.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">No performance reviews recorded yet.</div>
        ) : (
          reviews.map((r, idx) => {
            const studentObj = students.find(s => String(s.id) === String(r.studentId));
            const mentorObj = mentors.find(m => String(m.id) === String(r.mentorId));
            const studentDisplay = studentObj
              ? `${studentObj.name} (ID: ${studentObj.id})`
              : (r.studentName ? `${r.studentName} (ID: ${r.studentId})` : `Student ID: ${r.studentId}`);
            const mentorDisplay = mentorObj
              ? `${mentorObj.name} (ID: ${mentorObj.id})`
              : (r.reviewerName ? `${r.reviewerName} (ID: ${r.mentorId || r.reviewerId})` : `Mentor ID: ${r.mentorId || r.reviewerId || 'N/A'}`);
            const scoreVal = r.score ?? r.rating;

            return (
              <div key={r.id || idx} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2 border-b pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{studentDisplay}</h3>
                    <p className="text-[11px] text-slate-400">Evaluated by {mentorDisplay} on {r.reviewDate}</p>
                  </div>

                  {scoreVal !== undefined && scoreVal !== null && (
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-extrabold text-amber-800 dark:text-amber-200">{scoreVal} / 5</span>
                    </div>
                  )}
                </div>

                <div className="text-xs space-y-2 text-slate-700 dark:text-slate-200">
                  {r.learningOutcomes && (
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Learning Outcomes</span>
                      <p className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        {r.learningOutcomes}
                      </p>
                    </div>
                  )}

                  {(r.notes || r.feedback) && (
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Notes</span>
                      <p className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                        {r.notes || r.feedback}
                      </p>
                    </div>
                  )}

                  {(r.nextSteps || r.recommendations) && (
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Next Steps</span>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 italic">
                        "{r.nextSteps || r.recommendations}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm">Write Performance Review</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3 text-xs">
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
                <label className="block font-semibold mb-1">Mentor (mentorId)</label>
                <select
                  required
                  value={formData.mentorId}
                  onChange={e => setFormData({ ...formData, mentorId: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <option value="">Select Mentor</option>
                  {(Array.isArray(mentors) ? mentors : []).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} (ID: {m.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Review Date (reviewDate)</label>
                  <input
                    type="date"
                    required
                    value={formData.reviewDate}
                    onChange={e => setFormData({ ...formData, reviewDate: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Score (score: 1–5)</label>
                  <select
                    value={formData.score}
                    onChange={e => setFormData({ ...formData, score: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    <option value="">None</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Satisfactory</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Learning Outcomes (learningOutcomes)</label>
                <textarea
                  value={formData.learningOutcomes}
                  onChange={e => setFormData({ ...formData, learningOutcomes: e.target.value })}
                  rows={2}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="e.g. Completed cloud security module with high accuracy."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes (notes)</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="e.g. Excellent participation and initiative."
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Next Steps (nextSteps)</label>
                <textarea
                  value={formData.nextSteps}
                  onChange={e => setFormData({ ...formData, nextSteps: e.target.value })}
                  rows={2}
                  className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                  placeholder="e.g. Begin advanced IAM and KMS training."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg cursor-pointer">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
