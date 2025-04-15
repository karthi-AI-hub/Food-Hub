// src/pages/canteen/Profile.js
import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Divider } from '@mui/material';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen';

const CanteenProfile = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // The token should be attached via API interceptor
        const res = await API.get('/canteen/profile');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        // Optionally redirect or show error message
      }
    };

    fetchProfile();
  }, []);

  if (!profile) return <LoadingScreen/>;

  return (
    <Container sx={{ mt: 10, mb: 8 }}>
      <Typography variant="h5" gutterBottom>
        👨‍🍳 Profile
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="subtitle1">
            <strong>Username:</strong> {profile.username}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1">
            <strong>ID:</strong> {profile.id}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CanteenProfile;
