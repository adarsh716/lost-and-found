import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Container,
  IconButton,
  List,
  TextField,
  Typography,
  Divider,
  Tooltip,
  useTheme
} from '@mui/material';
import { Search, Close, Block } from '@mui/icons-material'; 
import { useAuth } from '../../context/AuthContext'; 

const FriendListPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const friends = user?.friends || [];

  const handleRemoveFriend = (friendId) => {
    console.log('Remove friend with ID:', friendId);
  };

  const handleBlockFriend = (friendId) => {
    console.log('Block friend with ID:', friendId);
  };

  const filteredFriends = friends.filter(friend =>
    friend.friendName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
        height: '91.5dvh',
        bgcolor: 'background.default',
        overflow: 'auto',
        '::-webkit-scrollbar': { display: 'none' }
      }}
    >
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" component="h1" fontWeight={700}>
          Friend List
          <Typography component="span" sx={{ ml: 1, color: 'text.secondary' }}>
            ({friends.length})
          </Typography>
        </Typography>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search friends..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
            transition: 'all 0.3s ease',
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: 'primary.light' },
            '&.Mui-focused fieldset': { borderColor: 'primary.main' }
          }
        }}
        sx={{ mb: 2 }}
      />

      <List sx={{
        width: '100%',
        overflow: 'auto',
        height: 'calc(100vh - 200px)',
        '::-webkit-scrollbar': { display: 'none' },
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: theme.shadows[0],
        mt: 0,
        '&:hover': {
          boxShadow: theme.shadows[0]
        },
        transition: 'all 0.3s ease'
      }}>
        {filteredFriends.map((friend, index) => (
          <Box key={friend.friendId}>
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                  transform: 'translateX(4px)'
                }
              }}
            >
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    mr: 2,
                    width: 48,
                    height: 48,
                    border: '2px solid',
                    borderColor: 'background.default',
                    boxShadow: theme.shadows[2],
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText'
                  }}
                >
                  {friend.friendName[0]}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  {friend.friendName}
                </Typography>
              </Box>

              <Box display="flex" gap={1}>
                <Tooltip title="Block Friend">
                  <IconButton
                    size="small"
                    onClick={() => handleBlockFriend(friend.friendId)}
                    sx={{
                      color: 'white',
                      bgcolor: 'warning.light',
                      '&:hover': {
                        color: 'warning.main',
                        bgcolor: 'warning.light'
                      }
                    }}
                  >
                    <Block fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Remove Friend">
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFriend(friend.friendId)}
                    sx={{
                      color: 'white',
                      bgcolor: 'error.light',
                      '&:hover': {
                        color: 'error.main',
                        bgcolor: 'error.light'
                      }
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            {index < filteredFriends.length - 1 && (
              <Divider sx={{ mx: 2, borderColor: 'divider' }} />
            )}
          </Box>
        ))}
      </List>
    </Container>
  );
};

export default FriendListPage;
