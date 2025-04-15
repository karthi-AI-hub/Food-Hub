import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoadingScreen from './LoadingScreen';

const PrivateRoute = ({ allowedRole }) => {
  const [loading, setLoading] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    try {
      if (!token || !role) throw new Error("Missing credentials");

      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) throw new Error("Token expired");

      if (role !== allowedRole) throw new Error("Unauthorized role");

      setLoading(false);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/';
    }
  }, [allowedRole]);

  return loading ? <LoadingScreen /> : <Outlet />;
};

export default PrivateRoute;
