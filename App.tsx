import React, { useState } from 'react';
import Layout from './components/Layout';
import TrendingView from './components/TrendingView';
import StarsView from './components/StarsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'stars'>('trending');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'trending' ? <TrendingView /> : <StarsView />}
    </Layout>
  );
};

export default App;