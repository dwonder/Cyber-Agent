import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PhishingReporter from './components/PhishingReporter';
import SecurityReporter from './components/SecurityReporter';
import Training from './components/Training';
import NewsFeed from './components/NewsFeed';
import { ViewState, UserStats } from './types';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    points: 1250,
    level: 5,
    xp: 350,
    nextLevelXp: 1000,
    streak: 14,
    reportsSubmitted: 42,
    quizzesTaken: 15
  });

  const handleEarnPoints = (amount: number) => {
    setUserStats(prev => {
      const newXp = prev.xp + amount;
      const leveledUp = newXp >= prev.nextLevelXp;
      return {
        ...prev,
        points: prev.points + amount,
        xp: leveledUp ? newXp - prev.nextLevelXp : newXp,
        level: leveledUp ? prev.level + 1 : prev.level,
        nextLevelXp: leveledUp ? Math.floor(prev.nextLevelXp * 1.2) : prev.nextLevelXp,
        reportsSubmitted: (currentView === ViewState.REPORT_PHISHING || currentView === ViewState.REPORT_CLEANDESK) 
          ? prev.reportsSubmitted + 1 
          : prev.reportsSubmitted,
        quizzesTaken: currentView === ViewState.TRAINING ? prev.quizzesTaken + 1 : prev.quizzesTaken
      };
    });
    
    // Simple visual feedback could be added here (toast)
    // alert(`+${amount} XP Earned!`);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard stats={userStats} />;
      case ViewState.REPORT_PHISHING:
        return <PhishingReporter onComplete={handleEarnPoints} />;
      case ViewState.REPORT_CLEANDESK:
        return <SecurityReporter onComplete={handleEarnPoints} />;
      case ViewState.TRAINING:
        return <Training onComplete={handleEarnPoints} />;
      case ViewState.NEWS:
        return <NewsFeed />;
      default:
        return <Dashboard stats={userStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <Sidebar currentView={currentView} onChangeView={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }} />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <span className="font-bold text-lg">SecuQuest</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900/95 backdrop-blur-sm pt-20 px-6 md:hidden">
           <nav className="space-y-4">
            {Object.values(ViewState).map((view) => (
              <button
                key={view}
                onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
                className="block w-full text-left py-4 text-lg font-medium border-b border-slate-800 text-slate-300 hover:text-white"
              >
                {view.replace('_', ' ')}
              </button>
            ))}
           </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="md:pl-64 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
