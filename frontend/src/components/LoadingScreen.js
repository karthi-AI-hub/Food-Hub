import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          rotate: { 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear" 
          },
          scale: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: 'primary.main',
            mb: 2
          }} 
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          Loading...
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;