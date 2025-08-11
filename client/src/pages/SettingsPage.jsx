import { useEffect, useState } from 'react';
import {
  Box, Paper, Grid, Typography, TextField, Button,
  Avatar, Stack, Switch, FormControlLabel, CircularProgress
} from '@mui/material';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SettingsPanel({ onClose }) {
  // eslint-disable-next-line no-console
  console.log('[SettingsPanel] mounted');
  const { user, setUser } = useAuth?.() || { user: null, setUser: () => {} };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    notificationsEmail: true,
    notificationsPush: true,
  });

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get('/users/me');
        if (!mounted) return;
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          notificationsEmail: data?.preferences?.notificationsEmail ?? true,
          notificationsPush: data?.preferences?.notificationsPush ?? true,
        });
        if (data.profileImage) {
          const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
          setPreview(`${base}${data.profileImage}`);
        }
      } catch (e) {
        console.error('[SettingsPanel] load profile failed', e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await API.put('/users/me', {
        name: form.name,
        phone: form.phone,
        preferences: {
          notificationsEmail: form.notificationsEmail,
          notificationsPush: form.notificationsPush,
        },
      });

      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const { data } = await API.put('/users/me/avatar', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUser?.({ ...user, profileImage: data.profileImage, name: form.name });
      } else {
        setUser?.({ ...user, name: form.name });
      }

      alert('Profile updated');
    } catch (e) {
      console.error('[SettingsPanel] update failed', e);
      alert(e?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!pwd.current || !pwd.next) return alert('Fill all password fields');
    if (pwd.next !== pwd.confirm) return alert('Passwords do not match');
    try {
      await API.put('/users/me/password', {
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      alert('Password updated');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (e) {
      alert(e?.response?.data?.message || 'Password change failed');
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Profile card */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Profile</Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar src={preview} sx={{ width: 72, height: 72 }} />
              <Button component="label" variant="outlined">
                Change Avatar
                <input type="file" hidden accept="image/*" onChange={handleAvatar} />
              </Button>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Email" value={form.email}  fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.notificationsEmail}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notificationsEmail: e.target.checked }))
                      }
                    />
                  }
                  label="Email notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.notificationsPush}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, notificationsPush: e.target.checked }))
                      }
                    />
                  }
                  label="Push notifications"
                  sx={{ ml: 2 }}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
              {onClose && (
                <Button variant="text" onClick={onClose}>Close</Button>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Password card */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Change Password</Typography>
            <Stack spacing={2}>
              <TextField
                label="Current Password"
                type="password"
                value={pwd.current}
                onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
              />
              <TextField
                label="New Password"
                type="password"
                value={pwd.next}
                onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              />
              <Button variant="outlined" onClick={changePassword}>Update Password</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
