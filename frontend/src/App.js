// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/login';
import DashboardRouter from './pages/dashboard/dashboardRouter';
import BonusSucess from './pages/manager/bonus-success';
import PaymentFailed from './pages/manager/payment-failed';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path='/manager/bonus-success' element={<BonusSucess/>}/>
        <Route path='/manager/payment-failed' element={<PaymentFailed/>}/>
      </Routes>
    </Router>
  );
}

export default App;