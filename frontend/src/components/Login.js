import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Avatar,
  IconButton,
  InputAdornment,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Gavel as GavelIcon,
  AdminPanelSettings as AdminIcon,
  AccountBalance as JudgeIcon,
  Assignment as ClerkIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
} from '@mui/icons-material';

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
  },
});

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(credentials.username, credentials.password);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Judge', username: 'judge1', password: 'judge123' },
    { role: 'Clerk', username: 'clerk1', password: 'clerk123' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                sx={{
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  width: 64,
                  height: 64,
                }}
              >
                <GavelIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Differentiated Case Flow Management System
              </Typography>
              <Box
                sx={{
                  width: 80,
                  height: 4,
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                  mx: 'auto',
                }}
              />
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                type="text"
                required
                value={credentials.username}
                onChange={handleChange}
                autoComplete="username"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                autoComplete="current-password"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? null : <LoginIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>

            {/* Demo Accounts */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom align="center">
                Demo Accounts
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                {demoCredentials.map((cred, index) => (
                  <Card
                    key={cred.role}
                    sx={{
                      minWidth: 140,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => setCredentials({ username: cred.username, password: cred.password })}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Avatar
                        sx={{
                          mx: 'auto',
                          mb: 1,
                          bgcolor: 'primary.main',
                        }}
                      >
                        {cred.role === 'Admin' && <AdminIcon />}
                        {cred.role === 'Judge' && <JudgeIcon />}
                        {cred.role === 'Clerk' && <ClerkIcon />}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {cred.role}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cred.username}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 1 }}>
                Click any demo account to auto-fill credentials
              </Typography>
            </Box>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Register here
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
