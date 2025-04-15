import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  TextField, 
  Typography, 
  Button, 
  Box, 
  Paper, 
  Divider, 
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Logout as LogoutIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({ 
    name: '', 
    email: '', 
    phone: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  const rollNo = localStorage.getItem('roll_no');

  useEffect(() => {
    if (!rollNo) {
      navigate('/login/student');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/students/profile/${rollNo}`);
        setProfile(res.data);
        setFormValues({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || ''
        });
      } catch (err) {
        setError('Failed to load profile');
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [rollNo, navigate]);

  const handleChange = (e) => {
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await API.put(`/students/profile/${rollNo}`, formValues);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      setEditMode(false);
      // Refresh profile data
      const res = await API.get(`/students/profile/${rollNo}`);
      setProfile(res.data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Update failed. Please try again.',
        severity: 'error'
      });
      console.error('Update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('roll_no');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    navigate('/login/student');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && !profile) {
    return (
      <Container maxWidth="sm" sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Paper elevation={3} sx={{ 
        p: 4, 
        borderRadius: 4,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 3
        }}>
          <Avatar sx={{ 
            width: 100, 
            height: 100,
            bgcolor: 'primary.main',
            fontSize: 40,
            mb: 2
          }}>
            {profile?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h5" component="h1" fontWeight="600">
            Student Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Roll No: {rollNo}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box component="form" sx={{ mt: 2 }}>
          <TextField
            label="Full Name"
            name="name"
            value={formValues.name}
            fullWidth
            onChange={handleChange}
            disabled={!editMode}
            sx={{ mb: 3 }}
            InputProps={{
              style: { fontSize: '1.1rem' }
            }}
          />

          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formValues.email}
            fullWidth
            onChange={handleChange}
            disabled={!editMode}
            sx={{ mb: 3 }}
            InputProps={{
              style: { fontSize: '1.1rem' }
            }}
          />

          <TextField
            label="Phone Number"
            name="phone"
            value={formValues.phone}
            fullWidth
            onChange={handleChange}
            disabled={!editMode}
            sx={{ mb: 3 }}
            InputProps={{
              style: { fontSize: '1.1rem' }
            }}
          />

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mt: 4,
            gap: 2
          }}>
            {editMode ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleUpdate}
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontWeight: '600',
                  flex: 1
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            ) : (
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => setEditMode(true)}
                startIcon={<EditIcon />}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  fontWeight: '600',
                  flex: 1
                }}
              >
                Edit Profile
              </Button>
            )}
            
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ 
                px: 4,
                py: 1.5,
                fontWeight: '600',
                flex: 1
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentProfile;