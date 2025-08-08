import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Box,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
import API from '../services/api';

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(user?.isAvailable || false);

  useEffect(() => {
    if (user?.role !== 'driver') {
      navigate('/dashboard');
    } else {
      fetchDriverBookings();
    }
  }, [user]);

  const fetchDriverBookings = async () => {
    try {
      const res = await API.get('/bookings/driver');
      setBookings(res.data);
    } catch {
      alert('Failed to load assigned bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/bookings/${id}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
    } catch {
      alert('❌ Failed to update booking');
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await API.patch('/users/driver/availability');
      setAvailable(res.data.isAvailable);
    } catch {
      alert('❌ Failed to update availability');
    }
  };

  const getStatusChip = (status) => {
    const colorMap = {
      confirmed: 'success',
      canceled: 'error',
      pending: 'warning'
    };

    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={colorMap[status?.toLowerCase()] || 'default'}
        size="small"
      />
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">🚗 Driver Dashboard</Typography>
      <Typography sx={{ mb: 1 }}>
        Welcome, <strong>{user?.name}</strong>
      </Typography>

      <FormControlLabel
        control={
          <Switch checked={available} onChange={toggleAvailability} color="success" />
        }
        label={available ? '🟢 Available' : '🔴 Unavailable'}
        sx={{ mb: 2 }}
      />

      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Typography>No assigned bookings yet.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pickup</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b._id}>
                <TableCell>{b.pickupLocation}</TableCell>
                <TableCell>{b.destination}</TableCell>
                <TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell>
                <TableCell>{getStatusChip(b.status)}</TableCell>
                <TableCell>{b.userId?.name || '—'}</TableCell>
                <TableCell>
                  {b.status === 'Pending' ? (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        sx={{ mr: 1 }}
                        onClick={() => updateStatus(b._id, 'Confirmed')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => updateStatus(b._id, 'Cancelled')}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default DriverDashboard;
