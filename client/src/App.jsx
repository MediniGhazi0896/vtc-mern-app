import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import DashboardHome from './pages/DashboardHome'; 
import NewBooking from './pages/NewBooking';       
import AuthPage from './pages/AuthPage';
import EditBooking from './pages/EditBooking'; 
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AdminPanelPage from './pages/AdminPanelPage'; 
import DriverDashboard from './pages/DriverDashboard';
function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="bookings" element={<BookingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="bookings/new" element={<NewBooking />} />
        <Route path="/dashboard/bookings/edit/:id" element={<EditBooking />} />
        <Route path="admin/users" element={<AdminPanelPage />} />
        <Route path="driver" element={<DriverDashboard />} />

      </Route>
      <Route path="/" element={<AuthPage />} />

    </Routes>
  );
}

export default App;