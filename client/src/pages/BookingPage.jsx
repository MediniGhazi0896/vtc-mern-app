import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TableSortLabel,
  TextField,
  Box,
  Button
} from '@mui/material';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const BookingPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [orderAsc, setOrderAsc] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
  API.get('/bookings')
    .then((res) => {
     // console.log('✅ Bookings:', res.data); // <-- ADD THIS
      setBookings(res.data);
    })
    .catch((err) => {
     // console.error('❌ Failed to load bookings:', err); // <-- AND THIS
      alert('Failed to load bookings');
    });
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await API.delete(`/bookings/${id}`);
      setBookings(bookings.filter(b => b._id !== id));
    } catch (err) {
      alert('Failed to delete booking');
    }
  };

  const filtered = bookings
    .filter((b) =>
      b.pickupLocation?.toLowerCase().includes(search.toLowerCase()) &&
      (!searchUser || b.userId?.name?.toLowerCase().includes(searchUser.toLowerCase())) &&
      (!searchDate || new Date(b.createdAt).toISOString().slice(0, 10) === searchDate)
    )
    .sort((a, b) =>
      orderAsc
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Paper sx={{ padding: 3 }}>
      {/* Header and New Booking Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">📅 My Bookings</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/dashboard/bookings/new')}
        >
          ➕ New Booking
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          size="small"
          label="Search Pickup"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          size="small"
          label="Search User"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        />
        <TextField
          size="small"
          type="date"
          label="Date"
          InputLabelProps={{ shrink: true }}
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
      </Box>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active
                direction={orderAsc ? 'asc' : 'desc'}
                onClick={() => setOrderAsc(!orderAsc)}
              >
                Date
              </TableSortLabel>
            </TableCell>
            <TableCell>User</TableCell>
            <TableCell>Pickup</TableCell>
            <TableCell>Destination</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map((b) => (
            <TableRow key={b._id}>
              <TableCell>{b.createdAt ? new Date(b.createdAt).toLocaleString() : 'N/A'}</TableCell>
              <TableCell>{b.userId?.name || 'N/A'}</TableCell>
              <TableCell>{b.pickupLocation || 'N/A'}</TableCell>
              <TableCell>{b.destination || 'N/A'}</TableCell>
              <TableCell>{b.status || 'Pending'}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/dashboard/bookings/edit/${b._id}`)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(b._id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <Typography mx={2}>Page {page}</Typography>
        <Button disabled={page * itemsPerPage >= filtered.length} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </Box>
    </Paper>
  );
};

export default BookingPage;
