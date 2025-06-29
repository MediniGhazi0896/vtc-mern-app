// src/pages/NewBooking.jsx
import { useState } from 'react';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const NewBooking = () => {
  const [form, setForm] = useState({
    pickupLocation: '',
    destination: '',
    date: '',
  });
  const navigate = useNavigate();
<Button onClick={() => navigate(-1)} color="secondary">⬅️ Back</Button>

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/bookings', form);
      alert('Booking created!');
      navigate('/dashboard/bookings');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Booking failed');
    }
  };

  return (
    <Paper sx={{ padding: 3 }}>
      <Typography variant="h6">Create New Booking</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField name="pickupLocation" label="Pickup Location" onChange={handleChange} required />
        <TextField name="destination" label="Destination" onChange={handleChange} required />
        <TextField
          name="date"
          label="Date"
          type="datetime-local"
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={handleChange}
          required
        />
        <Button type="submit" variant="contained">Submit</Button>
      </Box>
    </Paper>
  );
};

export default NewBooking;
