import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Loader2 } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import DashboardOverview from './pages/DashboardOverview';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Marketing from './pages/Marketing';
import Settings from './pages/Settings';

function AuthGuard() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-800 font-sans">
      <Sidebar />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
