import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { AccountCircle, Message, People, Settings, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; 

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate(); 

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (route) => {
    navigate(route);  
    handleMenuClose();
  };

  const handleLogout = () => {
    localStorage.clear();  
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'linear-gradient(45deg, #000000, #333333)', 
        color: '#fff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        transition: 'background 0.3s ease', 
        height: '8.5dvh',
        justifyContent:'center'
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            fontSize: '1.5rem',
            letterSpacing: '1px', 
          }}
        >
          Web Reclaim
        </Typography>

        <IconButton
          edge="end"
          color="inherit"
          onClick={handleProfileMenuOpen}
          sx={{
            marginLeft: 2,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #444, #666)', 
            padding: 1,
            transition: 'transform 0.3s ease, background 0.3s ease', 
            '&:hover': {
              transform: 'scale(1.1)', 
              background: 'linear-gradient(45deg, #555, #777)',
            },
          }}
        >
          <AccountCircle />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            mt: '20px',
            borderRadius: 4,
            '& .MuiPaper-root': {
              background: 'linear-gradient(45deg, #333, #555)', 
              color: '#fff',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)', 
            },
            '& .MuiMenuItem-root': {
              padding: '10px 20px',
              transition: 'background 0.3s ease', 
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)', 
              },
            },
          }}
        >
          <MenuItem onClick={() => handleMenuItemClick('/')}>
            <Message sx={{ marginRight: 1 }} />
            Community Chat
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('/private-chat')}>
            <Message sx={{ marginRight: 1 }} />
            Private Chat
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('/profile')}>
            <AccountCircle sx={{ marginRight: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('/requests')}>
            <Message sx={{ marginRight: 1 }} />
            Message Request
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('/friends')}>
            <People sx={{ marginRight: 1 }} />
            Friends
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('/settings')}>
            <Settings sx={{ marginRight: 1 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}> 
            <ExitToApp sx={{ marginRight: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
