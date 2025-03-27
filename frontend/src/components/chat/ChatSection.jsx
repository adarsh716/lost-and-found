import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  List,
  ListItem,
  Backdrop,
  Fade,
  TextField,
  IconButton,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ForumIcon from "@mui/icons-material/Forum";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search"; // Add SearchIcon
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import socketServices from "../../services/socketServices";
import { getCommunityMessages, sendCommunityMessage } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const CommunityChat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    initializeChat();
    return () => socketServices.disconnect();
  }, []);

  useEffect(() => {
    if (!isUserScrolledUp) scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      socketServices.connect();
      socketServices.on("newCommunityMessage", handleNewMessage);
      const fetchedMessages = await getCommunityMessages();
      setMessages([...fetchedMessages]);
      setLoading(false);
      scrollToBottom();
    } catch (err) {
      setError("Failed to load messages");
      setLoading(false);
    }
  };

  const handleNewMessage = (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;

    try {
      const formData = new FormData();
      formData.append("text", message.trim());
      formData.append("userId", user.userId);
      formData.append("username", user.fullName);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const sentMessage = await sendCommunityMessage(formData);
      socketServices.emit("sendCommunityMessage", sentMessage);
      setMessages((prev) => [...prev, sentMessage]);

      setMessage("");
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  const handleScroll = () => {
    const list = messagesEndRef.current?.parentElement;
    if (list) {
      const isScrolledUp = list.scrollTop + list.clientHeight < list.scrollHeight;
      setIsUserScrolledUp(isScrolledUp);
    }
  };

  useEffect(() => {
    const list = messagesEndRef.current?.parentElement;
    if (list) {
      list.addEventListener("scroll", handleScroll);
      return () => list.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Enhanced filtering logic for search
  const filteredMessages = messages.filter((msg) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (msg.text && msg.text.toLowerCase().includes(searchLower)) ||
      (msg.username && msg.username.toLowerCase().includes(searchLower))
    );
  });

  const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);
  const handleCloseImage = () => setSelectedImage(null);
  const handleNavigateRoute = (userId) => navigate(`/user-profile/${userId}`);

  const StyledMessage = styled(ListItem)(({ theme, iscurrentuser }) => ({
    flexDirection: iscurrentuser ? "row-reverse" : "row",
    alignItems: "flex-start",
    padding: theme.spacing(1),
  }));

  const MessageBubble = styled(Paper)(({ theme, iscurrentuser }) => ({
    maxWidth: "70%",
    padding: theme.spacing(1.5, 2),
    backgroundColor: iscurrentuser ? "#000" : "#fff",
    color: iscurrentuser ? "#fff" : "#000",
    borderRadius: iscurrentuser ? "20px 4px 20px 20px" : "4px 20px 20px 20px",
    boxShadow: iscurrentuser ? "0 4px 20px rgba(0, 0, 0, 0.3)" : "0 4px 20px rgba(0, 0, 0, 0.1)",
  }));

  return (
    <Container maxWidth={false} sx={{ height: "100%", display: "flex", flexDirection: "column", p: 0 }}>
      <Box sx={{ p: 2, bgcolor: "background.paper", borderBottom: "1px solid #ddd" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ForumIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Community Chat</Typography>
          </Box>
          <TextField
            variant="outlined"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              ),
            }}
            sx={{
              width: { xs: "100%", sm: "300px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                "&:hover fieldset": { borderColor: "rgba(0, 0, 0, 0.5)" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
          />
        </Box>
      </Box>

      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {filteredMessages.map((msg) => {
          const isCurrentUser = msg.userId === user.userId;
          return (
            <StyledMessage key={msg._id} iscurrentuser={isCurrentUser ? 1 : 0}>
              <MessageBubble iscurrentuser={isCurrentUser ? 1 : 0}>
                {!isCurrentUser && msg.username && (
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 0.5, cursor: "pointer" }}
                    onClick={() => handleNavigateRoute(msg.userId)}
                  >
                    {msg.username}
                  </Typography>
                )}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded content"
                    style={{ maxWidth: "100%", maxHeight: "40vh", borderRadius: "12px", cursor: "pointer" }}
                    onClick={() => handleImageClick(msg.image)}
                  />
                )}
                {msg.text && <Typography variant="body1">{msg.text}</Typography>}
                <Typography variant="caption" sx={{ display: "block", textAlign: "right", mt: 0.5 }}>
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </Typography>
              </MessageBubble>
            </StyledMessage>
          );
        })}
        <div ref={messagesEndRef} />
      </List>

      <Box sx={{ p: 2, bgcolor: "#000", position: "sticky", bottom: 0 }}>
        {imagePreview && (
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ position: "relative" }}>
              <img src={imagePreview} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
              <IconButton
                onClick={removeImage}
                sx={{ position: "absolute", top: -8, right: -8, bgcolor: "rgba(0,0,0,0.5)", color: "white" }}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        <form onSubmit={handleSendMessage}>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Write a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "rgba(255,255,255,0.12)", color: "#fff" } }}
            />
            <IconButton onClick={() => fileInputRef.current?.click()} sx={{ color: "#fff" }}>
              <AddPhotoAlternateIcon />
            </IconButton>
            <IconButton type="submit" disabled={!message.trim() && !imageFile} sx={{ bgcolor: "#fff", color: "#000" }}>
              <SendIcon />
            </IconButton>
          </Box>
        </form>
      </Box>

      {/* Enhanced Backdrop for Large Image View */}
      <Backdrop
        sx={{
          zIndex: 1300,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        open={!!selectedImage}
        onClick={handleCloseImage}
      >
        <Fade in={!!selectedImage} timeout={300}>
          <Box
            sx={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
              animation: "zoomIn 0.3s ease-in-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Fullscreen view"
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "12px",
              }}
            />
            <IconButton
              onClick={handleCloseImage}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Fade>
      </Backdrop>

      <style jsx global>{`
        @keyframes zoomIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Container>
  );
};

export default CommunityChat;