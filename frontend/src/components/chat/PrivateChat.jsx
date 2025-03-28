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
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPrivateMessages, sendPrivateMessage } from "../../api/auth";

const PrivateChat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [messages, setMessages] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!isUserScrolledUp) scrollToBottom();
  }, [messages, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      console.error("Please select an image file");
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
    if (!selectedUser) return;
    if (!message.trim() && !imageFile) return;

    try {
      const formData = new FormData();
      formData.append("text", message.trim());
      formData.append("senderId", user.userId);
      formData.append("recipientId", selectedUser);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const sentMessage = await sendPrivateMessage(formData);

      setMessages(prevMessages => {
        const userMessages = prevMessages[selectedUser] || [];
        const updatedMessages = [
          ...userMessages,
          {
            ...sentMessage,
            isCurrentUser: true,
            id: sentMessage._id || Date.now()
          }
        ];
        return {
          ...prevMessages,
          [selectedUser]: updatedMessages
        };
      });

      setMessage("");
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const fetchedMessages = await getPrivateMessages(selectedUser, user?.userId);

        const normalizedMessages = fetchedMessages.map(msg => ({
          ...msg,
          isCurrentUser: msg.senderId === user?.userId,
          id: msg._id || Date.now()
        }));

        setMessages(prevMessages => ({
          ...prevMessages,
          [selectedUser]: normalizedMessages
        }));
      } catch (error) {
        console.error("Error fetching private messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser, user?.userId]);

  const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);
  const handleCloseImage = () => setSelectedImage(null);

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

  const filteredMessages = selectedUser
  ? (messages[selectedUser] || []).filter((msg) => {
      const searchLower = searchQuery.toLowerCase();
      // Show all messages when search is empty
      if (searchLower === '') return true;
      // Filter messages with matching text when searching
      return msg.text?.toLowerCase().includes(searchLower);
    })
  : [];

const filteredFriends = user?.friends?.filter((friend) => 
  friend.friendName.toLowerCase().includes(userSearchQuery.toLowerCase())
) || [];

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
    <Container maxWidth={false} sx={{ height: "100%", display: "flex",    flexDirection: { xs: "column", sm: "row" }, p: 0 }}>
      {/* Sidebar with User List */}
      <Box
        sx={{
          width: { xs: selectedUser ? 0 : "100%", sm: 400 },
          flexShrink: 0,
          borderRight: "1px solid #ddd",
          overflow: "hidden",
          transition: "width 0.3s ease",
          display: { xs: selectedUser ? "none" : "block", sm: "block" },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #ddd" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "action.active", mr: 1 }} />
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.05)",
              },
            }}
          />
        </Box>
        <List sx={{ overflowY: "auto", height: "calc(100vh - 200px)" }}>
          {filteredFriends.map((friend) => (
            <ListItem
              key={friend._id}
              button
              onClick={() => setSelectedUser(friend.friendId)}
              selected={selectedUser === friend.friendId}
              sx={{
                "&.Mui-selected": { backgroundColor: "rgba(0, 0, 0, 0.08)" },
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
              }}
            >
              <Box sx={{ position: "relative", mr: 2 }}>
                <Avatar sx={{ bgcolor: "black" }}>{friend.avatar}</Avatar>
                {friend.online && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      bgcolor: "green",
                      borderRadius: "50%",
                      border: "2px solid white",
                    }}
                  />
                )}
              </Box>
              <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
                <Typography variant="subtitle1" fontWeight="600">
                  {friend.friendName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {friend.lastMessage}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Chat Area */}
      <Box
        sx={{
          flexGrow: 1,
          height: "91.5dvh",
          display: { xs: selectedUser ? "flex" : "none", sm: "flex" },
          flexDirection: "column",
        }}
      >
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: "background.paper", 
                borderBottom: "1px solid #ddd", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between" 
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {user?.friends?.find((f) => f.friendId === selectedUser)?.friendName}
              </Typography>
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
                  },
                }}
              />
            </Box>

            <List sx={{ flexGrow: 1, overflowY: "auto" }}>
              {filteredMessages.map((msg) => (
                
                <StyledMessage 
                  key={msg.id} 
                  iscurrentuser={msg.isCurrentUser ? 1 : 0}
                >
                  <MessageBubble iscurrentuser={msg.isCurrentUser ? 1 : 0}>
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Uploaded content"
                        style={{ 
                          maxWidth: "100%", 
                          maxHeight: "40vh", 
                          borderRadius: "12px", 
                          cursor: "pointer" 
                        }}
                        onClick={() => handleImageClick(msg.image)}
                      />
                    )}
                    {msg.text && <Typography variant="body1">{msg.text}</Typography>}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: "block", 
                        textAlign: "right", 
                        mt: 0.5 
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </Typography>
                  </MessageBubble>
                </StyledMessage>
              ))}
              <div ref={messagesEndRef} />
            </List>

            {/* Message Input Area */}
            <Box sx={{ p: 2, bgcolor: "#000", position: "sticky", bottom: 0 }}>
              {imagePreview && (
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ position: "relative" }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        width: 80, 
                        height: 80, 
                        objectFit: "cover", 
                        borderRadius: 8 
                      }} 
                    />
                    <IconButton
                      onClick={removeImage}
                      sx={{ 
                        position: "absolute", 
                        top: -8, 
                        right: -8, 
                        bgcolor: "rgba(0,0,0,0.5)", 
                        color: "white" 
                      }}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )}

              <form onSubmit={handleSendMessage}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{ display: "none" }} 
                  onChange={handleImageChange} 
                />
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Write a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ 
                      "& .MuiOutlinedInput-root": { 
                        borderRadius: "16px", 
                        bgcolor: "rgba(255,255,255,0.12)", 
                        color: "#fff" 
                      } 
                    }}
                  />
                  <IconButton 
                    onClick={() => fileInputRef.current?.click()} 
                    sx={{ color: "#fff" }}
                  >
                    <AddPhotoAlternateIcon />
                  </IconButton>
                  <IconButton 
                    type="submit" 
                    disabled={!message.trim() && !imageFile} 
                    sx={{ bgcolor: "#fff", color: "#000" }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </form>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a user to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      {/* Image Backdrop */}
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
    </Container>
  );
};

export default PrivateChat;