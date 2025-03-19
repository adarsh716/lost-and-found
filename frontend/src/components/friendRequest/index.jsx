import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Container,
  IconButton,
  List,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  Tooltip,
  Chip,
  Badge
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Search,
  Delete,
  Done,
  Close,
  MarkEmailRead,
  Email
} from '@mui/icons-material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { getFriendRequests, acceptFriendRequest, deleteFriendRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { styled } from '@mui/system';

const StyledIconButton = styled(IconButton)(({ theme, color }) => ({
  borderRadius: '12px',
  padding: '10px',
  transition: 'all 0.3s ease',
  backgroundColor: color === 'accept' ? 'rgba(76, 175, 80, 0.12)' :
    color === 'decline' ? 'rgba(244, 67, 54, 0.12)' :
      color === 'delete' ? 'rgba(244, 67, 54, 0.08)' :
        'transparent',
  border: color === 'delete' ? '1px solid rgba(244, 67, 54, 0.5)' : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: color === 'accept' ? 'rgba(76, 175, 80, 0.2)' :
      color === 'decline' ? 'rgba(244, 67, 54, 0.2)' :
        color === 'delete' ? 'rgba(244, 67, 54, 0.15)' :
          'rgba(0, 0, 0, 0.04)'
  }
}));

const MessageRequestsPage = () => {
  const { user, setUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const isMobile = useMediaQuery('(max-width:600px)');
  const userId = user.userId;

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await getFriendRequests(userId);
        const requestsArray = response?.friendRequests || [];
        setRequests(requestsArray);
        console.log(requestsArray)
      } catch (error) {
        console.error('Error fetching friend requests:', error);
        setRequests([]);
      }
    };

    if (userId) {
      fetchFriendRequests();
    }
  }, [userId]);

  const handleAccept = async (requestId) => {
    let acceptedRequest;

    try {
      acceptedRequest = requests.find(req => req._id === requestId);

      if (!acceptedRequest) {
        console.error('Request not found');
        return;
      }

      setRequests(prev => prev.filter(req => req._id !== requestId));

      await acceptFriendRequest(requestId, userId);

      const newFriend = {
        friendId: acceptedRequest.sender._id,
        friendName: acceptedRequest.sender.fullName
      };

      const updatedUser = {
        ...user,
        friends: [...(user.friends || []), newFriend]
      };
      setUser(updatedUser);

      setSnackbarMessage(`You are now friends with ${acceptedRequest.sender.fullName}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      if (acceptedRequest) {
        setRequests(prev => [...prev, acceptedRequest]);
      }
    }
  };

  const handleDecline = async (requestId) => {
    let declineRequest;

    try {
      declineRequest = requests.find(req => req._id === requestId);

      if (!declineRequest) {
        console.error('Request not found');
        return;
      }

      setRequests(prev => prev.filter(req => req._id !== requestId));

      await deleteFriendRequest(requestId, userId);

      setSnackbarMessage(`You decline the request of ${declineRequest.sender.fullName}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      if (declineRequest) {
        setRequests(prev => [...prev, declineRequest]);
      }
    }
  };

  const handleDelete = (id) => {
    setRequests(requests.filter(req => req._id !== id));
  };

  const filteredRequests = requests.filter(request =>
    request.sender.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = requests.filter(req => req.status === 'pending').length;

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
        height: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <Box sx={{
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        bgcolor: 'background.default',
        zIndex: 10,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          {isMobile && (
            <IconButton sx={{
              borderRadius: '12px',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <ArrowBack />
            </IconButton>
          )}
          <Box>
            <Typography variant="h5" component="h1" fontWeight={700}>
              Message Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pendingCount} pending • {requests.length} total
            </Typography>
          </Box>
        </Box>

        <Badge badgeContent={pendingCount} color="error" sx={{ mr: 1 }}>
          <Email color="action" />
        </Badge>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search requests..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
            '& fieldset': { borderColor: 'divider' },
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }
        }}
        sx={{ mb: 3 }}
      />

      <List sx={{
        width: '100%',
        overflow: 'auto',
        height: 'calc(100vh - 230px)',
        '::-webkit-scrollbar': { display: 'none' },
        pb: 4
      }}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map(request => (
            <Paper
              key={request._id}
              elevation={0}
              sx={{
                mb: 2,
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '1px solid',
                borderColor: request.status === 'pending' ? 'black' : 'divider',
                borderLeftWidth: request.status === 'pending' ? '4px' : '1px',
                borderLeftColor: request.status === 'pending' ? 'black' : 'divider',
                transition: '0.3s',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box display="flex" alignItems="center" flexGrow={1}>
                  <Avatar sx={{
                    mr: 2,
                    bgcolor: 'black',
                    color: 'primary.contrastText',
                    width: 48,
                    height: 48,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {request.sender.fullName[0]}
                  </Avatar>
                  <Box flexGrow={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {request.sender.fullName}
                      </Typography>
                      {request.status !== 'pending' && (
                        <Chip
                          size="small"
                          label={request.status}
                          icon={request.status === 'accepted' ?
                            <Done fontSize="small" /> :
                            <Close fontSize="small" />}
                          sx={{
                            bgcolor: request.status === 'accepted' ?
                              'rgba(46, 125, 50, 0.1)' :
                              'rgba(211, 47, 47, 0.1)',
                            color: request.status === 'accepted' ?
                              'success.dark' : 'error.dark',
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {request.timestamp}
                    </Typography>
                  </Box>
                </Box>
                {request?.status == 'pending' ? (
                  <Box display="flex" gap={1} alignItems="center">
                    <Tooltip title="Accept">
                      <StyledIconButton
                        color="accept"
                        onClick={() => handleAccept(request._id)}
                      >
                        <CheckCircle sx={{ color: '#4CAF50' }} />
                      </StyledIconButton>
                    </Tooltip>

                    <Tooltip title="Decline">
                      <StyledIconButton
                        color="decline"
                        onClick={() => handleDecline(request._id)}
                      >
                        <Cancel sx={{ color: '#F44336' }} />
                      </StyledIconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  <Box display="flex" gap={1} alignItems="center">
                    <Tooltip title="Delete">
                      <StyledIconButton
                        color="delete"
                        onClick={() => handleDelete(request._id)}
                      >
                        <Delete sx={{ color: '#F44336' }} />
                      </StyledIconButton>
                    </Tooltip>

                    {request.status === 'accepted' && (
                      <Tooltip title="Message Accepted">
                        <MarkEmailRead
                          sx={{
                            color: '#4CAF50',
                            ml: 1,
                            opacity: 0.8
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                )}
              </Box>

              <Typography variant="body1" sx={{
                mt: 2,
                mx: 1,
                pl: isMobile ? 0 : 6,
                color: 'text.primary',
                bgcolor: 'background.default',
                p: 2,
                borderRadius: 2,
                borderLeft: '2px solid black',
                borderColor: 'divider'
              }}>
                {request.message}
              </Typography>
            </Paper>
          ))
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            sx={{ opacity: 0.6 }}
          >
            <Email sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No message requests found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {searchQuery ? 'Try a different search term' : 'You have no pending message requests'}
            </Typography>
          </Box>
        )}
      </List>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{
            backgroundColor: '#4CAF50',
            color: '#fff',
            borderRadius: '12px',
            alignItems: 'center'
          }}
        >
          <Box display="flex" alignItems="center">
            <CheckCircle sx={{ mr: 1.5 }} />
            {snackbarMessage}
          </Box>
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default MessageRequestsPage;