import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import KanbanDashboard from './KanbanDashboard';
import KanbanV8 from './KanbanV8';
import Login from './Login';
import UserManagement from './UserManagement';

// 创建用户上下文
export const UserContext = createContext(null);

// 用户认证提供者组件
const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 初始化时从 localStorage 加载用户数据
  useEffect(() => {
    console.log('AuthProvider: Checking if user is logged in...');
    const storedUser = localStorage.getItem('currentUser');
    console.log('AuthProvider: Stored user data:', storedUser);
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('AuthProvider: Parsed user data:', userData);
        
        // 简单验证：确保用户数据包含必要的字段
        if (userData && userData.username) {
          console.log('AuthProvider: User already logged in:', userData.username);
          setCurrentUser(userData);
        } else {
          console.warn('AuthProvider: Invalid user data in localStorage - missing username');
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('AuthProvider: Error parsing stored user data:', error);
        localStorage.removeItem('currentUser');
      }
    } else {
      console.log('AuthProvider: No user data found in localStorage');
    }
    
    setLoading(false);
  }, []);
  
  // 登录函数
  const login = (userData) => {
    console.log('AuthProvider: Login with user data:', userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setCurrentUser(userData);
  };
  
  // 登出函数
  const logout = () => {
    console.log('AuthProvider: Logging out');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };
  
  // 提供认证上下文
  const value = {
    currentUser,
    login,
    logout,
    loading
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 使用认证上下文的钩子
export const useAuth = () => {
  return useContext(UserContext);
};

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute: Current user:', currentUser);
  console.log('ProtectedRoute: Loading state:', loading);
  
  // 如果正在加载，显示加载状态
  if (loading) {
    console.log('ProtectedRoute: Still loading, showing loading state');
    return <div>Loading...</div>;
  }
  
  // 如果没有用户登录，重定向到登录页面
  if (!currentUser) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  console.log('ProtectedRoute: User authenticated, rendering protected content');
  return children;
};

// 登录页面组件
const LoginPage = () => {
  const { login } = useAuth();
  
  return <Login onLogin={login} />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <KanbanV8 />
            </ProtectedRoute>
          } />
          <Route path="/v8" element={
            <ProtectedRoute>
              <KanbanV8 />
            </ProtectedRoute>
          } />
          <Route path="/legacy" element={
            <ProtectedRoute>
              <KanbanDashboard />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;