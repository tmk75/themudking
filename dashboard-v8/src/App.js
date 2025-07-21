import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import KanbanDashboard from './KanbanDashboard';
import KanbanV8 from './KanbanV8';
import Login from './Login';
import UserManagement from './UserManagement';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);
  
  const handleLogin = (userData) => {
    setCurrentUser(userData);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };
  
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/" element={
          <ProtectedRoute>
            <KanbanDashboard currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/v8" element={
          <ProtectedRoute>
            <KanbanV8 currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <UserManagement currentUser={currentUser} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;