import { useEffect, useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, Divider, Stack, Avatar, Button,
  Grid, TextField, Switch, FormControlLabel, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SettingsPanel({ open, onClose }) {
  const { user, setUser } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    notificationsEmail: true, notificationsPush: true,
  });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const { data } = await API.get('/users/me');
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          notificationsEmail: data?.preferences?.notificationsEmail ?? true,
          notificationsPush:  data?.preferences?.notificationsPush ?? true,
        });
        setPreview(data.profileImage ? `http://localhost:5000/uploads/${data.profileImage}` : '');
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [open]);

  const handleAvatar = (e) => {
    const f = e.target.files?.[0];
    if (f) { setAvatarFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await API.put('/users/me', {
        name: form.name, phone: form.phone,
        preferences: {
          notificationsEmail: form.notificationsEmail,
          notificationsPush: form.notificationsPush
        }
      });
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const { data } = await API.put('/users/me/avatar', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUser({ ...user, name: form.name, profileImage: data.profileImage });
      } else {
        setUser({ ...user, name: form.name });
      }
      alert('Profile updated');
    } catch (e) { alert(e?.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!pwd.current || !pwd.next) return alert('Fill all password fields');
    if (pwd.next !== pwd.confirm)    return alert('Passwords do not match');
    try {
      await API.put('/users/me/password', {
        currentPassword: pwd.current, newPassword: pwd.next
      });
      alert('Password updated'); setPwd({ current: '', next: '', confirm: '' });
    } catch (e) { alert(e?.response?.data?.message || 'Password change failed'); }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 480 } } }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Settings</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />

        {loading ? <CircularProgress /> : (
          <>
            {/* Avatar & profile */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar src={preview} sx={{ width: 72, height: 72 }} />
              <Button component="label" variant="outlined">
                Change Avatar
                <input hidden type="file" accept="image/*" onChange={handleAvatar} />
              </Button>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Full Name" fullWidth
                  value={form.name}
                  onChange={(e)=>setForm({...form, name:e.target.value})} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email" fullWidth  value={form.email} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Phone" fullWidth
                  value={form.phone}
                  onChange={(e)=>setForm({...form, phone:e.target.value})} />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={form.notificationsEmail}
                    onChange={(e)=>setForm({...form, notificationsEmail:e.target.checked})} />}
                  label="Email notifications" />
                <FormControlLabel sx={{ ml: 2 }}
                  control={<Switch checked={form.notificationsPush}
                    onChange={(e)=>setForm({...form, notificationsPush:e.target.checked})} />}
                  label="Push notifications" />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Password */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Change Password</Typography>
            <Stack spacing={2}>
              <TextField label="Current Password" type="password"
                autoComplete="current-password"
                value={pwd.current} onChange={(e)=>setPwd({...pwd, current:e.target.value})}/>
              <TextField label="New Password" type="password"
                autoComplete="new-password"
                value={pwd.next} onChange={(e)=>setPwd({...pwd, next:e.target.value})}/>
              <TextField label="Confirm New Password" type="password"
                autoComplete="new-password"
                value={pwd.confirm} onChange={(e)=>setPwd({...pwd, confirm:e.target.value})}/>
              <Button variant="outlined" onClick={changePassword}>Update Password</Button>
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );
}
