// src/pages/HelpPage.jsx
import { useState } from 'react';
import {
  Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails,
  TextField, Button, Grid, Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import API from '../services/api';

const faqs = [
  {
    q: 'How do I change my password?',
    a: 'Go to Settings → Change Password. Enter your current password, then your new password and confirm.'
  },
  {
    q: 'How can I track my ride?',
    a: 'Open My Bookings, select a booking, and you’ll see the current status and driver assignment.'
  },
  {
    q: 'How do I contact my driver?',
    a: 'Once assigned, the booking row shows a contact button (phone/WhatsApp) if the driver shares it.'
  },
];

const HelpPage = () => {
  const [ticket, setTicket] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const submitTicket = async () => {
    if (!ticket.subject || !ticket.message) return alert('Please fill subject and message');
    setSending(true);
    try {
      await API.post('/support/tickets', ticket); // 👈 backend: store ticket; notify admin
      alert('Thanks! Your request was submitted.');
      setTicket({ subject: '', message: '' });
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Help & Support</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>FAQs</Typography>
            {faqs.map((f, i) => (
              <Accordion key={i} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{f.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{f.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Contact Support</Typography>
            <Stack spacing={2}>
              <TextField
                label="Subject"
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                fullWidth
              />
              <TextField
                label="Message"
                value={ticket.message}
                onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                multiline
                minRows={5}
                fullWidth
              />
              <Button variant="contained" onClick={submitTicket} disabled={sending}>
                {sending ? 'Sending…' : 'Submit Ticket'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.open('https://wa.me/<YOUR_SUPPORT_NUMBER>', '_blank')}
              >
                WhatsApp Support
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HelpPage;
