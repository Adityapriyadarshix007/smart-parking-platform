import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import PrivateRoute from './components/PrivateRoute';

// Shared Pages
import LandingPage from './pages/shared/LandingPage';
import Profile from './pages/shared/Profile';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// User Pages
import Dashboard from './pages/user/Dashboard';
import SearchParking from './pages/user/SearchParking';
import BookingHistory from './pages/user/BookingHistory';
import MyMessages from './pages/user/MyMessages';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

// ============ ADMIN PAGES ============
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSlotsPage from './pages/admin/AdminSlotsPage';
import AdminAllBookingsPage from './pages/admin/AdminAllBookingsPage';
import AdminBookingsFilteredPage from './pages/admin/AdminBookingsFilteredPage';
import AdminRevenuePage from './pages/admin/AdminRevenuePage';
import ManageMessages from './pages/admin/ManageMessages';
import ManageUsers from './pages/admin/ManageUsers';
import VerifyListings from './pages/admin/VerifyListings';
import ManageParking from './pages/admin/ManageParking';
import MonitorBookings from './pages/admin/MonitorBookings';
import Reports from './pages/admin/Reports';

// Footer Pages
import AboutUs from './pages/footer/AboutUs';
import Contact from './pages/footer/Contact';
import HelpCenter from './pages/footer/HelpCenter';
import Terms from './pages/footer/Terms';
import Privacy from './pages/footer/Privacy';
import Refund from './pages/footer/Refund';

// Feature Pages
import FeaturesPage from './pages/features/FeaturesPage';
import HowItWorksPage from './pages/how-it-works/HowItWorksPage';

// Styles
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* ===== PUBLIC ROUTES ===== */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* ===== FOOTER PAGES ===== */}
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />

              {/* ===== USER ROUTES ===== */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/search" element={<PrivateRoute><SearchParking /></PrivateRoute>} />
              <Route path="/my-bookings" element={<PrivateRoute><BookingHistory /></PrivateRoute>} />
              <Route path="/my-messages" element={<PrivateRoute><MyMessages /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

              {/* ===== OWNER ROUTES ===== */}
              <Route path="/owner-dashboard" element={<PrivateRoute><OwnerDashboard /></PrivateRoute>} />

              {/* ===== ADMIN ROUTES ===== */}
              {/* Dashboard */}
              <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              
              {/* Revenue */}
              <Route path="/admin/revenue" element={<PrivateRoute><AdminRevenuePage /></PrivateRoute>} />
              
              {/* Bookings */}
              <Route path="/admin/all-bookings" element={<PrivateRoute><AdminAllBookingsPage /></PrivateRoute>} />
              <Route path="/admin/bookings/filtered" element={<PrivateRoute><AdminBookingsFilteredPage /></PrivateRoute>} />
              <Route path="/admin/monitor-bookings" element={<PrivateRoute><MonitorBookings /></PrivateRoute>} />

              {/* Parking Slots */}
              <Route path="/admin/slots" element={<PrivateRoute><AdminSlotsPage /></PrivateRoute>} />
              <Route path="/admin/manage-parking" element={<PrivateRoute><ManageParking /></PrivateRoute>} />

              {/* Reports */}
              <Route path="/admin/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />

              {/* Users */}
              <Route path="/admin/users" element={<PrivateRoute><ManageUsers /></PrivateRoute>} />

              {/* Messages */}
              <Route path="/admin/messages" element={<PrivateRoute><ManageMessages /></PrivateRoute>} />

              {/* Listings */}
              <Route path="/admin/listings" element={<PrivateRoute><VerifyListings /></PrivateRoute>} />

              {/* ===== FALLBACK ===== */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
