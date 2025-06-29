// src/pages/DashboardHome.jsx
import { Typography, Grid, Paper } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
const DashboardHome = () => {
  const stats = [
    { title: 'Total Bookings', value: 12 },
    { title: 'Completed Rides', value: 9 },
    { title: 'Cancelled Rides', value: 3 },
  ];

  return (
    <>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        {stats.map((item, idx) => (
          <Grid item xs={12} sm={4} key={idx}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="subtitle2">{item.title}</Typography>
              <Typography variant="h6">{item.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

const BookingStats = () => {
  const data = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [{
      data: [10, 2, 3],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
    }]
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6">Ride Status</Typography>
      <Doughnut data={data} />
    </Paper>
  );
};

export default DashboardHome;

