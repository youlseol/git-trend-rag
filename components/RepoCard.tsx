import React, { useState } from 'react';
import { Star, GitFork, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import { Repo } from '../types';
import { generateRepoInsight } from '../services/geminiService';

interface RepoCardProps {
  repo: Repo;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  const [insight, setInsight] = useState<string | null>(repo.aiInsight || null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const handleGenerateInsight = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (insight) return;

    setLoadingInsight(true);
    const text = await generateRepoInsight(repo.name, repo.description || "");
    setInsight(text);
    setLoadingInsight(false);
  };

  return (
    <div className="group relative bg-dark-800 border border-dark-800 hover:border-brand-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            src={repo.owner.avatar_url} 
            alt={repo.owner.login} 
            className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800 flex-shrink-0"
          />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-100 truncate group-hover:text-brand-400 transition-colors">
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                {repo.name.split('/')[1] || repo.name}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
              </a>
            </h3>
            <p className="text-xs text-gray-400 truncate">by {repo.owner.login}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-dark-900 rounded-md border border-gray-700/50">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-medium text-gray-300">
            {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(repo.stargazers_count)}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-grow">
        {repo.description || "No description provided."}
      </p>

      {/* AI Insight Section */}
      <div className="mt-auto pt-3 border-t border-gray-800">
        {insight ? (
           <div className="bg-brand-900/20 border border-brand-500/20 rounded-lg p-3 animate-in fade-in duration-300">
             <div className="flex items-start gap-2">
               <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
               <p className="text-xs text-brand-100 leading-relaxed italic">
                 "{insight}"
               </p>
             </div>
           </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {repo.language && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  {repo.language}
                </span>
              )}
            </div>
            
            <button 
              onClick={handleGenerateInsight}
              disabled={loadingInsight}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-50"
            >
              {loadingInsight ? (
                 <span className="animate-pulse">Analyzing...</span>
              ) : (
                 <>
                   <Sparkles className="w-3.5 h-3.5" />
                   AI Insight
                 </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoCard;