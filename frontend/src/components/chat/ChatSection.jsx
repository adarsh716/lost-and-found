import React, { useState, useRef, useEffect, useCallback } from "react";
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
import SearchIcon from "@mui/icons-material/Search";
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
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  const handleNewMessage = useCallback((newMessage) => {
    console.log('Received new message:', newMessage);
  
    if (newMessage.userId === user?.userId) {
      console.log('Ignoring own message from socket');
      return;
    }
    
    setMessages((prevMessages) => {
      const messagesArray = Array.isArray(prevMessages) ? prevMessages : [];
      
      const messageExists = messagesArray.some(msg => 
        msg._id === newMessage._id || 
        (msg.text === newMessage.text && 
         msg.userId === newMessage.userId && 
         Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt)) < 5000) 
      );
      
      if (messageExists) {
        console.log('Message already exists, skipping');
        return messagesArray;
      }
      
      console.log('Adding new message to state');
      return [...messagesArray, newMessage];
    });
  }, [user?.userId]);

  const handleSocketConnect = useCallback(() => {
    console.log('Socket connected');
    setIsConnected(true);
  }, []);

  const handleSocketDisconnect = useCallback(() => {
    console.log('Socket disconnected');
    setIsConnected(false);
  }, []);

  const handleSocketError = useCallback((error) => {
    console.error('Socket error:', error);
    setError('Connection error. Trying to reconnect...');
  }, []);

  useEffect(() => {

    if (user?.userId) {
      initializeChat();
    }
    
    return () => {
      console.log('Cleaning up socket connection');
      socketServices.off('newCommunityMessage', handleNewMessage);
      socketServices.off('connect', handleSocketConnect);
      socketServices.off('disconnect', handleSocketDisconnect);
      socketServices.off('error', handleSocketError);
      socketServices.disconnect();
    };
  }, [user?.userId]); // Re-run when user changes

  useEffect(() => {
    if (!isUserScrolledUp) scrollToBottom();
  }, [messages, isUserScrolledUp]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('Initializing chat...');

      const response = await getCommunityMessages();
      console.log('API Response:', response);
    
      let fetchedMessages = [];
      if (Array.isArray(response)) {
        fetchedMessages = response;
      } else if (response && Array.isArray(response.messages)) {
        fetchedMessages = response.messages;
      } else if (response && Array.isArray(response.data)) {
        fetchedMessages = response.data;
      } else {
        console.warn('Unexpected API response format:', response);
        fetchedMessages = [];
      }
      
      console.log('Processed messages:', fetchedMessages);
      setMessages(fetchedMessages);

      await socketServices.connect();

      socketServices.on('connect', handleSocketConnect);
      socketServices.on('disconnect', handleSocketDisconnect);
      socketServices.on('error', handleSocketError);
      socketServices.on('newCommunityMessage', handleNewMessage);
 
      socketServices.emit('joinCommunityChat', { userId: user?.userId });
      
      setLoading(false);

      setTimeout(() => scrollToBottom(), 100);
      
    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setError(`Failed to load messages: ${err.message}`);
      setLoading(false);
      setMessages([]);
    }
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
    if (!isConnected) {
      setError('Not connected to chat. Please wait...');
      return;
    }

    const messageText = message.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    try {

      setMessage("");
      const currentImagePreview = imagePreview;
      const currentImageFile = imageFile;
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Prepare form data
      const formData = new FormData();
      if (messageText) formData.append("text", messageText);
      formData.append("userId", user.userId);
      formData.append("username", user.fullName);
      if (currentImageFile) {
        formData.append("image", currentImageFile);
      }

      console.log('Sending message to server...');
      
      // Send message to server first
      const sentMessage = await sendCommunityMessage(formData);
      console.log('Message sent successfully:', sentMessage);
      
      // Add the sent message to local state
      setMessages(prev => {
        const messagesArray = Array.isArray(prev) ? prev : [];
        
        // Check if message already exists
        const messageExists = messagesArray.some(msg => 
          msg._id === sentMessage._id ||
          (msg.text === sentMessage.text && 
           msg.userId === sentMessage.userId &&
           Math.abs(new Date(msg.createdAt) - new Date(sentMessage.createdAt)) < 5000)
        );
        
        if (messageExists) {
          console.log('Message already exists in state');
          return messagesArray;
        }
        
        return [...messagesArray, sentMessage];
      });

      
      scrollToBottom();
      setError("");
      
    } catch (err) {
      console.error("Error sending message:", err);
   
      setMessage(messageText);
      // if (currentImagePreview) setImagePreview(currentImagePreview);
      // if (currentImageFile) setImageFile(currentImageFile);
      
      setError("Failed to send message. Please try again.");
    }
  };

  const handleScroll = () => {
    const list = messagesEndRef.current?.parentElement;
    if (list) {
      const isScrolledUp = list.scrollTop + list.clientHeight < list.scrollHeight - 10;
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

  const filteredMessages = Array.isArray(messages) ? messages.filter((msg) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (msg.text && msg.text.toLowerCase().includes(searchLower)) ||
      (msg.username && msg.username.toLowerCase().includes(searchLower))
    );
  }) : [];

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
    opacity: (props) => props.isOptimistic ? 0.7 : 1,
  }));

  // Connection status indicator
  const ConnectionStatus = () => (
    <Box sx={{ 
      position: 'absolute', 
      top: 8, 
      right: 8, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5,
      fontSize: '0.75rem',
      color: isConnected ? 'green' : 'red'
    }}>
      <Box sx={{ 
        width: 8, 
        height: 8, 
        borderRadius: '50%', 
        bgcolor: isConnected ? 'green' : 'red' 
      }} />
      {isConnected ? 'Connected' : 'Disconnected'}
    </Box>
  );

  return (
    <Container maxWidth={false} sx={{ height: "100%", display: "flex", flexDirection: "column", p: 0 }}>
      <Box sx={{ p: 2, bgcolor: "background.paper", borderBottom: "1px solid #ddd", position: 'relative' }}>
        <ConnectionStatus />
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
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>

      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Typography>Loading messages...</Typography>
          </Box>
        ) : filteredMessages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No messages found matching your search.' : 'No messages yet. Start the conversation!'}
            </Typography>
          </Box>
        ) : (
          filteredMessages.map((msg, index) => {
            const isCurrentUser = msg.userId === user.userId;
            return (
              <StyledMessage key={`${msg._id}-${index}`} iscurrentuser={isCurrentUser ? 1 : 0}>
                <MessageBubble 
                  iscurrentuser={isCurrentUser ? 1 : 0}
                  isOptimistic={msg.isOptimistic}
                >
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
                    {msg.isOptimistic && <span style={{ marginLeft: 4 }}>⏳</span>}
                  </Typography>
                </MessageBubble>
              </StyledMessage>
            );
          })
        )}
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
              placeholder={isConnected ? "Write a message..." : "Connecting..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isConnected}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", bgcolor: "rgba(255,255,255,0.12)", color: "#fff" } }}
            />
            <IconButton 
              onClick={() => fileInputRef.current?.click()} 
              sx={{ color: "#fff" }}
              disabled={!isConnected}
            >
              <AddPhotoAlternateIcon />
            </IconButton>
            <IconButton 
              type="submit" 
              disabled={(!message.trim() && !imageFile) || !isConnected} 
              sx={{ bgcolor: "#fff", color: "#000", "&:disabled": { bgcolor: "rgba(255,255,255,0.3)" } }}
            >
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