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
      <Outlet />
    </DashboardLayout>
  );
};

export default Dashboard;
