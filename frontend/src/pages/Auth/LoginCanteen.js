import React, { useState } from "react";
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Stack, 
  Link,
  Box,
  Alert,
  Fade,
  useTheme, InputAdornment, IconButton, 
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from '../../api/axios';
import LoadingScreen from '../../components/LoadingScreen';

const LoginCanteen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role] = useState("canteen");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in both fields');
      return;
    }
  
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { role, id: username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('role', role);
      setError(null);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials. Please try again.');
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
                    background: 'linear-gradient(45deg, #ff6b6b 30%, #ff8e53 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Canteen Staff Portal
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Manage your canteen operations efficiently
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <TextField
                      label="Username"
                      variant="outlined"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      fullWidth
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
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      // sx={{
                      //   '& .MuiOutlinedInput-root': {
                      //     borderRadius: 2,
                      //   }
                      }}
                    />
                  </motion.div>

                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="contained" 
                      size="large" 
                      fullWidth 
                      onClick={handleLogin}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: '1rem',
                        background: 'linear-gradient(45deg, #ff6b6b 30%, #ff8e53 90%)',
                        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, 0.2)'
                      }}
                    >
                      Sign In
                    </Button>
                  </motion.div>

                  <Typography variant="body2" align="center" mt={2}>
                    <Link 
                      href="/" 
                      underline="hover" 
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': {
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      ← Back to role selection
                    </Link>
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Fade>
    </Container>
  );
};

export default LoginCanteen;