import React, { useEffect, useState } from 'react';
import { RefreshCcw, Flame, Search, Globe } from 'lucide-react';
import RepoCard from './RepoCard';
import { Repo, TrendingFilter, TrendingPeriod, GroundingSource } from '../types';
import { fetchTrendingReposWithAI } from '../services/geminiService';

const LANGUAGES = ["All", "JavaScript", "TypeScript", "Python", "Rust", "Go", "Java", "C++"];

const TrendingView: React.FC = () => {
  const [filter, setFilter] = useState<TrendingFilter>({
    period: TrendingPeriod.DAILY,
    language: "All"
  });
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    setSources([]);
    try {
      const { repos: fetchedRepos, sources: fetchedSources } = await fetchTrendingReposWithAI(filter.period, filter.language);
      setRepos(fetchedRepos);
      setSources(fetchedSources);
    } catch (err) {
      setError("Failed to load trending data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-dark-800/50 backdrop-blur-sm sticky top-20 z-10 border border-gray-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
          <div className="flex items-center gap-2 text-brand-400">
             <Flame className="w-5 h-5 fill-current" />
             <h2 className="text-lg font-bold text-white">Trending Now</h2>
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-3">
             {/* Period Filter */}
             <div className="flex bg-dark-900 rounded-lg p-1 border border-gray-700">
                {Object.values(TrendingPeriod).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilter(prev => ({ ...prev, period: p }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      filter.period === p 
                        ? 'bg-brand-600 text-white shadow-sm' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
             </div>

             {/* Language Filter */}
             <select 
               value={filter.language}
               onChange={(e) => setFilter(prev => ({ ...prev, language: e.target.value }))}
               className="bg-dark-900 text-gray-300 text-xs font-medium rounded-lg border border-gray-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none cursor-pointer hover:border-brand-500/50"
             >
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
             </select>

             <button 
                onClick={fetchTrending}
                disabled={loading}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh"
             >
               <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="text-center py-20 text-gray-500 bg-dark-800/50 rounded-xl border border-dashed border-gray-800">
            <p>{error}</p>
            <button onClick={fetchTrending} className="mt-4 text-brand-400 underline hover:text-brand-300">Try Again</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="h-48 bg-dark-800 rounded-xl animate-pulse border border-gray-800"></div>
           ))}
        </div>
      ) : (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {repos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
            ))}
            </div>
            
            {/* Grounding Sources */}
            {sources.length > 0 && (
                <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Globe className="w-3 h-3" />
                        <span>Sources provided by Gemini Search:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {sources.map((s, idx) => (
                            <a 
                                key={idx} 
                                href={s.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-xs text-brand-400 hover:underline bg-brand-900/10 px-2 py-1 rounded border border-brand-500/10 truncate max-w-[200px]"
                            >
                                {s.title || s.uri}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TrendingView;