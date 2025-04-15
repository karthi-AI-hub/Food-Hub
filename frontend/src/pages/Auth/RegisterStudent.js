import React, { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Stack, 
  Alert,
  Box,
  Fade,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';

const RegisterStudent = () => {
  const [formData, setFormData] = useState({
    roll_no: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const { roll_no, name, password, confirmPassword } = formData;

    if (!roll_no || !name || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        roll_no,
        name,
        password,
      });
      setSuccess(res.data.message || 'Registration successful');
      setFormData({ roll_no: '', name: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login/student'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Fade in timeout={500}>
        <Box sx={{ width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card elevation={4} sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              background: 'rgba(255, 255, 255, 0.95)'
            }}>
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                <Box textAlign="center" mb={4}>
                  <Typography variant="h4" component="h1" sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Student Registration
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Create your account to access canteen services
                  </Typography>
                </Box>

                <Stack component="form" onSubmit={handleSubmit} spacing={3}>
                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      {success}
                    </Alert>
                  )}

                  <motion.div whileHover={{ scale: 1.02 }}>
                    <TextField
                      label="Roll Number"
                      name="roll_no"
                      value={formData.roll_no}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }}>
                    <TextField
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }}>
                    <TextField
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }}>
                    <TextField
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="contained" 
                      size="large" 
                      fullWidth 
                      type="submit"
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: '1rem',
                        background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                        boxShadow: '0 3px 5px 2px rgba(33, 150, 243, 0.2)'
                      }}
                    >
                      Register
                    </Button>
                  </motion.div>

                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Button 
                        onClick={() => navigate('/login/student')}
                        sx={{ 
                          p: 0,
                          textTransform: 'none',
                          fontSize: 'inherit',
                          color: theme.palette.primary.main,
                          '&:hover': {
                            background: 'transparent',
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        Login here
                      </Button>
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Fade>
    </Container>
  );
};

export default RegisterStudent;