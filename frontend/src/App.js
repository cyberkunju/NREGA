import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DistrictSelector from './pages/DistrictSelector';
import ReportCard from './pages/ReportCard';
import NotFound from './pages/NotFound';
import Layout from './components/Layout/Layout';
import LanguageSelection from './components/Onboarding/LanguageSelection';
import './App.css';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <AppProvider>
      {showOnboarding && <LanguageSelection onComplete={handleOnboardingComplete} />}
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DistrictSelector />} />
            <Route path="/district/:districtName" element={<ReportCard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
