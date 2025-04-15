import React from 'react';
import { Container, Typography, Grid, Card, CardContent } from '@mui/material';

const CanteenDashboard = () => {
  const stats = {
    totalOrders: 120,
    pending: 30,
    completed: 80,
    rejected: 10,
  };

  return (
    <Container sx={{ mt: 10, mb: 8 }}>
      <Typography variant="h5" gutterBottom>
        🍴 Canteen Dashboard
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(stats).map(([key, value]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Typography>
                <Typography variant="h4">{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CanteenDashboard;
