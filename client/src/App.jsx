import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CampusList from './pages/CampusList';
import CampusDetail from './pages/CampusDetail';
import MonthlyTracker from './pages/MonthlyTracker';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="planteles" element={<CampusList />} />
          <Route path="campus/:id" element={<CampusDetail />} />
          <Route path="monthly" element={<MonthlyTracker />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
