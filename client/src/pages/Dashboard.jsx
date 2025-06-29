// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  return (
    <DashboardLayout>
      <h1>Welcome {user?.name || 'Guest'}</h1>
      <p>This is your VTC dashboard.</p>

      {/* 👇 Include nested routes like /dashboard/bookings */}
      <Outlet />
    </DashboardLayout>
  );
};

export default Dashboard;
