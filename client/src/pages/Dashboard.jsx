import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default Dashboard;
