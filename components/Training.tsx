import React, { useState, useEffect } from 'react';
import { generateTrainingQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { Brain, CheckCircle2, XCircle, ChevronRight, Loader2 } from 'lucide-react';

interface TrainingProps {
  onComplete: (points: number) => void;
}

const Training: React.FC<TrainingProps> = ({ onComplete }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    loadNewQuestion();
  }, []);

  const loadNewQuestion = async () => {
    setLoading(true);
    setIsAnswered(false);
    setSelectedOption(null);
    const q = await generateTrainingQuiz();
    setQuestion(q);
    setLoading(false);
  };

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (question && index === question.correctAnswerIndex) {
      onComplete(25); // 25 XP for correct answer
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Micro-Training Drill</h2>
        <p className="text-slate-500 dark:text-slate-400">Stay sharp. Answer correctly to earn XP.</p>
      </div>

      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm min-h-[400px] flex flex-col justify-center shadow-sm transition-colors duration-300">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p>Generating scenario...</p>
          </div>
        ) : question ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-500/10 dark:bg-indigo-500/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">{question.question}</h3>
            </div>

            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ";
                if (!isAnswered) {
                  btnClass += "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200";
                } else {
                  if (idx === question.correctAnswerIndex) {
                    btnClass += "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
                  } else if (idx === selectedOption) {
                    btnClass += "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400";
                  } else {
                    btnClass += "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-400 opacity-50";
                  }
                }

                return (
                  <button 
                    key={idx} 
                    onClick={() => handleOptionClick(idx)}
                    disabled={isAnswered}
                    className={btnClass}
                  >
                    <span>{opt}</span>
                    {isAnswered && idx === question.correctAnswerIndex && <CheckCircle2 size={20} />}
                    {isAnswered && idx === selectedOption && idx !== question.correctAnswerIndex && <XCircle size={20} />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                <p className="text-slate-700 dark:text-slate-300 italic mb-4">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Insight: </span>
                  {question.explanation}
                </p>
                <button 
                  onClick={loadNewQuestion}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-colors ml-auto shadow-md shadow-indigo-500/20"
                >
                  Next Drill <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-red-400">Failed to load quiz.</div>
        )}
      </div>
    </div>
  );
};

export default Training;