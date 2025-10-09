import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import BookingPage from "./pages/BookingPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardHome from "./pages/DashboardHome";
import NewBooking from "./pages/NewBooking";
import AuthPage from "./pages/AuthPage";
import EditBooking from "./pages/EditBooking";
import UsersPage from "./pages/UsersPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import DriverDashboard from "./pages/DriverDashboard";
import ChatPage from "./pages/ChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import LandingPage from "./pages/LandingPage";
import BookingStatus from "./pages/BookingStatus";
import ProfileInfo from "./pages/ProfileInfo";
import ProfileSecurity from "./pages/ProfileSecurity";
import ProfilePrivacy from "./pages/ProfilePrivacy";
// Leaflet CSS
// ✅ added
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      {/* Booking status is private */}
      <Route
        path="/booking/status/:bookingId"
        element={
          <PrivateRoute>
            <BookingStatus />
          </PrivateRoute>
        }
      />

      {/* Dashboard (protected) */}
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
        <Route path="bookings/new" element={<NewBooking />} />
        <Route path="bookings/edit/:id" element={<EditBooking />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/info" element={<ProfileInfo />} />
        <Route path="profile/security" element={<ProfileSecurity />} />
        <Route path="profile/privacy" element={<ProfilePrivacy />} />
        <Route path="admin/users" element={<AdminPanelPage />} />
        <Route path="admin/audit-logs" element={<AuditLogsPage />} />
        <Route path="driver" element={<DriverDashboard />} />
        <Route path="chat/:bookingId" element={<ChatPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>
    </Routes>
  );
}

export default App;
