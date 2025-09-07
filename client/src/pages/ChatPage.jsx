import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { getSocket, disconnectSocket } from "../services/socket";
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

useEffect(() => {
  fetchMessages();

  const socket = getSocket();
  socket.connect();

  socket.emit("joinRoom", bookingId);

  socket.on("chatMessage", (msg) => {
    setMessages((prev) => [...prev, msg]);
    scrollToBottom();
  });

  return () => {
    socket.off("chatMessage");
    disconnectSocket();
  };
}, [bookingId]);


  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${bookingId}`);
      setMessages(res.data);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      alert('❌ Failed to load chat');
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const msg = {
      bookingId,
      sender: user.id,
      message: input,
    };

    // send via socket
    socketRef.current.emit('chatMessage', msg);

    // also save via REST (fallback / persistence)
    try {
      await API.post(`/messages/${bookingId}`, { message: input });
    } catch (err) {
      console.error('❌ Failed to persist message', err);
    }

    setInput('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        💬 Booking Chat
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          maxHeight: 400,
          overflowY: 'auto',
          mb: 2,
          px: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : messages.length === 0 ? (
          <Typography variant="body2" align="center">
            No messages yet.
          </Typography>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg._id || Math.random()}
              sx={{
                alignSelf: msg.sender._id === user.id ? 'flex-end' : 'flex-start',
                backgroundColor:
                  msg.sender._id === user.id ? '#e3f2fd' : '#eeeeee',
                borderRadius: 2,
                p: 1.2,
                maxWidth: '70%',
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {msg.sender.name}
              </Typography>
              <Typography variant="body2">{msg.message}</Typography>
              <Typography
                variant="caption"
                sx={{ display: 'block', textAlign: 'right' }}
              >
                {formatTime(msg.createdAt || new Date())}
              </Typography>
            </Box>
          ))
        )}
        <div ref={messagesEndRef}></div>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box display="flex" gap={2}>
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatPage;
