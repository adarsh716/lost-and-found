import React from 'react';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Avatar,
  Divider,
  ThemeProvider,
  createTheme
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useAuth } from '../../context/AuthContext'; 

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#404040',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
    body1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#000000',
        },
      },
    },
  },
});

const BlockedAccountsPage = () => {
  const { user, setUser } = useAuth(); 
  const blockedUsers = user?.blockedUsers || [];
  console.log(user.blockedUsers)

  const handleUnblock = (userId) => {
    const updatedBlockedUsers = blockedUsers.filter(user => user.userId !== userId);
    setUser((prev) => ({
      ...prev,
      blockedUsers: updatedBlockedUsers,
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Blocked Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Accounts you've chosen to block
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ 
          borderRadius: 0,
        }}>
          {blockedUsers.length === 0 ? (
            <Box sx={{ 
              py: 8, 
              textAlign: 'center',
              borderTop: '2px solid #000'
            }}>
              <LockOpenIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No blocked accounts
              </Typography>
            </Box>
          ) : (
            blockedUsers.map((user, index) => (
              <Box key={user.id}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main',
                      color: 'secondary.main',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      fontSize: '1rem'
                    }}>
                      {user.blockedUserName?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Typography variant="body1">
                      {user.blockedUserName || 'Unknown User'}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<LockOpenIcon />}
                    onClick={() => handleUnblock(user.id)}
                    sx={{
                      borderRadius: 3,
                      borderWidth: 2,
                      color: 'black',
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        color: 'black',
                      }
                    }}
                  >
                    Unblock
                  </Button>
                </Box>
                {index < blockedUsers.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default BlockedAccountsPage;
