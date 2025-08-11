import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography, Grid, Paper, Stack, Chip, Avatar, Box,
  Divider, LinearProgress, TextField, FormControlLabel, Switch
} from '@mui/material';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

// charts
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const ORANGE_BORDER = { border: '2px solid', borderColor: 'warning.light' };
const GREEN_BORDER  = { border: '2px solid', borderColor: 'success.light' };
const BLUE_BORDER   = { border: '2px solid', borderColor: 'info.light' };

const currency = (n) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

export default function DashboardHome() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  // ORANGE: bookings totals
  const [stats, setStats] = useState({ total: 0, completed: 0, cancelled: 0, pending: 0 });

  // GREEN: highlights + monthly revenue line
  const [highlights, setHighlights] = useState([]);
  const [monthlySeries, setMonthlySeries] = useState([]); // [{ label, revenue }]

  // BLUE: drivers table
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const abs = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) return `${API_BASE}${url}`;
    return `${API_BASE}/${url}`;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // your existing stats endpoints
        const endpoint = user?.role === 'driver' ? '/bookings/driver/stats' : '/bookings/stats';
        const statsRes = await API.get(endpoint);
        setStats(statsRes.data || { total: 0, completed: 0, cancelled: 0, pending: 0 });

        // optional admin analytics — use if available, else mock
        const [hiRes, revRes, drvRes] = await Promise.allSettled([
          API.get('/admin/analytics/highlights'),
          API.get('/admin/analytics/revenue-monthly'),
          API.get('/admin/drivers/stats', { params: { limit: 50 } }),
        ]);

        if (hiRes.status === 'fulfilled') {
          setHighlights((hiRes.value.data?.topDrivers || []).map(d => ({
            name: d.name,
            amount: d.amount,
            trend: d.trend || '+',
            avatar: abs(d.avatar),
          })));
        } else {
          setHighlights([
       /*      { name: 'Beck Collier', amount: 750, trend: '+', avatar: '' },
            { name: 'Angelo Hume', amount: 542, trend: '+', avatar: '' },
            { name: 'Salim Melendez', amount: 874, trend: '+', avatar: '' }, */
          ]);
        }

        if (revRes.status === 'fulfilled') {
          setMonthlySeries(revRes.value.data?.series || []); // [{ label, revenue }]
        } else {
          setMonthlySeries([
         /*    { label: 'Jan', revenue: 1200 }, { label: 'Feb', revenue: 1600 },
            { label: 'Mar', revenue: 1500 }, { label: 'Apr', revenue: 2100 },
            { label: 'May', revenue: 2400 }, { label: 'Jun', revenue: 2200 }, */
          ]);
        }

        if (drvRes.status === 'fulfilled') {
          const list = drvRes.value.data?.drivers || [];
          setDrivers(list.map(d => ({
            id: d.id || d._id,
            name: d.name,
            active: !!(d.active ?? d.isAvailable),
            rides: d.rides ?? d.completedRides ?? 0,
            earnings: d.earnings ?? d.totalEarnings ?? 0,
            rating: d.rating ?? d.avgRating ?? null,
            lastOnline: d.lastOnline || d.lastSeen || '',
            avatar: abs(d.avatar || d.profileImage),
          })));
        } else {
          setDrivers([
      /*       { id: 'd1', name: 'Amine R.',  active: true,  rides: 36, earnings: 980,  rating: 4.9, lastOnline: '2h ago', avatar: '' },
            { id: 'd2', name: 'Sarra B.',  active: false, rides: 14, earnings: 420,  rating: 4.7, lastOnline: '1d ago', avatar: '' },
            { id: 'd4', name: 'Hichem T.', active: true,  rides: 28, earnings: 760,  rating: 4.6, lastOnline: '5h ago', avatar: '' }, */
          ]);
        }
      } catch (err) {
        console.error('❌ Failed to load dashboard data:', err);
        // safe fallback so the page still renders
        setStats({ total: 6, completed: 2, cancelled: 2, pending: 2 });
        setHighlights([
     /*      { name: 'Beck Collier', amount: 750, trend: '+', avatar: '' },
          { name: 'Angelo Hume', amount: 542, trend: '+', avatar: '' },
          { name: 'Salim Melendez', amount: 874, trend: '+', avatar: '' }, */
        ]);
        setMonthlySeries([
        /*   { label: 'Jan', revenue: 1200 }, { label: 'Feb', revenue: 1600 },
          { label: 'Mar', revenue: 1500 }, { label: 'Apr', revenue: 2100 },
          { label: 'May', revenue: 2400 }, { label: 'Jun', revenue: 2200 }, */
        ]);
        setDrivers([
        /*   { id: 'd1', name: 'Amine R.',  active: true,  rides: 36, earnings: 980,  rating: 4.9, lastOnline: '2h ago', avatar: '' },
          { id: 'd3', name: 'Karim L.',  active: true,  rides: 41, earnings: 1220, rating: 4.8, lastOnline: '12m ago', avatar: '' },
          { id: 'd4', name: 'Hichem T.', active: true,  rides: 28, earnings: 760,  rating: 4.6, lastOnline: '5h ago', avatar: '' }, */
        ]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const filteredDrivers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers
      .filter(d => (onlyActive ? d.active : true))
      .filter(d => (q ? d.name?.toLowerCase().includes(q) : true));
  }, [drivers, search, onlyActive]);

  const donutData = {
    labels: ['Completed', 'Cancelled', 'Pending'],
    datasets: [
      {
        data: [stats.completed, stats.cancelled, stats.pending],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
        borderWidth: 0,
      },
    ],
  };

  const revenueLineData = {
    labels: monthlySeries.map(m => m.label),
    datasets: [
      {
        label: 'Revenue',
        data: monthlySeries.map(m => m.revenue || 0),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25,118,210,0.15)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <>
     

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container columnSpacing={2} rowSpacing={2}>
        {/* ORANGE: Bookings overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, ...ORANGE_BORDER }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Bookings Overview</Typography>
              <Stack direction="row" spacing={1}>
                <Chip size="small" label={`Total: ${stats.total || 0}`} />
                <Chip size="small" label={`Completed: ${stats.completed || 0}`} sx={{ bgcolor: '#e8f5e9' }} />
                <Chip size="small" label={`Pending: ${stats.pending || 0}`}   sx={{ bgcolor: '#fff8e1' }} />
                <Chip size="small" label={`Cancelled: ${stats.cancelled || 0}`} sx={{ bgcolor: '#ffebee' }} />
              </Stack>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut
                data={donutData}
                options={{
                  plugins: { legend: { position: 'bottom' } },
                  cutout: '65%',
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* GREEN: Highlights + Monthly stats */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, ...GREEN_BORDER }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Highlights</Typography>
              <Stack spacing={1.25}>
                {highlights.map((h, i) => (
                  <Stack key={i} direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={h.avatar || ''}>{h?.name?.[0]}</Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ lineHeight: 1.1 }}>{h.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {h.trend === '+' ? 'Up this month' : 'Stable'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body1" fontWeight={600}>{currency(h.amount)}</Typography>
                  </Stack>
                ))}
                {!highlights?.length && (
                  <Typography variant="body2" color="text.secondary">No highlights yet.</Typography>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, ...GREEN_BORDER }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Monthly Statistics</Typography>
                <Chip size="small" label={`Total ${currency(monthlySeries.reduce((a, b) => a + (b.revenue || 0), 0))}`} />
              </Stack>
              <Box sx={{ height: 220, mt: 1 }}>
                <Line
                  data={revenueLineData}
                  options={{
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false } },
                      y: { ticks: { callback: (v) => currency(v).replace('€', '') } }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Stack>
        </Grid>

        {/* BLUE: Drivers stats table */}
        <Grid item xs={12} >
          <Paper sx={{ p: 2, ...BLUE_BORDER }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Drivers</Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  size="small"
                  label="Search driver"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FormControlLabel
                  control={<Switch checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />}
                  label="Only active"
                />
              </Stack>
            </Stack>

            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <Th>Driver</Th>
                    <Th>Status</Th>
                    <Th>Rides</Th>
                    <Th>Earnings</Th>
                    <Th>Rating</Th>
                    <Th>Last Online</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((d) => (
                    <tr key={d.id}>
                      <Td>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar src={d.avatar || ''}>{d?.name?.[0]}</Avatar>
                          <Typography variant="body2">{d.name}</Typography>
                        </Stack>
                      </Td>
                      <Td>
                        <Chip
                          size="small"
                          label={d.active ? 'Active' : 'Offline'}
                          color={d.active ? 'success' : 'default'}
                          variant={d.active ? 'filled' : 'outlined'}
                        />
                      </Td>
                      <Td>{d.rides ?? 0}</Td>
                      <Td title={String(d.earnings)}>{currency(d.earnings)}</Td>
                      <Td>{d.rating?.toFixed ? d.rating.toFixed(1) : (d.rating ?? '-')}</Td>
                      <Td>{d.lastOnline || '-'}</Td>
                    </tr>
                  ))}
                  {!filteredDrivers.length && (
                    <tr>
                      <Td colSpan={6} style={{ textAlign: 'center', color: '#777' }}>
                        No drivers match your filters.
                      </Td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

/* simple table cell components */
const Th = ({ children }) => (
  <th style={{
    textAlign: 'left',
    padding: '10px 12px',
    fontWeight: 600,
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    whiteSpace: 'nowrap',
  }}>{children}</th>
);
const Td = ({ children, ...rest }) => (
  <td {...rest} style={{
    padding: '10px 12px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    verticalAlign: 'middle',
  }}>{children}</td>
);
