import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title,
} from 'chart.js';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Avatar,
  Button,
  Alert,
  AlertTitle,
  LinearProgress,
  Fab,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as CaseIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Title
);

// Create Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [highPriorityCases, setHighPriorityCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch data if user is authenticated
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [statsResponse, casesResponse, highPriorityResponse] = await Promise.all([
          axios.get('http://localhost:8081/api/cases/statistics'),
          axios.get('http://localhost:8081/api/cases'),
          axios.get('http://localhost:8081/api/cases/high-priority'),
        ]);

        setStats(statsResponse.data);
        setRecentCases(casesResponse.data.slice(0, 5)); // Show last 5 cases
        setHighPriorityCases(highPriorityResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                <DashboardIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
                Dashboard
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Welcome back, {user.firstName || user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Here's an overview of your case management activities
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Last updated
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </Typography>
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Loading dashboard...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Statistics Cards */}
            {stats && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', color: 'white' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Total Cases
                          </Typography>
                          <Typography variant="h4" component="div" fontWeight="bold">
                            {stats.totalCases}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                          <CaseIcon />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Filed Cases
                          </Typography>
                          <Typography variant="h4" component="div" fontWeight="bold">
                            {stats.filedCases}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                          <CompletedIcon />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Scheduled Cases
                          </Typography>
                          <Typography variant="h4" component="div" fontWeight="bold">
                            {stats.scheduledCases}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                          <ScheduleIcon />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', color: 'white' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Completed Cases
                          </Typography>
                          <Typography variant="h4" component="div" fontWeight="bold">
                            {stats.completedCases}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                          <CompletedIcon />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Charts Section */}
            {stats && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Case Status Distribution
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Doughnut
                          data={{
                            labels: ['Filed', 'Under Review', 'Scheduled', 'In Progress', 'Completed', 'Dismissed'],
                            datasets: [{
                              data: [
                                stats.filedCases || 0,
                                Math.max(0, stats.totalCases - stats.filedCases - stats.scheduledCases - stats.completedCases - 2),
                                stats.scheduledCases || 0,
                                2,
                                stats.completedCases || 0,
                                0
                              ],
                              backgroundColor: [
                                '#6B7280', '#F59E0B', '#3B82F6', '#06B6D4', '#10B981', '#EF4444'
                              ],
                              borderWidth: 2,
                              borderColor: '#FFFFFF'
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: 'bottom' }
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Case Priority Overview
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <Bar
                          data={{
                            labels: ['Priority 1-3', 'Priority 4-6', 'Priority 7-8', 'Priority 9-10'],
                            datasets: [{
                              label: 'Number of Cases',
                              data: [
                                Math.floor(stats.totalCases * 0.1),
                                Math.floor(stats.totalCases * 0.4),
                                Math.floor(stats.totalCases * 0.3),
                                Math.floor(stats.totalCases * 0.2)
                              ],
                              backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#7C3AED'],
                              borderRadius: 4
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: { y: { beginAtZero: true } },
                            plugins: { legend: { display: false } }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Performance Metrics */}
            {stats && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Completion Rate
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            {stats.totalCases > 0 ? Math.round((stats.completedCases / stats.totalCases) * 100) : 0}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cases completed vs total cases
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'success.light' }}>
                          <TrendingIcon sx={{ color: 'success.main' }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Active Cases
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="primary.main">
                            {stats.totalCases - stats.completedCases}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cases currently in progress
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <ScheduleIcon sx={{ color: 'primary.main' }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Avg Priority Score
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {stats.averagePriority ? stats.averagePriority.toFixed(1) : '5.0'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Average case priority (1-10 scale)
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: 'warning.light' }}>
                          <WarningIcon sx={{ color: 'warning.main' }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Alerts and Notifications */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Alerts & Notifications
                  </Typography>
                  <Chip
                    label={highPriorityCases.length + (stats?.scheduledCases || 0) > 10 ? 'High Priority' : 'Normal'}
                    color={highPriorityCases.length + (stats?.scheduledCases || 0) > 10 ? 'error' : 'default'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {highPriorityCases.length > 0 && (
                    <Alert severity="error" icon={<WarningIcon />}>
                      <AlertTitle>High Priority Cases</AlertTitle>
                      {highPriorityCases.length} cases require immediate attention
                    </Alert>
                  )}

                  {stats && stats.scheduledCases > 0 && (
                    <Alert severity="info" icon={<ScheduleIcon />}>
                      <AlertTitle>Scheduled Hearings</AlertTitle>
                      {stats.scheduledCases} cases have upcoming hearings
                    </Alert>
                  )}

                  {stats && stats.totalCases === 0 && (
                    <Alert severity="info" icon={<CaseIcon />}>
                      <AlertTitle>Getting Started</AlertTitle>
                      No cases found. Start by filing your first case.
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Activity Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Recent Cases */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight="medium">
                        Recent Cases
                      </Typography>
                      <ScheduleIcon color="action" />
                    </Box>
                  </CardContent>
                  <CardContent>
                    {recentCases.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {recentCases.map((caseItem) => (
                          <Paper
                            key={caseItem.id}
                            component={Link}
                            to={`/cases/${caseItem.id}`}
                            elevation={1}
                            sx={{
                              p: 2,
                              textDecoration: 'none',
                              '&:hover': { bgcolor: 'action.hover' },
                              transition: 'all 0.2s'
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="medium" color="text.primary">
                              {caseItem.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                              <Chip label={caseItem.caseNumber} size="small" variant="outlined" />
                              <Chip
                                label={caseItem.status.replace('_', ' ')}
                                size="small"
                                color={
                                  caseItem.status === 'COMPLETED' ? 'success' :
                                  caseItem.status === 'IN_PROGRESS' ? 'primary' :
                                  caseItem.status === 'SCHEDULED' ? 'info' :
                                  caseItem.status === 'FILED' ? 'default' : 'warning'
                                }
                                variant="outlined"
                              />
                              <Chip label={`Priority ${caseItem.priority}`} size="small" color="secondary" variant="outlined" />
                            </Box>
                          </Paper>
                        ))}
                        <Button
                          component={Link}
                          to="/cases"
                          variant="outlined"
                          fullWidth
                          sx={{ mt: 2 }}
                        >
                          View All Cases
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CaseIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          No recent cases
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* High Priority Cases */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ bgcolor: 'error.light', borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight="medium" color="error.contrastText">
                        High Priority Cases
                      </Typography>
                      <WarningIcon sx={{ color: 'error.contrastText' }} />
                    </Box>
                  </CardContent>
                  <CardContent>
                    {highPriorityCases.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {highPriorityCases.slice(0, 5).map((caseItem) => (
                          <Paper
                            key={caseItem.id}
                            component={Link}
                            to={`/cases/${caseItem.id}`}
                            elevation={1}
                            sx={{
                              p: 2,
                              textDecoration: 'none',
                              '&:hover': { bgcolor: 'error.light', opacity: 0.8 },
                              transition: 'all 0.2s'
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="medium" color="text.primary">
                              {caseItem.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={caseItem.caseType}
                                size="small"
                                color={
                                  caseItem.caseType === 'CONSTITUTIONAL' ? 'error' :
                                  caseItem.caseType === 'CRIMINAL' ? 'warning' :
                                  caseItem.caseType === 'CIVIL' ? 'primary' : 'default'
                                }
                                variant="outlined"
                              />
                              <Chip label={`Priority ${caseItem.priority}`} size="small" color="error" />
                              <Chip
                                label={caseItem.status.replace('_', ' ')}
                                size="small"
                                color={
                                  caseItem.status === 'COMPLETED' ? 'success' :
                                  caseItem.status === 'IN_PROGRESS' ? 'primary' :
                                  caseItem.status === 'SCHEDULED' ? 'info' : 'warning'
                                }
                                variant="outlined"
                              />
                            </Box>
                          </Paper>
                        ))}
                        {highPriorityCases.length > 5 && (
                          <Button
                            component={Link}
                            to="/cases?filter=high-priority"
                            variant="outlined"
                            color="error"
                            fullWidth
                            sx={{ mt: 2 }}
                          >
                            View All High Priority Cases
                          </Button>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CompletedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          No high priority cases
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Card>
              <CardContent sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="medium">
                    Quick Actions
                  </Typography>
                  <AddIcon />
                </Box>
              </CardContent>
              <CardContent>
                <Grid container spacing={2}>
                  {(user.role === 'CLERK' || user.role === 'ADMIN') && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        component={Link}
                        to="/cases/new"
                        variant="outlined"
                        fullWidth
                        sx={{
                          p: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          border: '2px dashed',
                          '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        <AddIcon sx={{ fontSize: 32 }} />
                        <Typography variant="body2" fontWeight="medium">
                          File New Case
                        </Typography>
                      </Button>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      component={Link}
                      to="/cases"
                      variant="outlined"
                      color="success"
                      fullWidth
                      sx={{
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        border: '2px dashed',
                        '&:hover': { borderColor: 'success.main' }
                      }}
                    >
                      <SearchIcon sx={{ fontSize: 32 }} />
                      <Typography variant="body2" fontWeight="medium">
                        Browse Cases
                      </Typography>
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      color="warning"
                      fullWidth
                      sx={{
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        border: '2px dashed',
                        '&:hover': { borderColor: 'warning.main' }
                      }}
                    >
                      <AssessmentIcon sx={{ fontSize: 32 }} />
                      <Typography variant="body2" fontWeight="medium">
                        View Reports
                      </Typography>
                    </Button>
                  </Grid>

                  {user.role === 'ADMIN' && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        sx={{
                          p: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          border: '2px dashed',
                          '&:hover': { borderColor: 'secondary.main' }
                        }}
                      >
                        <SettingsIcon sx={{ fontSize: 32 }} />
                        <Typography variant="body2" fontWeight="medium">
                          System Settings
                        </Typography>
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </>
        )}

        {/* Floating Action Button */}
        {(user.role === 'CLERK' || user.role === 'ADMIN') && (
          <Tooltip title="File New Case">
            <Fab
              component={Link}
              to="/cases/new"
              color="primary"
              sx={{ position: 'fixed', bottom: 24, right: 24 }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default Dashboard;
