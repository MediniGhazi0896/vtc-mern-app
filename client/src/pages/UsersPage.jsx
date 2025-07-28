import { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  TextField,
  Pagination,
  Box,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import API from '../services/api';
import { decodeToken } from '../../../server/utils/decodeToken';
import { Snackbar, Alert } from '@mui/material';
import { Button, Stack } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const currentUserId = decodeToken()?.id;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchUsers = async () => {
    try {
      const res = await API.get(`/admin/users?search=${search}&page=${page}&limit=5`);
      setUsers(res.data.users);
      setPages(res.data.pages);
    } catch (err) {
      alert('Failed to fetch users: ' + err.response?.data?.message);
    }
  };

const handleRoleChange = async (id, newRole) => {
  try {
    const res = await API.put(`/admin/users/${id}/role`, { role: newRole });
    const updated = users.map((u) => (u._id === id ? res.data.user : u));
    setUsers(updated);
    showSnackbar('✅ Role updated successfully');
  } catch (err) {
    showSnackbar('❌ Failed to update role', 'error');
  }
};

const handleDeactivateUser = async (id) => {
  if (!window.confirm('Deactivate this user?')) return;
  try {
    await API.patch(`/admin/users/${id}/deactivate`);
    setUsers(users.map((u) => u._id === id ? { ...u, isActive: false } : u));
    showSnackbar('✅ User deactivated');
  } catch (err) {
    showSnackbar('❌ Failed to deactivate user', 'error');
  }
};

const handleDeleteUser = async (id) => {
  if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
  try {
    await API.delete(`/admin/users/${id}`);
    setUsers(users.filter((u) => u._id !== id));
    showSnackbar('🗑️ User permanently deleted');
  } catch (err) {
    showSnackbar('❌ Failed to delete user', 'error');
  }
};


  useEffect(() => {
    fetchUsers();
  }, [page, search]);
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success'
});

const showSnackbar = (message, severity = 'success') => {
  setSnackbar({ open: true, message, severity });
};

const handleCloseSnackbar = () => {
  setSnackbar({ ...snackbar, open: false });
};
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        👤 User Management
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search by name or email"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
         
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  size="small"
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="driver">Driver</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Chip
  label={user._id.toString() === currentUserId ? 'Active' : 'Inactive'}
  color={user._id.toString() === currentUserId ? 'success' : 'default'}
  size="small"
/>

              </TableCell>
              
              <TableCell>
  {user._id !== currentUserId && user.role !== 'admin' && (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        color="warning"
        size="small"
        startIcon={<WarningAmberIcon />}
        onClick={() => handleDeactivateUser(user._id)}
        disabled={!user.isActive}
      >
        Deactivate
      </Button>

      <Button
        variant="outlined"
        color="error"
        size="small"
        startIcon={<DeleteIcon />}
        onClick={() => handleDeleteUser(user._id)}
      >
        Delete
      </Button>
    </Stack>
  )}
</TableCell>


            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination count={pages} page={page} onChange={(_, value) => setPage(value)} />
      </Box>
      <Snackbar
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
    {snackbar.message}
  </Alert>
</Snackbar>

    </Paper>
  );
};

export default UsersPage;
