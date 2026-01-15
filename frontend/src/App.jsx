import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudyChat from './pages/StudyChat';
import Courses from './pages/Courses';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Notes from './pages/Notes';
import CourseViewer from './pages/CourseViewer';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role or to home
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/study"
            element={
              <PrivateRoute>
                <StudyChat />
              </PrivateRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <PrivateRoute>
                <Notes />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <Courses />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <PrivateRoute>
                <CourseViewer />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner"
            element={
              <PrivateRoute allowedRoles={['owner']}>
                <OwnerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['admin', 'owner']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
