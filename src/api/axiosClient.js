import axios from 'axios';

// Create an Axios instance configured to talk to our local Express backend
const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Crucial for sending/receiving session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Response interceptor for handling global errors (like 401 Unauthorized)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get an unauthorized error and we're not on the login page, we might want to redirect.
      // But usually, it's better handled in the useAuth hook or ProtectedRoute.
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
