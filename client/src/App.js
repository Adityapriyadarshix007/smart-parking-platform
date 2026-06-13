import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/shared/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/user/Dashboard';
import SearchParking from './pages/user/SearchParking';
import BookingHistory from './pages/user/BookingHistory';
import MyMessages from './pages/user/MyMessages';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/shared/Profile';
import ManageMessages from './pages/admin/ManageMessages';
import ManageUsers from './pages/admin/ManageUsers';
import VerifyListings from './pages/admin/VerifyListings';
import ManageParking from './pages/admin/ManageParking';
// Footer Pages
import AboutUs from './pages/footer/AboutUs';
import Contact from './pages/footer/Contact';
import HelpCenter from './pages/footer/HelpCenter';
import Terms from './pages/footer/Terms';
import Privacy from './pages/footer/Privacy';
import Refund from './pages/footer/Refund';
import FeaturesPage from './pages/features/FeaturesPage';
import HowItWorksPage from './pages/how-it-works/HowItWorksPage';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/search" element={<PrivateRoute><SearchParking /></PrivateRoute>} />
              <Route path="/my-bookings" element={<PrivateRoute><BookingHistory /></PrivateRoute>} />
              <Route path="/my-messages" element={<PrivateRoute><MyMessages /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              
              {/* Owner Routes */}
              <Route path="/owner-dashboard" element={<PrivateRoute><OwnerDashboard /></PrivateRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute><ManageUsers /></PrivateRoute>} />
              <Route path="/admin/messages" element={<PrivateRoute><ManageMessages /></PrivateRoute>} />
              <Route path="/admin/listings" element={<PrivateRoute><VerifyListings /></PrivateRoute>} />
              <Route path="/admin/manage-parking" element={<PrivateRoute><ManageParking /></PrivateRoute>} />
              
              {/* Footer Routes */}
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
