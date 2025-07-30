import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Login attempt with:', { username, password });
      
      // 清理旧的localStorage数据
      localStorage.removeItem('currentUser');
      
      // 使用模拟数据登录，因为后端可能没有实现登录 API
      // 在实际项目中，应该使用后端 API
      const mockUserData = {
        id: 1,
        username: username,
        name: username,
        email: `${username}@example.com`,
        groups: ['Development', 'Management']
      };
      
      console.log('User data:', mockUserData);
      
      // 存储用户数据到 localStorage
      localStorage.setItem('currentUser', JSON.stringify(mockUserData));
      console.log('User data stored in localStorage');
      
      // 验证数据是否正确存储
      const storedData = localStorage.getItem('currentUser');
      console.log('Verification - data in localStorage:', storedData);
      
      // 调用 onLogin 回调函数
      onLogin(mockUserData);
      console.log('onLogin callback called');
      
      // 重定向到看板页面
      navigate('/v8');
      console.log('Navigation triggered');
      
      /* 
      // 如果后端已经实现了登录 API，可以使用以下代码
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const userData = await response.json();
      console.log('API response user data:', userData);
      
      // 存储用户数据到 localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      console.log('User data stored in localStorage');
      
      // 验证数据是否正确存储
      const storedData = localStorage.getItem('currentUser');
      console.log('Verification - data in localStorage:', storedData);
      
      // 调用 onLogin 回调函数
      onLogin(userData);
      console.log('onLogin callback called');
      
      // 重定向到看板页面
      navigate('/v8');
      console.log('Navigation triggered');
      */
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-white">GCPD Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;