import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Avatar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Group,
  Edit,
  Chat,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getUserData, updateProfile } from '../../api/auth';

const CommunityProfile = () => {
  const theme = useTheme();
  const { user, updateUserData } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState(null);
  const [originalData, setOriginalData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: '',
  });
  const [editData, setEditData] = useState({ ...originalData });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.userId) {
        setError('User is not logged in.');
        return;
      }

      setError(null);
      setFetchingData(true);
      try {
        const responseData = await getUserData(user.userId);

        const newUserData = {
          fullName: responseData.user.fullName || 'No community name',
          email: responseData.user.email || 'No email provided',
          phone: responseData.user.phoneNumber || 'No phone number provided',
          address: responseData.user.address || 'No address provided',
          friends: responseData.user.friends || [],
        };

        setOriginalData(newUserData);
        setEditData(newUserData);

        updateUserData(newUserData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to fetch user profile data.');
      } finally {
        setFetchingData(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSave = async () => {
    if (!editData.fullName || !editData.email || !editData.phone || !editData.address) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await updateProfile(
        user.userId,
        editData.fullName,
        editData.address,
        editData.phone,
        editData.email
      );

      setOriginalData(editData);
      setOpen(false);
      updateUserData(editData);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditData({ ...originalData });
    setOpen(true);
  };
  
  const handleCancel = () => {
    setEditData({ ...originalData }); // Reset edit data when canceling
    setOpen(false);
    setError(null); // Clear any errors
  };

  if (fetchingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !open) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  return (
    <>
      <Paper
        elevation={isMobile ? 0 : 3}
        sx={{
          maxWidth: 1400,
          minWidth: { xs: 'auto', md: 1000 },
          margin: 'auto',
          p: 4,
          backgroundColor: theme.palette.background.default,
          overflow: 'auto',
          justifyContent: 'center',
          mt: { xs: 0, md: 6 },
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                alt="Community Avatar"
                src={originalData.avatarUrl}
                sx={{
                  width: 150,
                  height: 150,
                  mb: 2,
                  border: '2px solid',
                  borderColor: 'common.black',
                }}
              />
              <Typography
                variant="h4"
                component="h1"
                sx={{ color: 'text.primary', textAlign: 'center' }}
              >
                {originalData.fullName}
              </Typography>

              <Box
                sx={{
                  width: '100%',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  my: 2,
                  textAlign: 'center',
                }}
              >
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Group sx={{ color: 'common.black', fontSize: 30 }} />
                    <Typography variant="h5" sx={{ color: 'common.black', mt: 1 }}>
                      {user.friends ? `${user.friends.length} ${user.friends.length === 1 ? 'Friend' : 'Friends'}` : '0 Friends'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Chat />}
                  fullWidth
                  sx={{
                    backgroundColor: 'common.black',
                    color: 'common.white',
                    '&:hover': { backgroundColor: 'grey.800' },
                  }}
                >
                  Community Chat
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  fullWidth
                  onClick={handleEditClick}
                  sx={{
                    borderColor: 'common.black',
                    color: 'common.black',
                    '&:hover': { borderColor: 'grey.800' },
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'text.primary' }}>
                Contact Information
              </Typography>
              <Divider sx={{ bgcolor: 'common.black', mb: 3 }} />

              <List dense sx={{ width: '100%' }}>
                <ListItem>
                  <ListItemIcon>
                    <Email sx={{ color: 'common.black' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Address"
                    secondary={originalData.email}
                    sx={{ color: 'text.secondary' }}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Phone sx={{ color: 'common.black' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="24/7 Helpline"
                    secondary={originalData.phone}
                    sx={{ color: 'text.secondary' }}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <LocationOn sx={{ color: 'common.black' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Address"
                    secondary={originalData.address}
                    sx={{ color: 'text.secondary' }}
                  />
                </ListItem>
              </List>
            </Box>

            <Box
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
                Community Guidelines
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                • Be respectful to all members
                <br />
                • Verify items before claiming
                <br />
                • Report suspicious activity immediately
                <br />
                • Keep personal information private
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={open}
        onClose={handleCancel}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Community Name"
            value={editData.fullName}
            onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email Address"
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Phone Number"
            value={editData.phone}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Address"
            value={editData.address}
            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            color="primary" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommunityProfile;