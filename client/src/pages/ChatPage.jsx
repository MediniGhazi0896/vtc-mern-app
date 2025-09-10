import { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import socket from "../services/socket";
import { io } from "socket.io-client";



const ChatPage = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

useEffect(() => {
  fetchMessages();

  if (!socket.connected) {
    console.log("🔌 Connecting socket...");
    socket.connect();
  }

  socket.emit("joinRoom", bookingId);

  socket.on("chatMessage", (msg) => {
    setMessages((prev) => [...prev, msg]);
    scrollToBottom();
  });

  return () => {
    socket.off("chatMessage");
    socket.disconnect();
  };
}, [bookingId]);



  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${bookingId}`);
      setMessages(res.data);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      alert("❌ Failed to load chat");
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const res = await API.post("/messages", {
        bookingId,
        content: input,
      });
      setMessages((prev) => [...prev, res.data]);
      setInput("");
      scrollToBottom();
    } catch (err) {
      alert("❌ Failed to send message");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: "auto" }}>
      <Typography variant="h6" gutterBottom>
        💬 Booking Chat
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Messages List */}
      <Box
        sx={{
          maxHeight: 400,
          overflowY: "auto",
          mb: 2,
          px: 1,
          display: "flex",
          flexDirection: "column",
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
          messages.map((msg) => {
            const isMine = msg.sender._id === user?.id;
            return (
              <Box
                key={msg._id}
                sx={{
                  alignSelf: isMine ? "flex-end" : "flex-start",
                  backgroundColor: isMine ? "#1976d2" : "#eeeeee",
                  color: isMine ? "white" : "black",
                  borderRadius: 2,
                  p: 1.2,
                  maxWidth: "70%",
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {msg.sender.name}
                </Typography>
                <Typography variant="body2">{msg.content}</Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", textAlign: "right", opacity: 0.7 }}
                >
                  {formatTime(msg.createdAt)}
                </Typography>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef}></div>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Input */}
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
