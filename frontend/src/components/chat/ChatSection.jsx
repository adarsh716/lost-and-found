import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Avatar,
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
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
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
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false); 

  const { user } = useAuth();

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  // Update these useEffect hooks
useEffect(() => {
  initializeChat();
  return () => {
    socketServices.disconnect();
  };
}, []); // Run only once on mount

useEffect(() => {
  // Only auto-scroll if user is at bottom
  if (!isUserScrolledUp) {
    scrollToBottom();
  }
}, [messages]);
  const initializeChat = async () => {
    try {
      socketServices.connect();

      socketServices.on("newCommunityMessage", handleNewMessage);

      const fetchedMessages = await getCommunityMessages();
      setMessages([...fetchedMessages]);

      setIsUserScrolledUp(false); // Reset scroll flag when sending a new message

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

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const messageData = {
        text: message.trim(),
        userId: user.userId,
        username: user.fullName, 
        timestamp: new Date().toISOString(),
      };
      const sentMessage = await sendCommunityMessage(messageData);

      socketServices.emit("sendCommunityMessage", sentMessage);

      setMessages((prev) => [...prev, sentMessage]);

      setMessage("");
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      console.log(base64);
      if(base64){
        const messageData = {
          image: base64,
          userId: user.userId,
          username: user.fullName, 
        };
        console.log("hello");
        const sentMessage = await sendCommunityMessage(messageData);
        socketServices.emit("sendCommunityMessage", sentMessage);
      }
    } catch (err) {
      setError("Failed to upload image");
    }
    e.target.value = null;
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = msg.text
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return searchQuery ? matchesSearch : true;
  });

  useEffect(() => {
    return () => {
      messages.forEach((msg) => {
        if (msg.image) URL.revokeObjectURL(msg.image);
      });
    };
  }, [messages]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  const handleNavigateRoute = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  const StyledMessage = styled(ListItem)(({ theme, iscurrentuser }) => ({
    flexDirection: iscurrentuser ? "row-reverse" : "row",
    alignItems: "flex-start",
    padding: theme.spacing(1),
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  }));

  const MessageBubble = styled(Paper)(({ theme, iscurrentuser }) => ({
    maxWidth: "70%",
    padding: theme.spacing(1.5, 2),
    backgroundColor: iscurrentuser ? "#000" : "#fff",
    color: iscurrentuser ? "#fff" : "#000",
    borderRadius: iscurrentuser ? "20px 4px 20px 20px" : "4px 20px 20px 20px",
    boxShadow: iscurrentuser
      ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.4), 0 0 10px rgba(255, 255, 255, 0.3)"
      : "0 4px 20px rgba(0, 0, 0, 0.1), 0 0 15px rgba(0, 0, 0, 0.15)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    cursor: "pointer",
  }));

  return (
    <Container
      maxWidth={false}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 0,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: { sm: "space-between" },
          borderBottom: "1px solid #ddd",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", mb: { xs: 1, sm: 0 } }}
        >
          <ForumIcon sx={{ mr: 1, color: "text.primary" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Community Chat
          </Typography>
        </Box>

        <TextField
          variant="outlined"
          placeholder="Search messages..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: { xs: "50%", sm: "240px" },
            alignSelf: { xs: "flex-end", sm: "center" },
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              backgroundColor: "background.paper",
              "& fieldset": {
                borderColor: "rgba(0, 0, 0, 0.23)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(0, 0, 0, 0.5)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
                borderWidth: "1px",
              },
            },
          }}
        />
      </Box>

      <List
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "none",
          bgcolor: "background.default",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { background: "#f0f0f0" },
          "&::-webkit-scrollbar-thumb": { background: "#888" },
        }}
      >
        <Box sx={{ textAlign: "center", my: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            3 MAR
          </Typography>
        </Box>

        {filteredMessages.map((msg) => {
  const isCurrentUser = msg.userId === user.userId;

  return (
    <StyledMessage
      key={msg._id || msg.id}
      iscurrentuser={isCurrentUser ? 1 : 0}
      onClick={() => handleNavigateRoute(msg.userId)}
    >
      <MessageBubble iscurrentuser={isCurrentUser ? 1 : 0}>
        {/* Show username only for messages from other users */}
        {!isCurrentUser && msg.username && (
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 0.5 }}
            onClick={() => handleNavigateRoute(msg.userId)}
          >
            {msg.username}
          </Typography>
        )}

        {/* Handle text message */}
        {msg.text && (
          <Typography
            variant="body1"
            onClick={() => setReplyToMessage(msg)}
            sx={{ whiteSpace: "pre-line" }} // Ensures line breaks are maintained
          >
            {msg.text}
          </Typography>
        )}

        {/* Handle image message */}
        {msg.image && (
          <img
            src={msg.image}
            alt="Uploaded content"
            style={{
              maxWidth: "100%",
              maxHeight: "40vh",
              borderRadius: "12px",
              marginTop: msg.text ? "8px" : 0,
              cursor: "pointer",
            }}
            onClick={() => handleImageClick(msg.image)}
          />
        )}

        {/* Timestamp */}
        {msg.timestamp && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "right",
              mt: 0.5,
              color: isCurrentUser
                ? "rgba(255,255,255,0.7)"
                : "text.secondary",
            }}
          >
            {new Date(msg.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        )}
      </MessageBubble>
    </StyledMessage>
  );
})}


        <div ref={messagesEndRef} />
      </List>
      
      {replyToMessage && (
        <div style={{ background: "#f1f1f1", padding: "5px", marginBottom: "5px" }}>
          Replying to: {replyToMessage.text}{" "}
          <button onClick={() => setReplyToMessage(null)}>✖</button>
        </div>
      )}

      <Backdrop
        sx={{
          zIndex: 1300,
          background: "rgba(0, 0, 0, 0.9)",
          backdropFilter: "blur(8px)",
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
              animation: "scaleUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <IconButton
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                color: "white",
                background: "rgba(0, 0, 0, 0.5)",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.2)",
                },
              }}
              onClick={handleCloseImage}
            >
              <CloseIcon />
            </IconButton>
            <img
              src={selectedImage}
              alt="Fullscreen content"
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                borderRadius: "8px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
              }}
            />
          </Box>
        </Fade>
      </Backdrop>

      <Box
        sx={{
          p: 2,
          bgcolor: "#000",
          boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.3)",
          position: "sticky",
          bottom: 0,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px 8px 0px 0px",
        }}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <IconButton
            sx={{
              color: "#fff",
              "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
            }}
            onClick={() => fileInputRef.current.click()}
          >
            <AddPhotoAlternateIcon fontSize="medium" />
          </IconButton>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "#fff",
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                "&.Mui-focused fieldset": { borderColor: "#fff" },
              },
            }}
          />

          <IconButton
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{
              bgcolor: "#fff",
              color: "#000",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: "#fff",
                transform: "scale(1.15) rotate(-8deg)",
                boxShadow: "0 0 24px rgba(255,255,255,0.6)",
              },
              "&:disabled": {
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                transform: "scale(0.9)",
              },
              p: 1.5,
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(255,255,255,0.3)",
            }}
          >
            <SendIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>
      <style jsx global>{`
        @keyframes scaleUp {
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