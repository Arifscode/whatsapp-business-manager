import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import FinancePage from './pages/FinancePage';
import PackagingPage from './pages/PackagingPage';
import OrderFormPage from './pages/OrderFormPage';

// Layout
import BottomNav from './components/BottomNav';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function OperatorLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {children}
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/order" element={<OrderFormPage />} />

      {/* Operator routes — protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <OperatorLayout>
              <HomePage />
            </OperatorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <OperatorLayout>
              <ProductsPage />
            </OperatorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OperatorLayout>
              <OrdersPage />
            </OperatorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <OperatorLayout>
              <FinancePage />
            </OperatorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/packaging"
        element={
          <ProtectedRoute>
            <OperatorLayout>
              <PackagingPage />
            </OperatorLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
