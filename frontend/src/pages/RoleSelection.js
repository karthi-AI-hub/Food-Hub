import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Box,
  Grid,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';

const RoleSelection = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSelect = (role) => {
    navigate(`/login/${role}`);
  };

  const roles = [
    {
      title: "Student",
      emoji: "👨‍🎓",
      description: "Order food, track your orders, and manage your canteen account",
      color: "primary",
      variant: "contained"
    },
    {
      title: "Canteen",
      emoji: "🍽️",
      description: "Manage orders, update menu, and oversee canteen operations",
      color: "secondary",
      variant: "outlined"
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: 2
    }}>
      <Container maxWidth="md">
        <Fade in timeout={800}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card elevation={isMobile ? 0 : 6} sx={{
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
            }}>
              <CardContent sx={{ p: isMobile ? 3 : 6 }}>
                <Box textAlign="center" mb={5}>
                  <motion.div
                    
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Typography variant="h3" component="h1" gutterBottom sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                      fontSize: isMobile ? '2rem' : '3rem'
                    }}>
                      College Canteen Hub
                    </Typography>
                  </motion.div>
                  
                  <Typography variant="subtitle1" color="text.secondary" sx={{ 
                    mb: 3,
                    fontSize: isMobile ? '1rem' : '1.25rem'
                  }}>
                    Your one-stop solution for all campus dining needs
                  </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                  {roles.map((role) => (
                    <Grid item xs={12} sm={6} key={role.title}>
                      <motion.div
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Card sx={{
                          height: '100%',
                          border: '1px solid rgba(145, 158, 171, 0.2)',
                          '&:hover': {
                            boxShadow: '0 16px 32px -4px rgba(0, 0, 0, 0.1)',
                            borderColor: theme.palette[role.color].main
                          }
                        }}>
                          <CardContent sx={{ 
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            height: '100%'
                          }}>
                            <Typography variant="h2" sx={{ mb: 2, fontSize: '3rem' }}>
                              {role.emoji}
                            </Typography>
                            
                            <Typography variant="h5" component="h2" gutterBottom sx={{ 
                              fontWeight: 600,
                              color: theme.palette[role.color].main
                            }}>
                              {role.title}
                            </Typography>
                            
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                              {role.description}
                            </Typography>
                            
                            <Button
                              variant={role.variant}
                              color={role.color}
                              fullWidth
                              size="large"
                              onClick={() => handleSelect(role.title.toLowerCase())}
                              sx={{
                                mt: 'auto',
                                borderRadius: 2,
                                py: 1.5,
                                fontWeight: 600,
                                fontSize: '1rem'
                              }}
                            >
                              Continue as {role.title}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                <Box textAlign="center" mt={5}>
                  <Typography variant="body2" color="text.secondary">
                    Need help? Contact support@canteenhub.edu
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Fade>
      </Container>
    </Box>
  );
};

export default RoleSelection;