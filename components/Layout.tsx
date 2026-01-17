import React from 'react';
import { Github, TrendingUp, Star } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'trending' | 'stars';
  onTabChange: (tab: 'trending' | 'stars') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-dark-950 font-sans text-gray-200 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 p-1.5 rounded-lg">
                  <Github className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                GitTrend AI
              </span>
            </div>

            <div className="flex bg-dark-900 rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => onTabChange('trending')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'trending'
                    ? 'bg-dark-800 text-brand-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Trending</span>
              </button>
              <button
                onClick={() => onTabChange('stars')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'stars'
                    ? 'bg-dark-800 text-brand-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">My Stars</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-8 mt-12 bg-dark-950">
         <div className="max-w-7xl mx-auto px-4 text-center">
             <p className="text-gray-500 text-sm">
               Powered by <span className="text-brand-500 font-semibold">Gemini 2.0 Flash</span> & GitHub API
             </p>
         </div>
      </footer>
    </div>
  );
};

export default Layout;