import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  MenuItem
} from '@mui/material';
import API from '../services/api';

const EditBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickupLocation: '',
    destination: '',
    date: '',
    status: ''
  });

  useEffect(() => {
    API.get(`/bookings/${id}`)
      .then((res) => {
        const b = res.data;
        setForm({
          pickupLocation: b.pickupLocation || '',
          destination: b.destination || '',
          date: b.createdAt ? new Date(b.createdAt).toISOString().slice(0, 16) : '',
          status: b.status || 'pending'
        });
      })
      .catch(() => alert('Failed to load booking'));
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/bookings/${id}`, form);
      alert('Booking updated');
      navigate('/dashboard/bookings');
    } catch {
      alert('Failed to update booking');
    }
  };

  return (
    <Paper sx={{ padding: 3 }}>
      <Typography variant="h6">Edit Booking</Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          name="pickupLocation"
          label="Pickup Location"
          value={form.pickupLocation}
          onChange={handleChange}
          required
        />
        <TextField
          name="destination"
          label="Destination"
          value={form.destination}
          onChange={handleChange}
          required
        />
        <TextField
          name="date"
          type="datetime-local"
          label="Date"
          InputLabelProps={{ shrink: true }}
          value={form.date}
          onChange={handleChange}
        />
        <TextField
          name="status"
          label="Status"
          select
          value={form.status}
          onChange={handleChange}
        >
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="confirmed">Confirmed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
        <Button type="submit" variant="contained">Update</Button>
      </Box>
    </Paper>
  );
};

export default EditBooking;
