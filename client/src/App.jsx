import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CreateEditPost from './pages/CreateEditPost';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* User Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-post" element={<CreateEditPost />} />
            <Route path="/edit-post/:id" element={<CreateEditPost />} />
          </Route>

          {/* Admin Moderation Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all Not Found Route -> Redirect to Home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
