import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  BarChart3, 
  Users, 
  Settings, 
  Zap, 
  Eye, 
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SURVEY_CATEGORIES, SurveyResponse } from './constants';
import { cn } from './lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [step, setStep] = useState<'intro' | 'survey' | 'results' | 'history'>('intro');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [teamName, setTeamName] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<SurveyResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCategory = SURVEY_CATEGORIES[currentCategoryIndex];

  useEffect(() => {
    if (step === 'history') {
      fetchHistory();
    }
  }, [step]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/surveys`);
      if (res.ok) {
        const data = await res.json();
        const normalizedData = data.map((s: any) => ({
          ...s,
          categoryScores: typeof s.categoryScores === 'string' ? JSON.parse(s.categoryScores) : s.categoryScores,
          submitted_at: s.submittedAt || s.submitted_at
        }));
        setHistory(normalizedData);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev: Record<string, number>) => ({ ...prev, [questionId]: value }));
  };

  const isCategoryComplete = () => {
    return currentCategory.questions.every(q => answers[q.id] !== undefined);
  };

  const nextStep = () => {
    if (!isCategoryComplete()) {
      setError(`Please answer all questions in the "${currentCategory.name}" category before proceeding.`);
      // Scroll to top of questions or first unanswered? 
      // For now, just show the error.
      return;
    }
    
    setError(null);
    if (currentCategoryIndex < SURVEY_CATEGORIES.length - 1) {
      setCurrentCategoryIndex((prev: number) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      submitSurvey();
    }
  };

  const prevStep = () => {
    setError(null);
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev: number) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartAssessment = () => {
    if (!teamName.trim() || !respondentName.trim()) {
      setError('Both Team Name and Your Name are required to start the assessment.');
      return;
    }
    setError(null);
    setStep('survey');
  };

  const calculateScores = () => {
    const categoryScores: Record<string, number> = {};
    let totalSum = 0;
    let totalQuestions = 0;

    SURVEY_CATEGORIES.forEach(cat => {
      let catSum = 0;
      cat.questions.forEach(q => {
        catSum += answers[q.id] || 0;
      });
      categoryScores[cat.id] = Number((catSum / cat.questions.length).toFixed(2));
      totalSum += catSum;
      totalQuestions += cat.questions.length;
    });

    return {
      categoryScores,
      totalScore: Number((totalSum / totalQuestions).toFixed(2))
    };
  };

  const submitSurvey = async () => {
    if (!teamName || !respondentName) {
      setError('Please provide team and respondent names.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { categoryScores, totalScore } = calculateScores();
    const payload = {
      teamName,
      respondentName,
      categoryScores: JSON.stringify(categoryScores),
      totalScore
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStep('results');
      } else {
        setError('Failed to submit survey. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-500';
    if (score >= 3) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'dev-env': return <Settings className="w-5 h-5" />;
      case 'cicd': return <Zap className="w-5 h-5" />;
      case 'observability': return <Eye className="w-5 h-5" />;
      case 'culture': return <Users className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStep('intro')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Enablement<span className="text-indigo-600">IQ</span></h1>
          </div>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setStep('history')}
              className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Benchmarks
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                  Measure your team's <span className="text-indigo-600">engineering maturity.</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  Identify bottlenecks, track progress, and build a world-class developer experience with our comprehensive maturity assessment.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-xl shadow-black/5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      Team Name <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={teamName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTeamName(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. Platform Engineering"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border transition-all outline-none",
                        error && !teamName ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={respondentName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setRespondentName(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. Alex Chen"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border transition-all outline-none",
                        error && !respondentName ? "border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                      )}
                    />
                  </div>
                </div>

                {error && step === 'intro' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-3 text-sm font-medium border border-rose-100"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button 
                  onClick={handleStartAssessment}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
                >
                  Start Assessment
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SURVEY_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="p-4 bg-white rounded-2xl border border-black/5 flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                      {getCategoryIcon(cat.id)}
                    </div>
                    <span className="text-xs font-bold text-gray-600">{cat.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'survey' && (
            <motion.div 
              key="survey"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Category {currentCategoryIndex + 1} of {SURVEY_CATEGORIES.length}</span>
                  <span>{Math.round(((currentCategoryIndex) / SURVEY_CATEGORIES.length) * 100)}% Complete</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentCategoryIndex + 1) / SURVEY_CATEGORIES.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    {getCategoryIcon(currentCategory.id)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{currentCategory.name}</h3>
                    <p className="text-gray-500">{currentCategory.description}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {currentCategory.questions.map((q, idx) => (
                    <div 
                      key={q.id} 
                      className={cn(
                        "bg-white p-6 rounded-3xl border transition-all space-y-4",
                        error && answers[q.id] === undefined ? "border-rose-200 bg-rose-50/10 shadow-sm" : "border-black/5"
                      )}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-lg font-medium text-gray-800">{q.text}</p>
                        <span className="text-rose-500 font-bold">*</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => {
                              handleAnswer(q.id, val);
                              if (error) setError(null);
                            }}
                            className={cn(
                              "flex-1 py-3 rounded-xl font-bold transition-all border-2",
                              answers[q.id] === val 
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200" 
                                : "bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600"
                            )}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-gray-400 px-1">
                        <span>Strongly Disagree</span>
                        <span>Strongly Agree</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={prevStep}
                  disabled={currentCategoryIndex === 0}
                  className="flex-1 py-4 rounded-2xl font-bold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button 
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : currentCategoryIndex === SURVEY_CATEGORIES.length - 1 ? 'Finish Assessment' : 'Next Category'}
                  {!isSubmitting && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>

              {error && step === 'survey' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-3 text-sm font-medium border border-rose-100 sticky bottom-4 shadow-lg"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 text-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Assessment Complete!</h2>
                <p className="text-gray-500 max-w-md">
                  Great job, {respondentName.split(' ')[0]}! Your survey for <strong>{teamName}</strong> has been recorded.
                </p>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-2xl shadow-black/5 space-y-8">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Maturity Quotient</span>
                  <div className="text-7xl font-black text-indigo-600">{calculateScores().totalScore}</div>
                  <p className="text-sm font-medium text-gray-400">out of 5.0</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {SURVEY_CATEGORIES.map(cat => {
                    const score = calculateScores().categoryScores[cat.id];
                    return (
                      <div key={cat.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm">
                            {getCategoryIcon(cat.id)}
                          </div>
                          <span className="text-sm font-bold text-gray-700">{cat.name}</span>
                        </div>
                        <span className={cn("font-black text-lg", getScoreColor(score))}>{score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 py-4 rounded-2xl font-bold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
                >
                  New Survey
                </button>
                <button 
                  onClick={() => setStep('history')}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  View Benchmarks
                </button>
              </div>
            </motion.div>
          )}

          {step === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Team Benchmarks</h2>
                <button 
                  onClick={() => setStep('intro')}
                  className="text-sm font-bold text-indigo-600 hover:underline"
                >
                  Back to Survey
                </button>
              </div>

              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center space-y-4">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-gray-400 font-medium">No data points collected yet.</p>
                  </div>
                ) : (
                  history.map((item: SurveyResponse) => (
                    <div key={item.id} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-shadow space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{item.teamName}</h4>
                          <p className="text-xs text-gray-400 font-medium">
                            Assessed by {item.respondentName} • {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : 'Just now'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={cn("text-3xl font-black", getScoreColor(item.totalScore))}>
                            {item.totalScore}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Score</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {SURVEY_CATEGORIES.map(cat => (
                          <div key={cat.id} className="px-3 py-1 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{cat.name}</span>
                            <span className={cn("text-xs font-black", getScoreColor(item.categoryScores[cat.id]))}>
                              {item.categoryScores[cat.id]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-12 border-t border-black/5 text-center space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Engineering Enablement Framework v1.0</p>
        <p className="text-[10px] text-gray-300">Built for high-performance engineering organizations.</p>
      </footer>
    </div>
  );
}

