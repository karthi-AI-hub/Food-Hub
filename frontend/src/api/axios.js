import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// You can auto attach token if needed
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.authorization = token;
  return req;
});

export default API;
