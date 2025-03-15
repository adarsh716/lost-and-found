import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Avatar,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  keyframes,
  TextField
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import PeopleIcon from '@mui/icons-material/People';
import { styled } from '@mui/system';
import { useAuth } from '../../context/AuthContext';
import { getUserDataPublic, sendFriendRequest } from '../../api/auth';

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.6; }
`;

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  animation: `${pulse} 3s ease-in-out infinite`,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #000 30%, #333 90%)',
  color: '#fff',
  border: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
  },
}));

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user, friendRequestStatus, setFriendRequestStatus } = useAuth();
  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [openFriendRequestDialog, setOpenFriendRequestDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState({
    username: '',
    friends: []
  });
  const [loading, setLoading] = useState(true);
  const senderId = user.userId;
  console.log(friendRequestStatus)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserDataPublic(userId);
        const newUserData = {
          username: response.user.fullName || 'No name',
          friends: response.user.friends || [],
        };
        setUserData(newUserData);
        setLoading(false);


        const isFriend = newUserData.friends.some(friend => friend.id === senderId);
        if (isFriend) {
          setFriendRequestStatus('connected');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, senderId, setFriendRequestStatus]);

  const handleFriendToggle = () => {
    if (friendRequestStatus === 'none') {
      setOpenFriendRequestDialog(true);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const response = await sendFriendRequest(userId, senderId, message);
      if (response.success) {
        setFriendRequestStatus('sent');
        setOpenBlockDialog(false);
      }
      setOpenFriendRequestDialog(false)
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleBlockClick = () => {
    setOpenBlockDialog(true);
  };

  const handleBlockConfirm = () => {
    setOpenBlockDialog(false);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!userData) {
    return <Typography>User not found</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          border: '2px solid #000',
          borderRadius: '20px',
          p: 4,
          mb: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
          },
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
            position: 'relative',
            pt: 15,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 140,
              height: 140,
              borderRadius: '50%',
              border: '2px dashed #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
            }}
          >
            <AnimatedAvatar
              sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                bgcolor: 'linear-gradient(45deg, #000 30%, #333 90%)',
                color: '#fff',
                mx: 'auto',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
              }}
            >
              {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
            </AnimatedAvatar>
          </Box>

          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 900,
              letterSpacing: '-1.5px',
              mt: 6,
              background: '-webkit-linear-gradient(#000, #333)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {userData.username}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 3,
              color: '#666',
              fontWeight: 500,
            }}
          >
            <PeopleIcon fontSize="medium" sx={{ color: '#000' }} />
            {userData.friends.length.toLocaleString()} Connections
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              '& > *': {
                minWidth: '180px',
              },
            }}
          >
            <GradientButton
              variant={friendRequestStatus === 'connected' ? 'contained' : 'outlined'}
              startIcon={
                friendRequestStatus === 'connected' ? <CheckIcon /> : <PersonAddIcon />
              }
              onClick={handleFriendToggle}
              disabled={friendRequestStatus == 'sent'}
              sx={{
                borderRadius: '15px',
                ...(friendRequestStatus === 'connected' && {
                  background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #45a049 30%, #3d8b40 90%)',
                  },
                }),
              }}
            >
              {friendRequestStatus === 'connected'
                ? 'Connected'
                : friendRequestStatus === 'sent'
                  ? 'Request Sent'
                  : 'Connect Now'}
            </GradientButton>

            <Button
              variant="outlined"
              color="error"
              startIcon={<BlockIcon />}
              onClick={handleBlockClick}
              sx={{
                borderRadius: '15px',
                borderWidth: 2,
                px: 4,
                fontWeight: 700,
                '&:hover': {
                  borderWidth: 2,
                  background: 'rgba(255,0,0,0.05)',
                },
              }}
            >
              Block
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={openBlockDialog}
        onClose={() => setOpenBlockDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            border: '2px solid #000',
            background: '#fff',
            boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            fontSize: '1.5rem',
            background: '-webkit-linear-gradient(#000, #333)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Confirm Block
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to block {userData.username}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={handleBlockConfirm}
            sx={{
              borderWidth: 2,
              borderRadius: '10px',
              px: 3,
              py: 1,
              fontWeight: 700,
            }}
          >
            Block
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenBlockDialog(false)}
            sx={{
              borderRadius: '10px',
              px: 3,
              py: 1,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #000 30%, #333 90%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(45deg, #333 30%, #555 90%)',
              },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openFriendRequestDialog}
        onClose={() => setOpenFriendRequestDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            border: '2px solid #000',
            background: '#fff',
            boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle sx={{
          fontWeight: 900,
          fontSize: '1.5rem',
          background: '-webkit-linear-gradient(#000, #333)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>Send Friend Request</DialogTitle>
        <DialogContent>
          <Typography>Send a message with your friend request:</Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFriendRequestDialog(false)} sx={{
            borderWidth: 2,
            borderRadius: '10px',
            px: 3,
            py: 1,
            fontWeight: 700,
            color: 'black'
          }}>Cancel</Button>
          <Button variant="contained" onClick={handleSendFriendRequest} sx={{
            borderRadius: '10px',
            px: 3,
            py: 1,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #000 30%, #333 90%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(45deg, #333 30%, #555 90%)',
            },
          }}>Send Request</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfilePage;


