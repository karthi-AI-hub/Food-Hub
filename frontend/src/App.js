import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import RoleSelection from './pages/RoleSelection';
import LoginStudent from './pages/Auth/LoginStudent';
import LoginCanteen from './pages/Auth/LoginCanteen';
import RegisterStudent from './pages/Auth/RegisterStudent';

import StudentMenu from './pages/Student/Menu';
import StudentOrders from './pages/Student/Orders';
import StudentProfile from './pages/Student/Profile';
import CartPage from './pages/Student/CartPage';

import CanteenOrders from './pages/Canteen/OrderManagement';
import MenuManagement from './pages/Canteen/MenuManagement';
import ReportDashboard from './pages/Canteen/ReportsDashboard';

import StudentBottomNav from './components/StudentBottomNav';
import CanteenBottomNav from './components/CanteenBottomNav';
import PrivateRoute from './components/PrivateRoute';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
    <ToastContainer position="top-center" autoClose={1000} />
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login/student" element={<LoginStudent />} />
        <Route path="/login/canteen" element={<LoginCanteen />} />
        <Route path="/register/student" element={<RegisterStudent />} />

        <Route element={<PrivateRoute allowedRole="student" />}>
          <Route path="/menu" element={<><StudentMenu /><StudentBottomNav /></>} />
          <Route path="/orders" element={<><StudentOrders /><StudentBottomNav /></>} />
          <Route path="/cart" element={<><CartPage /><StudentBottomNav /></>} />
          <Route path="/profile" element={<><StudentProfile rollNo={localStorage.getItem('roll_no')} /><StudentBottomNav /></>} />
        </Route>

        <Route element={<PrivateRoute allowedRole="canteen" />}>
          <Route path="/dashboard" element={<><ReportDashboard /><CanteenBottomNav /></>} />
          <Route path="/canteen-orders" element={<><CanteenOrders /><CanteenBottomNav /></>} />
          <Route path="/canteen-menu" element={<><MenuManagement /><CanteenBottomNav /></>} />
        </Route>
      </Routes>
    </Router>
    </CartProvider>
  );
}

export default App;
