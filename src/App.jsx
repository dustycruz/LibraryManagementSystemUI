import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import BorrowHistory from './pages/BorrowHistory';
import ManageBorrows from './pages/ManageBorrows';
import Reports from './pages/Reports';
import OverdueBooks from './pages/OverdueBooks';
import Users from './pages/Users';

const pageAnimationStyle = `
  @keyframes pageFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .page-animate {
    animation: pageFadeIn 0.25s ease both;
  }
`;

function AnimatedPage({ children }) {
  const { pathname } = useLocation();
  return (
    <div className="page-animate" key={pathname}>
      {children}
    </div>
  );
}

function AppLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <AnimatedPage>{children}</AnimatedPage>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/books" element={
        <ProtectedRoute>
          <AppLayout><Books /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/books/add" element={
        <ProtectedRoute roles={['Admin', 'Librarian']}>
          <AppLayout><AddBook /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/books/edit/:id" element={
        <ProtectedRoute roles={['Admin', 'Librarian']}>
          <AppLayout><EditBook /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/my-history" element={
        <ProtectedRoute>
          <AppLayout><BorrowHistory /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/borrows" element={
        <ProtectedRoute roles={['Admin', 'Librarian']}>
          <AppLayout><ManageBorrows /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute roles={['Admin', 'Librarian']}>
          <AppLayout><Reports /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/overdue-books" element={
        <ProtectedRoute roles={['Admin', 'Librarian']}>
          <AppLayout><OverdueBooks /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute roles={['Admin']}>
          <AppLayout><Users /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <style>{pageAnimationStyle}</style>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}