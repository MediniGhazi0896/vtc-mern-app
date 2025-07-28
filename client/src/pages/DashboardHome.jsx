import { useEffect, useState } from 'react';
import { Typography, Grid, Paper } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import API from '../services/api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardHome = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, cancelled: 0 , pending: 0 });

  useEffect(() => {
    API.get('/bookings/stats')
      .then(res => setStats(res.data))
      .catch(() => alert('Failed to load stats'));
  }, []);

  const chartData = {
    labels: ['Completed', 'Cancelled', 'Pending'],
    datasets: [{
      data: [
        stats.completed,
        stats.cancelled,
        stats.total - stats.completed - stats.cancelled
      ],
      backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
    }]
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>📊 Dashboard</Typography>
      <Grid container spacing={3}>
        {[
          { title: 'Total Bookings', value: stats.total },
          { title: 'Completed Rides', value: stats.completed },
          { title: 'Cancelled Rides', value: stats.cancelled },
          { title: 'Pending Rides', value: stats.pending }
        ].map((item, idx) => (
          <Grid item xs={12} sm={4} key={idx}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="subtitle2">{item.title}</Typography>
              <Typography variant="h6">{item.value}</Typography>
            </Paper>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6">Ride Status</Typography>
            <Doughnut data={chartData} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardHome;
