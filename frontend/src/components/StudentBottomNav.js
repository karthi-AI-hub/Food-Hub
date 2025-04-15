import React, { useState, useEffect } from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper,
  styled
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const StyledBottomNav = styled(BottomNavigation)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(63,81,181,0.9) 0%, rgba(33,150,243,0.9) 100%)',
  backdropFilter: 'blur(10px)',
  height: 70,
}));

const StyledNavAction = styled(BottomNavigationAction)(({ theme }) => ({
  color: 'rgba(255,255,255,0.7)',
  '&.Mui-selected': {
    color: 'white',
    fontWeight: 600
  },
  '& .MuiBottomNavigationAction-label': {
    fontSize: '0.75rem',
    marginTop: '4px'
  }
}));

const StudentBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState('/menu');

  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    navigate(newValue);
  };

  return (
    <Paper sx={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 -5px 15px rgba(0,0,0,0.1)'
    }} elevation={3}>
      <StyledBottomNav value={value} onChange={handleChange}>
        <StyledNavAction 
          label="Orders" 
          value="/orders" 
          icon={
            <motion.div whileHover={{ scale: 1.1 }}>
              <ShoppingCartIcon fontSize="medium" />
            </motion.div>
          } 
        />
        <StyledNavAction 
          label="Menu" 
          value="/menu" 
          icon={
            <motion.div whileHover={{ scale: 1.1 }}>
              <RestaurantMenuIcon fontSize="medium" />
            </motion.div>
          } 
        />
        <StyledNavAction 
          label="Profile" 
          value="/profile" 
          icon={
            <motion.div whileHover={{ scale: 1.1 }}>
              <AccountCircleIcon fontSize="medium" />
            </motion.div>
          } 
        />
      </StyledBottomNav>
    </Paper>
  );
};

export default StudentBottomNav;