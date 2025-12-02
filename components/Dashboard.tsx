import React from 'react';
import { UserStats } from '../types';
import { Trophy, Flame, Target, Award, ShieldAlert, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  stats: UserStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const data = [
    { name: 'Mon', xp: 120 },
    { name: 'Tue', xp: 200 },
    { name: 'Wed', xp: 150 },
    { name: 'Thu', xp: 300 },
    { name: 'Fri', xp: stats.xp > 500 ? 100 : 50 }, // Dynamic-ish
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Agent</h2>
        <p className="text-slate-400">Your vigilance keeps the company safe.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total XP</p>
              <h3 className="text-4xl font-bold text-white mt-2">{stats.points}</h3>
            </div>
            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Trophy size={24} />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Level {stats.level} &bull; {stats.nextLevelXp - stats.xp} XP to next level</p>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Day Streak</p>
              <h3 className="text-4xl font-bold text-white mt-2">{stats.streak}</h3>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
              <Flame size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Keep it up! +10% XP Bonus active.</p>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Reports</p>
              <h3 className="text-4xl font-bold text-white mt-2">{stats.reportsSubmitted}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Target size={24} />
            </div>
          </div>
           <p className="text-xs text-slate-500 mt-4">Phishing & Clean Desk checks.</p>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Training</p>
              <h3 className="text-4xl font-bold text-white mt-2">{stats.quizzesTaken}</h3>
            </div>
            <div className="p-3 bg-sky-500/20 rounded-lg text-sky-400">
              <Award size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Drills completed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-6">Weekly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{fill: '#334155'}}
                />
                <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#6366f1' : '#475569'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Top Agents</h3>
          <div className="space-y-4">
            {[
              { name: 'Sarah Connor', points: 4250, badge: 'shield' },
              { name: 'You', points: stats.points, badge: 'star', active: true },
              { name: 'John Doe', points: 2100, badge: 'sword' },
            ].sort((a,b) => b.points - a.points).map((user, idx) => (
              <div key={idx} className={`flex items-center p-3 rounded-xl ${user.active ? 'bg-indigo-500/20 border border-indigo-500/50' : 'bg-slate-700/30'}`}>
                <span className={`font-bold w-8 ${idx === 0 ? 'text-yellow-400' : 'text-slate-400'}`}>#{idx + 1}</span>
                <div className="flex-1">
                  <p className={`font-medium ${user.active ? 'text-white' : 'text-slate-300'}`}>{user.name}</p>
                </div>
                <span className="text-sm font-mono text-indigo-400">{user.points} XP</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            View Global Rankings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
