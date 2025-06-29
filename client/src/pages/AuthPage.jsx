import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Box, Paper, Typography, TextField, Button, Link } from '@mui/material';
import PasswordField from '../components/PasswordField';

const AuthPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser && !user) {
      login(JSON.parse(storedUser)); // update context
      navigate('/dashboard');
    }
  }, [user, login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin
      ? { email: form.email, password: form.password }
      : form;
        // console.log(form); // Added to check the passed data before submiting
    try {
      const res = await API.post(endpoint, payload);
     //  console.log('✅ Auth response:', res.data); // Added to check the response data
      login(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Auth failed');
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <Paper sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {isLogin ? 'Login' : 'Sign Up'}
        </Typography>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <TextField
              label="Name"
              name="name"
              fullWidth
              margin="normal"
               value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
     <PasswordField
  value={form.password}
  onChange={(e) => setForm({ ...form, password: e.target.value })}
/>

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
          <Link sx={{ cursor: 'pointer' }} onClick={handleToggle}>
            {isLogin ? 'Sign Up' : 'Login'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default AuthPage;
