import React, { useState, useRef } from 'react';
import { Upload, Camera, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { analyzePhishingAttempt } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface PhishingReporterProps {
  onComplete: (points: number) => void;
}

const PhishingReporter: React.FC<PhishingReporterProps> = ({ onComplete }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const data = await analyzePhishingAttempt(image);
      setResult(data);
      if (data) {
        onComplete(data.pointsAwarded);
      }
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Report Suspicious Email</h2>
        <p className="text-slate-500 dark:text-slate-400">Upload a screenshot of the email. Our AI will analyze headers, links, and content.</p>
      </div>

      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-sm transition-colors duration-300">
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group"
          >
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full group-hover:scale-110 transition-transform mb-4">
              <Upload className="text-indigo-600 dark:text-indigo-400" size={32} />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Click to upload screenshot</p>
            <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG</p>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-900">
              <img src={image} alt="Preview" className="w-full max-h-96 object-contain opacity-90 dark:opacity-80" />
              {!result && (
                <button 
                  onClick={reset}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-colors"
                >
                  <XCircle size={20} />
                </button>
              )}
            </div>

            {!result && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/30"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="animate-spin" /> Analyzing Threat...
                  </>
                ) : (
                  <>
                    <Camera /> Analyze Email
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {result && (
          <div className={`mt-6 p-6 rounded-xl border ${result.threatType === 'PHISHING' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/50' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/50'} animate-in zoom-in-95 duration-300`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${result.threatType === 'PHISHING' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                {result.threatType === 'PHISHING' ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${result.threatType === 'PHISHING' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {result.threatType === 'PHISHING' ? 'Phishing Threat Detected!' : 'Email Looks Safe'}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2">{result.explanation}</p>
                
                <div className="mt-4 flex items-center gap-4">
                   <div className="bg-slate-100 dark:bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Confidence</span>
                      <p className="text-slate-900 dark:text-white font-mono font-bold">{result.confidenceScore}%</p>
                   </div>
                   <div className="bg-indigo-50 dark:bg-indigo-500/20 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-500/50">
                      <span className="text-indigo-600 dark:text-indigo-300 text-xs uppercase tracking-wider">Reward</span>
                      <p className="text-indigo-700 dark:text-indigo-400 font-mono font-bold">+{result.pointsAwarded} XP</p>
                   </div>
                </div>
              </div>
            </div>
            <button onClick={reset} className="w-full mt-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition-colors font-medium">
              Submit Another Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhishingReporter;