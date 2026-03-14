// src/App.js
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import Loader from './components/common/Loader';

// Pages (eager for top-level)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy-load heavy pages
const About = lazy(() => import('./pages/About'));
const WhyUs = lazy(() => import('./pages/WhyUs'));
const Contact = lazy(() => import('./pages/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// User dashboards
const UserDashboard = lazy(() => import('./dashboards/user/UserDashboard'));
const ColorRecommendationPage = lazy(() => import('./dashboards/user/ColorRecommendationPage'));
const UserHistory = lazy(() => import('./dashboards/user/UserHistory'));

// Manufacturer dashboards
const ManufacturerDashboard = lazy(() => import('./dashboards/manufacturer/ManufacturerDashboard'));
const ManufacturerPredictionPage = lazy(() => import('./dashboards/manufacturer/ManufacturerPredictionPage'));
const ProductionQualityPage = lazy(() => import('./dashboards/manufacturer/ProductionQualityPage'));

// Brand dashboards
const BrandDashboard = lazy(() => import('./dashboards/brand/BrandAnalyticsDashboard'));
const BrandCollaborationPage = lazy(() => import('./dashboards/brand/BrandCollaborationPage'));
const MarketInsights = lazy(() => import('./dashboards/brand/MarketInsights'));
const BrandAdsPage = lazy(() => import('./dashboards/brand/BrandAdsPage'));

// New pages
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const BrandSubscription = lazy(() => import('./pages/BrandSubscription'));

// Admin product approvals
const ManageProducts = lazy(() => import('./dashboards/admin/ManageProducts'));

// Admin dashboards
const AdminDashboard = lazy(() => import('./dashboards/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('./dashboards/admin/ManageUsers'));
const ManageModels = lazy(() => import('./dashboards/admin/ManageModels'));
const SystemAnalytics = lazy(() => import('./dashboards/admin/SystemAnalytics'));
const ManageAds = lazy(() => import('./dashboards/admin/ManageAds'));
const ContactSubmissions = lazy(() => import('./dashboards/admin/ContactSubmissions'));

const getDashboard = (role) => {
  const map = {
    user: '/user/dashboard',
    manufacturer: '/manufacturer/dashboard',
    brand: '/brand/dashboard',
    admin: '/admin/dashboard'
  };
  return map[role] || '/';
};

// Protected route — requires login + optional role check
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userProfile, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && userProfile?.role && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to={getDashboard(userProfile.role)} replace />;
  }
  return children;
};

// Auth route — redirect to home if already logged in
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) return <Loader />;

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/why-us" element={<WhyUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Auth (redirect to / if logged in) */}
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

        {/* Profile (any logged-in user) */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* User */}
        <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
        <Route path="/user/recommend" element={<ProtectedRoute allowedRoles={['user']}><ColorRecommendationPage /></ProtectedRoute>} />
        <Route path="/user/history" element={<ProtectedRoute allowedRoles={['user']}><UserHistory /></ProtectedRoute>} />

        {/* Manufacturer */}
        <Route path="/manufacturer/dashboard" element={<ProtectedRoute allowedRoles={['manufacturer']}><ManufacturerDashboard /></ProtectedRoute>} />
        <Route path="/manufacturer/predict" element={<ProtectedRoute allowedRoles={['manufacturer']}><ManufacturerPredictionPage /></ProtectedRoute>} />
        <Route path="/manufacturer/quality" element={<ProtectedRoute allowedRoles={['manufacturer']}><ProductionQualityPage /></ProtectedRoute>} />

        {/* Brand */}
        <Route path="/brand/dashboard" element={<ProtectedRoute allowedRoles={['brand']}><BrandDashboard /></ProtectedRoute>} />
        <Route path="/brand/collaboration" element={<ProtectedRoute allowedRoles={['brand']}><BrandCollaborationPage /></ProtectedRoute>} />
        <Route path="/brand/insights" element={<ProtectedRoute allowedRoles={['brand']}><MarketInsights /></ProtectedRoute>} />
        <Route path="/brand/ads" element={<ProtectedRoute allowedRoles={['brand']}><BrandAdsPage /></ProtectedRoute>} />

        {/* Public product pages */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/brand-partners" element={<BrandSubscription />} />

        {/* User orders */}
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/models" element={<ProtectedRoute allowedRoles={['admin']}><ManageModels /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><SystemAnalytics /></ProtectedRoute>} />
        <Route path="/admin/ads" element={<ProtectedRoute allowedRoles={['admin']}><ManageAds /></ProtectedRoute>} />
        <Route path="/admin/contact" element={<ProtectedRoute allowedRoles={['admin']}><ContactSubmissions /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><ManageProducts /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}