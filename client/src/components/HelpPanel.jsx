import { useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, Divider, Accordion,
  AccordionSummary, AccordionDetails, TextField, Button, Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import API from '../services/api';

const faqs = [
  { q: 'How do I change my password?',
    a: 'Open Settings → Change Password, then save.' },
  { q: 'How can I track my ride?',
    a: 'Go to Bookings, open the booking details to view the status and driver.' },
  { q: 'How do I contact my driver?',
    a: 'Once assigned, the booking row shows a contact/chat action.' },
];

export default function HelpPanel({ open, onClose }) {
  const [ticket, setTicket] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const submitTicket = async () => {
    if (!ticket.subject || !ticket.message) return alert('Fill subject & message');
    setSending(true);
    try {
      await API.post('/support/tickets', ticket);
      alert('Ticket submitted — we’ll get back to you.');
      setTicket({ subject: '', message: '' });
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to submit ticket');
    } finally { setSending(false); }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 480 } } }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Help & Support</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>FAQs</Typography>
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

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>Contact Support</Typography>
        <Stack spacing={2}>
          <TextField label="Subject" value={ticket.subject}
            onChange={(e)=>setTicket({...ticket, subject:e.target.value})} />
          <TextField label="Message" value={ticket.message}
            onChange={(e)=>setTicket({...ticket, message:e.target.value})}
            multiline minRows={4} />
          <Button variant="contained" onClick={submitTicket} disabled={sending}>
            {sending ? 'Sending…' : 'Submit Ticket'}
          </Button>
          <Button variant="outlined"
            onClick={()=>window.open('https://wa.me/<YOUR_SUPPORT_NUMBER>', '_blank')}>
            WhatsApp Support
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
