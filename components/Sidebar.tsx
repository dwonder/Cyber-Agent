import React from 'react';
import { LayoutDashboard, MailWarning, ShieldCheck, GraduationCap, Newspaper, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.REPORT_PHISHING, label: 'Report Phishing', icon: MailWarning },
    { id: ViewState.REPORT_CLEANDESK, label: 'Clean Desk', icon: ShieldCheck },
    { id: ViewState.TRAINING, label: 'Training Drills', icon: GraduationCap },
    { id: ViewState.NEWS, label: 'Intel Feed', icon: Newspaper },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col z-20 hidden md:flex">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <ShieldCheck className="text-white" size={20} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">SecuQuest</h1>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
