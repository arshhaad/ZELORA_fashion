import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Login from '../components/Login';
import Register from '../components/Register';
import VerifyEmail from '../components/VerifyEmail';
import ForgotPassword from '../components/ForgotPassword';
import ResetPassword from '../components/ResetPassword';
import { ArrowLeft } from 'lucide-react';

export default function AuthPage({ initialView = 'login' }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState(initialView);

  // If already logged in, redirect straight to target page or Home
  useEffect(() => {
    if (user) {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [user, navigate, location.state]);

  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveView('register');
    } else if (location.pathname === '/login') {
      setActiveView('login');
    } else if (location.pathname === '/verify-email') {
      setActiveView('verify-email');
    } else if (location.pathname === '/forgot-password') {
      setActiveView('forgot-password');
    } else if (location.pathname === '/reset-password') {
      setActiveView('reset-password');
    } else if (location.pathname === '/dashboard') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="zelora-page-wrapper">
      <Navbar />

      <main
        className="main-content"
        style={{
          minHeight: 'calc(100vh - 120px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 16px',
          backgroundColor: '#f7f7f7',
        }}
      >
        <div className="content-container" style={{ width: '100%', maxWidth: '480px' }}>
          {activeView === 'login' && <Login setActiveView={setActiveView} />}
          {activeView === 'register' && <Register setActiveView={setActiveView} />}
          {activeView === 'verify-email' && <VerifyEmail setActiveView={setActiveView} />}
          {activeView === 'forgot-password' && <ForgotPassword setActiveView={setActiveView} />}
          {activeView === 'reset-password' && <ResetPassword setActiveView={setActiveView} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

