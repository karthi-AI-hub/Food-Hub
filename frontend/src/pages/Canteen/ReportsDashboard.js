import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Stack,
  Chip,
  Divider,
  useTheme,
  Container
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  LocalDining,
  MonetizationOn,
  Schedule,
  ArrowUpward,
  ArrowDownward,
  Equalizer
} from '@mui/icons-material';
import API from '../../api/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const RevenueCard = ({ title, value, change, period, icon }) => {
  const isPositive = change >= 0;
  return (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          {icon}
          <Typography color="text.secondary" variant="subtitle1">
            {title}
          </Typography>
        </Stack>
        <Typography variant="h4" component="div" fontWeight="bold">
          ₹{value.toLocaleString('en-IN')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {isPositive ? (
            <ArrowUpward color="success" sx={{ mr: 0.5 }} />
          ) : (
            <ArrowDownward color="error" sx={{ mr: 0.5 }} />
          )}
          <Typography
            variant="body2"
            color={isPositive ? 'success.main' : 'error.main'}
          >
            {Math.abs(change)}% {period}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const ReportsDashboard = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('sales');
  const [reportData, setReportData] = useState({
    salesData: [],
    popularItems: [],
    revenueTrend: [],
    summaryStats: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      revenueChange: 0
    }
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await API.get(`/canteen/reports?range=${timeRange}`);
        
        // Calculate summary statistics
        const totalRevenue = res.data.revenueTrend.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = res.data.salesData.reduce((sum, item) => sum + item.sales, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        setReportData({
          ...res.data,
          summaryStats: {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            revenueChange: 5.2 // This would normally come from API comparing to previous period
          }
        });
      } catch (err) {
        console.error('Failed to fetch report data:', err);
      }
    };
    fetchReportData();
  }, [timeRange]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Canteen Analytics Dashboard
        </Typography>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          sx={{ minWidth: 150 }}
          size="small"
        >
          <MenuItem value="day">Today</MenuItem>
          <MenuItem value="week">This Week</MenuItem>
          <MenuItem value="month">This Month</MenuItem>
        </Select>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <RevenueCard
            title="Total Revenue"
            value={reportData.summaryStats.totalRevenue}
            change={reportData.summaryStats.revenueChange}
            period="vs last period"
            icon={<MonetizationOn color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <RevenueCard
            title="Total Orders"
            value={reportData.summaryStats.totalOrders}
            change={2.8}
            period="vs last period"
            icon={<LocalDining color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <RevenueCard
            title="Avg. Order Value"
            value={reportData.summaryStats.avgOrderValue}
            change={1.5}
            period="vs last period"
            icon={<TrendingUp color="primary" />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <RevenueCard
            title="Popular Items"
            value={reportData.popularItems.length}
            change={3.2}
            period="trending"
            icon={<Equalizer color="primary" />}
          />
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
        variant="fullWidth"
      >
        <Tab label="Sales Overview" value="sales" icon={<Equalizer />} />
        <Tab label="Revenue Trends" value="revenue" icon={<TrendingUp />} />
        <Tab label="Menu Performance" value="menu" icon={<LocalDining />} />
      </Tabs>

      {activeTab === 'sales' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%', boxShadow: 3 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Sales & Revenue
                </Typography>
                <Box sx={{ height: '400px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="period" />
                      <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                      <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'sales' ? value : `₹${value.toLocaleString('en-IN')}`,
                          name === 'sales' ? 'Orders' : 'Revenue'
                        ]}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="sales"
                        name="Orders"
                        fill={theme.palette.primary.main}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="revenue"
                        name="Revenue (₹)"
                        fill={theme.palette.secondary.main}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: 3 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Revenue Composition
                </Typography>
                <Box sx={{ height: '400px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.popularItems}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="revenue"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.popularItems.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 'revenue' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Revenue Trend (Last 7 Days)
                </Typography>
                <Box sx={{ height: '500px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.revenueTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={theme.palette.primary.main}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 'menu' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Top Performing Items
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">% of Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.popularItems.map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                                <LocalDining />
                              </Avatar>
                              <Typography>{item.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            ₹{parseFloat(item.revenue).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {(
                              (item.revenue / reportData.summaryStats.totalRevenue) *
                              100
                            ).toFixed(1)}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: 3 }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Sales by Category
                </Typography>
                <Box sx={{ height: '500px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: 'Burgers', value: 45 },
                        { name: 'Pizza', value: 30 },
                        { name: 'Beverages', value: 25 },
                        { name: 'Desserts', value: 20 },
                        { name: 'Sides', value: 15 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar 
                        dataKey="value" 
                        fill={theme.palette.primary.main} 
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Additional Insights Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Key Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, borderLeft: `4px solid ${theme.palette.success.main}`, height: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                      <Schedule color="success" />
                      <Typography variant="subtitle1" fontWeight="bold">Peak Hours</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Lunch:</strong> 12:00 PM - 2:00 PM (45% of daily orders)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Dinner:</strong> 6:00 PM - 8:00 PM (35% of daily orders)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, borderLeft: `4px solid ${theme.palette.warning.main}`, height: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                      <LocalDining color="warning" />
                      <Typography variant="subtitle1" fontWeight="bold">Best Selling Category</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Burgers:</strong> 45% of total sales
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Average Order Value:</strong> ₹320 for burger combos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, borderLeft: `4px solid ${theme.palette.info.main}`, height: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                      <TrendingUp color="info" />
                      <Typography variant="subtitle1" fontWeight="bold">Customer Preference</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Top Combo:</strong> Cheeseburger + Fries (65% of burger orders)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Popular Add-on:</strong> Soft drinks (selected in 78% of combos)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportsDashboard;