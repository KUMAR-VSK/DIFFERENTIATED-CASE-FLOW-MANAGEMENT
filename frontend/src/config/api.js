// ============================================
// Centralized API Configuration
// ============================================
// All API calls use this base URL.
// To change the backend server, update REACT_APP_API_URL in .env

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export default BASE_URL;
