import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import Finance from './pages/Finance';
import Production from './pages/Production';
import Settings from './pages/Settings';
import { StoreProvider } from './services/store';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'budgets':
        return <Budgets />;
      case 'finance':
        return <Finance />;
      case 'production':
        return <Production />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <StoreProvider>
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {renderPage()}
      </Layout>
    </StoreProvider>
  );
};

export default App;