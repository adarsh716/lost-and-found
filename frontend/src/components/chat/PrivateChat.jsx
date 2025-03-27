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
  // Badge
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { AccountCircle } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPrivateMessages, sendPrivateMessage } from "../../api/auth";

const PrivateChat = () => {
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [currentUser] = useState({
    id: 0,
    fullName: "Alice Smith",
    avatar: "AS",
  });
  const [selectedProfile, setSelectedProfile] = useState(null);

  const { user } = useAuth();

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Adarsh Lakhanpal",
      avatar: "A",
      online: true,
      lastMessage: "At our office 3 ppl are infected...",
      timestamp: "MAR 13:35",
    },
    {
      id: 2,
      name: "John Doe",
      avatar: "J",
      online: false,
      lastMessage: "Hey, how are you?",
      timestamp: "MAR 12:30",
    },
    {
      id: 3,
      name: "Jane Smith",
      avatar: "J",
      online: true,
      lastMessage: "See you tomorrow!",
      timestamp: "MAR 11:15",
    },
  ]);

  const [messages, setMessages] = useState([]);

  const navigate = useNavigate();

  const handleDeleteChat = (userId) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    setMessages((prevMessages) => {
      const updatedMessages = { ...prevMessages };
      delete updatedMessages[userId];
      return updatedMessages;
    });
    if (selectedUser === userId) {
      setSelectedUser(null);
    }
  };

  const filteredMessages = (messages[selectedUser] || []).filter((msg) => {
    const matchesSearch = msg.text
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return searchQuery ? matchesSearch : true;
  });

  useEffect(() => {
    return () => {
      Object.values(messages).forEach((userMessages) => {
        userMessages.forEach((msg) => {
          if (msg.image) URL.revokeObjectURL(msg.image);
        });
      });
    };
  }, [messages]);

  const handleProfileClick = (user) => {
    setSelectedProfile(user); // Set the selected user's profile to show
    navigate(`/UserProfile/`); // Navigate to UserProfile page with the user's id
  };

  const handleCloseProfile = () => {
    setSelectedProfile(null); // Close the profile view
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  const handleSendMessage = async () => {
    console.log("selected user", selectedUser);

    if (message.trim() && selectedUser) {
      const newMessage = {
        text: message,
        senderId: user?.userId,
        recipientId: selectedUser,
      };

      const response = await sendPrivateMessage(newMessage);
      
      console.log(response);

      setMessage("");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && selectedUser) {
      const imageUrl = URL.createObjectURL(file);
      const newMessage = {
        id: Date.now(),
        user: currentUser.fullName,
        image: imageUrl,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCurrentUser: true,
      };
      setMessages((prev) => ({
        ...prev,
        [selectedUser]: [...prev[selectedUser], newMessage],
      }));
      e.target.value = null;
    }
  };

  const StyledMessage = styled(ListItem)(({ theme, iscurrentuser }) => ({
    flexDirection: iscurrentuser ? "row-reverse" : "row",
    alignItems: "flex-start",
    padding: theme.spacing(1),
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    "&:hover .delete-icon": {
      opacity: 1,
    },
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

  const handleDeleteMessage = (messageId) => {
    setMessages((prevMessages) => {
      const updatedMessages = { ...prevMessages };
      updatedMessages[selectedUser] = updatedMessages[selectedUser].filter(
        (msg) => msg.id !== messageId
      );
      return updatedMessages;
    });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return; 
      try {
        const messages = await getPrivateMessages(selectedUser,user?.userId);
        console.log("hello",messages);
        setMessages(messages);
      } catch (error) {
        console.error("Error fetching private messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser]); 

  return (
    <Container
      maxWidth={false}
      sx={{
        height: "91.5ddvh",
        display: "flex",
        p: 0,
        bgcolor: "background.default",
      }}
    >
      {JSON.stringify(messages)}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                backgroundColor: "background.paper",
              },
            }}
          />
        </Box>
        <List sx={{ overflowY: "auto", height: "calc(100vh - 200px)" }}>
          {user?.friends?.map((user) => (
            <ListItem
              key={user._id}
              button
              onClick={() => setSelectedUser(user._id)}
              selected={selectedUser === user._id}
              sx={{
                "&.Mui-selected": { backgroundColor: "rgba(0, 0, 0, 0.08)" },
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
              }}
            >
              <Box sx={{ position: "relative", mr: 2 }}>
                <Avatar sx={{ bgcolor: "black" }}>{user.avatar}</Avatar>
                {user.online && (
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
                  {user.friendName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.lastMessage}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {user.timestamp}
              </Typography>
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
            <Box
              sx={{
                p: 2,
                bgcolor: "background.paper",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #ddd",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick();
                  }}
                  sx={{ ml: 1 }}
                >
                  <AccountCircle
                    sx={{ mr: 1, color: "text.primary", height: 30, width: 30 }}
                  />

                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    {
                      user?.friends?.find((u) => u._id === selectedUser)
                        ?.friendName
                    }
                  </Typography>
                </IconButton>
              </Box>
              <TextField
                variant="outlined"
                placeholder="Search messages..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: 240,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    backgroundColor: "background.paper",
                  },
                }}
              />
            </Box>

            <List
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                bgcolor: "background.default",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-track": { background: "#f0f0f0" },
                "&::-webkit-scrollbar-thumb": { background: "#888" },
              }}
            >
              {filteredMessages.map((msg) => {
                const isCurrentUser = msg.isCurrentUser;

                return (
                  <StyledMessage
                    key={msg.id}
                    iscurrentuser={isCurrentUser ? 1 : 0}
                  >
                    <MessageBubble
                      iscurrentuser={isCurrentUser ? 1 : 0}
                      sx={{
                        position: "relative",
                        "&:hover .delete-button": {
                          opacity: 1,
                        },
                      }}
                    >
                      {!isCurrentUser && (
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {msg.user}
                        </Typography>
                      )}
                      {msg.text && (
                        <Typography variant="body1">{msg.text}</Typography>
                      )}
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

                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          color: "#fff",
                          opacity: 0,
                          transition: "opacity 0.2s ease-in-out",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                        }}
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="delete-button"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </MessageBubble>
                  </StyledMessage>
                );
              })}
            </List>

            <Box
              sx={{
                p: 2,
                bgcolor: "#000",
                boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.3)",
                borderTop: "1px solid rgba(255,255,255,0.1)",
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
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.6)",
                      },
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
    </Container>
  );
};

export default PrivateChat;
