import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavigationBar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Chat from './pages/Chat';
import ChatPage from './pages/ChatPage';
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import Checkout from "./pages/Checkout";
import RentCheckout from "./pages/RentCheckout";


function App() {
  return (
    <AuthProvider>
      <Router>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/rent-checkout" element={<RentCheckout />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
