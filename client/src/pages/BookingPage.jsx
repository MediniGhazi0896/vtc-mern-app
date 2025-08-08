import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Typography, TableSortLabel, TextField, Box, Button, Chip,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BookingPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderAsc, setOrderAsc] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const { user } = useAuth();
  useEffect(() => {
    fetchBookings();
    fetchDrivers();
    
  }, []);

  const fetchBookings = () => {
    API.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch(() => alert('Failed to load bookings'));
  };

 const fetchDrivers = () => {
  API.get('/admin/users')
    .then((res) => {
      const onlyDrivers = res.data.users.filter((u) => u.role === 'driver');
      console.log("🚗 Filtered drivers:", onlyDrivers);
      setDrivers(onlyDrivers);
    })
    .catch((err) => {
      console.error('❌ Failed to load drivers:', err.response?.data || err.message);
    });
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await API.delete(`/bookings/${id}`);
      setBookings(bookings.filter(b => b._id !== id));
    } catch {
      alert('Failed to delete booking');
    }
  };

  const handleDriverAssign = async (bookingId, driverId) => {
    try {
      const res = await API.put(`/bookings/${bookingId}/assign-driver`, { driverId });
      setBookings((prev) => prev.map(b => b._id === bookingId ? res.data : b));
    } catch {
      alert('❌ Failed to assign driver');
    }
  };

  const filtered = bookings
    .filter((b) =>
      b.pickupLocation?.toLowerCase().includes(search.toLowerCase()) &&
      (!searchUser || b.userId?.name?.toLowerCase().includes(searchUser.toLowerCase())) &&
      (!searchDate || new Date(b.createdAt).toISOString().slice(0, 10) === searchDate) &&
      (statusFilter === 'all' || b.status?.toLowerCase() === statusFilter)
    )
    .sort((a, b) =>
      orderAsc
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusChip = (status) => {
    const colorMap = {
      Confirmed: 'success',
      Cancelled: 'error',
      Pending: 'warning'
    };

    return (
      <Chip
        label={status?.charAt(0).toUpperCase() + status.slice(1)}
        color={colorMap[status] || 'default'}
        size="small"
      />
    );
  };

  return (
    <Paper sx={{ padding: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">📅 Bookings</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/dashboard/bookings/new')}>
          ➕ New Booking
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField size="small" label="Search Pickup" value={search} onChange={(e) => setSearch(e.target.value)} />
        <TextField size="small" label="Search User" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} />
        <TextField size="small" type="date" label="Date" InputLabelProps={{ shrink: true }} value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="canceled">Canceled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel active direction={orderAsc ? 'asc' : 'desc'} onClick={() => setOrderAsc(!orderAsc)}>
                Date
              </TableSortLabel>
            </TableCell>
            <TableCell>User</TableCell>
            <TableCell>Pickup</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Status</TableCell>
            {user?.role === 'admin' && <TableCell>Driver</TableCell>}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map((b) => (
            <TableRow key={b._id}>
              <TableCell>{new Date(b.createdAt).toLocaleString()}</TableCell>
              <TableCell>{b.userId?.name || 'N/A'}</TableCell>
              <TableCell>{b.pickupLocation}</TableCell>
              <TableCell>{b.destination}</TableCell>
              <TableCell>{getStatusChip(b.status)}</TableCell>
              {user?.role === 'admin' && ( <TableCell>
                <FormControl fullWidth size="small">
                  <Select
                    value={b.assignedDriver?._id || ''}
                    onChange={(e) => handleDriverAssign(b._id, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {drivers.map((d) => (
                      <MenuItem key={d._id} value={d._id}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select> 
                </FormControl>
              </TableCell>)}
              <TableCell>
                <Button size="small" color="primary" onClick={() => navigate(`/dashboard/bookings/edit/${b._id}`)}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleDelete(b._id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <Typography mx={2}>Page {page}</Typography>
        <Button disabled={page * itemsPerPage >= filtered.length} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </Box>
    </Paper>
  );
};

export default BookingPage;
