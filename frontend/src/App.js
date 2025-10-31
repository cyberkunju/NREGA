import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DistrictSelector from './pages/DistrictSelector';
import ReportCard from './pages/ReportCard';
import NotFound from './pages/NotFound';
import Layout from './components/Layout/Layout';
import './App.css';

function App() {
  return (
    <AppProvider>
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
