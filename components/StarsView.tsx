import React, { useState, useMemo } from 'react';
import { Github, User, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Loader2, ArrowUpDown } from 'lucide-react';
import RepoCard from './RepoCard';
import { Repo } from '../types';
import { fetchAllUserStars } from '../services/githubService';
import { semanticSearchStars } from '../services/geminiService';

const ITEMS_PER_PAGE = 12;

const StarsView: React.FC = () => {
  // Input State
  const [username, setUsername] = useState('');
  const [aiQuery, setAiQuery] = useState('');       // Natural language query
  
  // Data State
  const [fetchedUser, setFetchedUser] = useState<string | null>(null);
  const [allRepos, setAllRepos] = useState<Repo[]>([]); // Source of truth
  const [displayRepos, setDisplayRepos] = useState<Repo[]>([]); // Currently filtered list
  
  // UI State
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc' | 'recent'>('desc');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Count of loaded repos
  const [error, setError] = useState<string | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Logic
  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setAllRepos([]);
    setDisplayRepos([]);
    setProgress(0);
    
    try {
      // Fetch all pages
      const data = await fetchAllUserStars(username.trim(), (count) => {
          setProgress(count);
      });
      setAllRepos(data);
      setDisplayRepos(data);
      setFetchedUser(username.trim());
      setCurrentPage(1);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // AI Search Logic
  const handleAiSearch = async () => {
      if (!aiQuery.trim() || allRepos.length === 0) return;
      
      setIsAiSearching(true);
      try {
          const matchedIds = await semanticSearchStars(aiQuery, allRepos);
          
          // Filter allRepos based on returned IDs, preserving order returned by AI (relevance)
          const matchedRepos = matchedIds
            .map(id => allRepos.find(r => String(r.id) === id))
            .filter((r): r is Repo => r !== undefined);
            
          setDisplayRepos(matchedRepos);
          setCurrentPage(1);
      } catch (err) {
          console.error(err);
      } finally {
          setIsAiSearching(false);
      }
  };

  const clearAiSearch = () => {
      setAiQuery('');
      setDisplayRepos(allRepos);
      setCurrentPage(1);
  };

  // Cache original order for "Recently Added" sort
  const repoOrderMap = useMemo(() => {
    const map = new Map<string | number, number>();
    allRepos.forEach((repo, index) => map.set(repo.id, index));
    return map;
  }, [allRepos]);

  // Sorting Logic
  const sortedRepos = [...displayRepos].sort((a, b) => {
      if (sortOrder === 'recent') {
          return (repoOrderMap.get(a.id) ?? 0) - (repoOrderMap.get(b.id) ?? 0);
      }
      return sortOrder === 'asc' 
        ? a.stargazers_count - b.stargazers_count 
        : b.stargazers_count - a.stargazers_count;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedRepos.length / ITEMS_PER_PAGE);
  const paginatedRepos = sortedRepos.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <div className="space-y-6">
       {/* User Input Section */}
       <div className="max-w-xl mx-auto">
          {!fetchedUser && !loading && (
             <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20 border border-gray-700">
                 <Github className="w-8 h-8 text-white" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Explore Your Stars</h2>
               <p className="text-gray-400">Enter your GitHub username to fetch your entire star history and search it with AI.</p>
             </div>
          )}

          <form onSubmit={handleFetch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="GitHub Username"
              className="block w-full pl-10 pr-12 py-3 bg-dark-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
            />
            <button
                type="submit"
                disabled={loading || !username}
                className="absolute inset-y-1 right-1 px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <ArrowRight className="w-5 h-5" />
                )}
            </button>
          </form>
          {loading && (
              <p className="text-brand-400 text-xs mt-2 text-center animate-pulse">
                  Fetched {progress} repositories so far...
              </p>
          )}
          {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
       </div>

       {/* Results Area */}
       {(fetchedUser || allRepos.length > 0) && !loading && (
         <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">
            
            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row gap-4 bg-dark-800/50 p-5 rounded-2xl border border-gray-800">
                
                {/* User Info */}
                <div className="flex items-center gap-3 lg:w-1/4">
                   <h3 className="text-lg font-semibold text-white truncate">
                      <span className="text-brand-400">{fetchedUser}</span>
                   </h3>
                   <span className="px-2 py-0.5 bg-gray-800 rounded-full text-xs text-gray-400 border border-gray-700 flex-shrink-0">
                      {allRepos.length} total stars
                   </span>
                </div>

                {/* Search Tools */}
                <div className="flex flex-col sm:flex-row gap-3 flex-grow lg:w-3/4">
                    {/* Natural Language Search */}
                    <div className="relative flex-grow group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Sparkles className={`h-4 w-4 transition-colors ${isAiSearching ? 'text-brand-400' : 'text-gray-500'}`} />
                        </div>
                        <input
                            type="text"
                            placeholder='Ask AI: "Find react chart libraries..."'
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                            className="w-full bg-dark-950/50 border border-brand-500/30 rounded-lg py-2 pl-9 pr-20 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder-gray-600"
                        />
                         <div className="absolute inset-y-1 right-1 flex items-center gap-1">
                            {aiQuery && (
                                <button 
                                    onClick={clearAiSearch}
                                    className="px-2 py-1 text-xs text-gray-500 hover:text-white"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                onClick={handleAiSearch}
                                disabled={isAiSearching || !aiQuery}
                                className="px-3 py-1 bg-brand-600/20 hover:bg-brand-600/40 text-brand-400 hover:text-brand-200 rounded-md text-xs font-medium transition-colors border border-brand-500/20"
                            >
                                {isAiSearching ? <Loader2 className="w-3 h-3 animate-spin"/> : 'Search'}
                            </button>
                        </div>
                    </div>

                    {/* Sort Control */}
                    <div className="relative sm:w-56">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        <select 
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc' | 'recent')}
                            className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2 pl-9 pr-8 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500 appearance-none cursor-pointer hover:border-brand-500/50 transition-colors"
                        >
                            <option value="desc">Stars: High to Low</option>
                            <option value="asc">Stars: Low to High</option>
                            <option value="recent">Recently Added</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {displayRepos.length === 0 ? (
                <div className="text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                    <p>No repositories match your criteria.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {paginatedRepos.map(repo => (
                            <RepoCard key={repo.id} repo={repo} />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-800">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-dark-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            
                            <span className="text-sm text-gray-400">
                                Page <span className="text-brand-400 font-medium">{currentPage}</span> of {totalPages}
                            </span>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-dark-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
         </div>
       )}
    </div>
  );
};

export default StarsView;