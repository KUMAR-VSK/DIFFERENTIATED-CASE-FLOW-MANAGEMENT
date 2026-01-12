import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  CheckCircle,
  Schedule,
  PriorityHigh,
  Person,
  Folder,
  Assessment,
  Timeline,
  Notifications,
  Dashboard as DashboardIcon,
  Work,
  Gavel,
  Description,
  Group
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [highPriorityCases, setHighPriorityCases] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState('good');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const apiCalls = [axios.get('http://localhost:8081/api/cases')];

        if (user.role === 'ADMIN') {
          apiCalls.unshift(axios.get('http://localhost:8081/api/cases/statistics'));
          apiCalls.push(axios.get('http://localhost:8081/api/cases/high-priority'));
        }

        const responses = await Promise.all(apiCalls);
        let responseIndex = 0;

        if (user.role === 'ADMIN') {
          setStats(responses[responseIndex++].data);
        }

        const casesResponse = responses[responseIndex++];
        setRecentCases(casesResponse.data.slice(0, 6));

        if (user.role === 'ADMIN') {
          const highPriorityResponse = responses[responseIndex];
          setHighPriorityCases(highPriorityResponse.data);
        }

        // Mock system health check
        setSystemHealth('good');

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setSystemHealth('warning');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SCHEDULED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FILED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCaseTypeColor = (caseType) => {
    switch (caseType) {
      case 'CONSTITUTIONAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CRIMINAL':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CIVIL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FAMILY':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'ADMINISTRATIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <LinearProgress sx={{ width: 200, mb: 2 }} />
          <Typography variant="h6">Loading dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  const completionRate = stats ? ((stats.completedCases / stats.totalCases) * 100) : 0;
  const activeCases = stats ? stats.scheduledCases + stats.filedCases : 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Dashboard
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Welcome back, {user.firstName || user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here's an overview of your case management activities
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Last updated
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* System Health Alert */}
      <Alert
        severity={systemHealth === 'good' ? 'success' : 'warning'}
        sx={{ mb: 3 }}
        icon={<DashboardIcon />}
      >
        System Status: {systemHealth === 'good' ? 'All systems operational' : 'Some services may be experiencing issues'}
      </Alert>

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'background.paper', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Folder />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stats.totalCases}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Cases
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={100} color="primary" />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'background.paper', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stats.filedCases}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Filed Cases
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.filedCases / stats.totalCases) * 100}
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'background.paper', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <Schedule />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {stats.scheduledCases}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled Cases
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.scheduledCases / stats.totalCases) * 100}
                  color="warning"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'background.paper', '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {completionRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completionRate}
                  color="info"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Cases */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <Box sx={{ bgcolor: 'primary.main', p: 2, color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Recent Cases
                </Typography>
                <Timeline />
              </Box>
            </Box>
            <CardContent>
              {recentCases.length > 0 ? (
                <List>
                  {recentCases.map((caseItem, index) => (
                    <React.Fragment key={caseItem.id}>
                      <ListItem
                        component={Link}
                        to={`/cases/${caseItem.id}`}
                        sx={{
                          '&:hover': { bgcolor: 'action.hover' },
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Assignment />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={caseItem.title}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip
                                label={caseItem.caseNumber}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={caseItem.status.replace('_', ' ')}
                                size="small"
                                color={
                                  caseItem.status === 'COMPLETED' ? 'success' :
                                  caseItem.status === 'IN_PROGRESS' ? 'primary' :
                                  caseItem.status === 'SCHEDULED' ? 'warning' : 'default'
                                }
                              />
                              <Chip
                                label={`P${caseItem.priority}`}
                                size="small"
                                color={caseItem.priority >= 8 ? 'error' : 'default'}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentCases.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No recent cases
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Timeline & Quick Actions */}
        <Grid item xs={12} lg={6}>
          <Grid container spacing={3} direction="column">
            {/* High Priority Cases Alert */}
            <Grid item>
              <Alert
                severity="warning"
                icon={<PriorityHigh />}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  {highPriorityCases.length} high priority case{highPriorityCases.length !== 1 ? 's' : ''} requiring attention
                </Typography>
              </Alert>
            </Grid>

            {/* Quick Actions */}
            <Grid item>
              <Card>
                <Box sx={{ bgcolor: 'secondary.main', p: 2, color: 'white' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Quick Actions
                  </Typography>
                </Box>
                <CardContent>
                  <Grid container spacing={2}>
                    {(user.role === 'CLERK' || user.role === 'ADMIN') && (
                      <Grid item xs={6}>
                        <Paper
                          component={Link}
                          to="/cases/new"
                          elevation={0}
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            textDecoration: 'none',
                            color: 'inherit',
                            border: '2px dashed',
                            borderColor: 'primary.main',
                            '&:hover': {
                              bgcolor: 'primary.main',
                              color: 'white',
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          <Work sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="body2">File New Case</Typography>
                        </Paper>
                      </Grid>
                    )}

                    <Grid item xs={(user.role === 'CLERK' || user.role === 'ADMIN') ? 6 : 12}>
                      <Paper
                        component={Link}
                        to="/cases"
                        elevation={0}
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          textDecoration: 'none',
                          color: 'inherit',
                          border: '2px dashed',
                          borderColor: 'success.main',
                          '&:hover': {
                            bgcolor: 'success.main',
                            color: 'white',
                            borderColor: 'success.main'
                          }
                        }}
                      >
                        <Assessment sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="body2">Browse Cases</Typography>
                      </Paper>
                    </Grid>

                    {user.role === 'JUDGE' && (
                      <Grid item xs={12}>
                        <Paper
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            border: '2px dashed',
                            borderColor: 'warning.main',
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'warning.main',
                              color: 'white',
                              borderColor: 'warning.main'
                            }
                          }}
                        >
                          <Gavel sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="body2">Add Case Notes</Typography>
                        </Paper>
                      </Grid>
                    )}

                    {user.role === 'ADMIN' && (
                      <Grid item xs={12}>
                        <Paper
                          component={Link}
                          to="/users"
                          elevation={0}
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            textDecoration: 'none',
                            color: 'inherit',
                            border: '2px dashed',
                            borderColor: 'info.main',
                            '&:hover': {
                              bgcolor: 'info.main',
                              color: 'white',
                              borderColor: 'info.main'
                            }
                          }}
                        >
                          <Group sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="body2">Manage Users</Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      {stats && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Performance Overview
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                        {activeCases}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Cases
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(activeCases / stats.totalCases) * 100}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                        {stats.completedCases}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cases Completed
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(stats.completedCases / stats.totalCases) * 100}
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        {stats.averagePriority?.toFixed(1) || '0.0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Priority Score
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(stats.averagePriority || 0) * 10}
                        color="warning"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
