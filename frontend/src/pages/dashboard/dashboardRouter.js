import React from 'react';
import EmployeeDashboard from '../employee/dashboard';
import ManagerDashboard from '../manager/dashboard';
import AdminDashboard from '../admin/dashboard';

const getUserRole = () => localStorage.getItem('role') || 'employee';

export default function DashboardRouter() {
  const role = getUserRole();

  switch (role) {
    case 'employee':
      return <EmployeeDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div className="dashboard">Unauthorized access</div>;
  }
}