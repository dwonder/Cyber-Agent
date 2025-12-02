import React, { useState, useRef } from 'react';
import { Camera, ShieldCheck, Check, AlertOctagon, Loader2, RefreshCw } from 'lucide-react';
import { analyzeCleanDesk } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface SecurityReporterProps {
  onComplete: (points: number) => void;
}

const SecurityReporter: React.FC<SecurityReporterProps> = ({ onComplete }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImage(dataUrl);
      
      // Stop camera stream
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCameraOpen(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const data = await analyzeCleanDesk(image);
      setResult(data);
      if (data) {
        onComplete(data.pointsAwarded);
      }
    } catch (error) {
      console.error(error);
      alert("Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setIsCameraOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Clean Desk Audit</h2>
        <p className="text-slate-500 dark:text-slate-400">Take a photo of your (or a) workspace. Ensure no sensitive data is exposed.</p>
      </div>

      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center shadow-sm transition-colors duration-300">
        
        {/* Camera View */}
        {isCameraOpen && !image && (
          <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-96 object-cover" />
            <button 
              onClick={capturePhoto}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 bg-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-white/20"
            >
              <div className="w-8 h-8 rounded-full border-4 border-slate-900"></div>
            </button>
          </div>
        )}

        {/* Initial State */}
        {!isCameraOpen && !image && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
              <Camera size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ready to Audit?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Check for sticky notes with passwords, unlocked screens, or sensitive papers.</p>
            <button 
              onClick={startCamera}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30"
            >
              Open Camera
            </button>
          </div>
        )}

        {/* Captured Image Preview */}
        {image && (
          <div className="w-full space-y-6">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
              <img src={image} alt="Workspace" className="w-full h-64 object-cover" />
              {!result && (
                <button 
                  onClick={reset}
                  className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-slate-700 transition-colors"
                >
                  <RefreshCw size={18} />
                </button>
              )}
            </div>

            {!result && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="animate-spin" /> auditing workspace...
                  </>
                ) : (
                  <>
                    <ShieldCheck /> Run Audit
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="w-full mt-6 animate-in zoom-in-95 duration-300">
             <div className={`p-6 rounded-xl border ${result.threatType === 'SAFE' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/50' : 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/50'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${result.threatType === 'SAFE' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'}`}>
                    {result.threatType === 'SAFE' ? <Check size={28} /> : <AlertOctagon size={28} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{result.threatType === 'SAFE' ? 'Clean Desk Confirmed' : 'Security Violation Detected'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{result.confidenceScore}% AI Confidence</p>
                  </div>
                </div>
                
                <p className="text-slate-700 dark:text-slate-200 mb-6 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">{result.explanation}</p>

                <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Points Earned</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+{result.pointsAwarded} XP</span>
                </div>
                
                <button onClick={reset} className="w-full mt-4 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                  Audit Another Workspace
                </button>
             </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default SecurityReporter;