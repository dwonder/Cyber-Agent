import React, { useEffect, useState } from 'react';
import { fetchSecurityNews } from '../services/geminiService';
import { NewsItem } from '../types';
import { Newspaper, Calendar, ShieldAlert, ExternalLink, Loader2 } from 'lucide-react';

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      const data = await fetchSecurityNews();
      setNews(data);
      setLoading(false);
    };
    loadNews();
  }, []);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Threat Intelligence</h2>
          <p className="text-slate-400">Latest briefings on global cybersecurity trends.</p>
        </div>
        <button onClick={() => { setLoading(true); fetchSecurityNews().then(d => { setNews(d); setLoading(false); }); }} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
          <Newspaper size={20} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="h-48 bg-slate-800/50 rounded-2xl border border-slate-700 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 backdrop-blur-sm hover:border-indigo-500/50 transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  item.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                  item.severity === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.severity} Impact
                </span>
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <Calendar size={12} /> {item.date}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{item.headline}</h3>
              <p className="text-slate-400 text-sm mb-6 flex-1 leading-relaxed">
                {item.summary}
              </p>
              
              <button className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors mt-auto">
                Read Briefing <ExternalLink size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
