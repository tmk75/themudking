import React, { useState, useEffect } from 'react';
import { fetchRaciUsers } from '../utils/api';

// 单选用户下拉组件 - 仅允许从下拉列表中选择
export const UserSelect = ({ value, onChange, placeholder = "Select User" }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchRaciUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load user list');
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      disabled={loading}
    >
      <option value="">{loading ? 'Loading...' : placeholder}</option>
      {error && <option value="" disabled>{error}</option>}
      {users.map((user) => (
        <option key={user.username} value={user.username}>
          {user.name} ({user.username})
        </option>
      ))}
    </select>
  );
};

// 多选用户下拉组件 - 仅允许从下拉列表中选择
export const MultiUserSelect = ({ value = '', onChange, placeholder = "Select User" }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentValue, setCurrentValue] = useState('');

  // 将逗号分隔的字符串转换为数组
  useEffect(() => {
    if (value) {
      setSelectedUsers(value.split(',').map(v => v.trim()).filter(Boolean));
    } else {
      setSelectedUsers([]);
    }
  }, [value]);

  // 加载用户列表
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchRaciUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load user list');
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Add用户
  const addUser = (username) => {
    if (username && !selectedUsers.includes(username)) {
      const newSelectedUsers = [...selectedUsers, username];
      setSelectedUsers(newSelectedUsers);
      onChange(newSelectedUsers.join(','));
      setCurrentValue('');
    }
  };

  // 移除用户
  const removeUser = (username) => {
    const newSelectedUsers = selectedUsers.filter(u => u !== username);
    setSelectedUsers(newSelectedUsers);
    onChange(newSelectedUsers.join(','));
  };

  // 获取用户显示名称
  const getUserDisplayName = (username) => {
    const user = users.find(u => u.username === username);
    return user ? `${user.name} (${user.username})` : username;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="">{loading ? 'Loading...' : placeholder}</option>
          {error && <option value="" disabled>{error}</option>}
          {users
            .filter(user => !selectedUsers.includes(user.username))
            .map((user) => (
              <option key={user.username} value={user.username}>
                {user.name} ({user.username})
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={() => addUser(currentValue)}
          disabled={!currentValue}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          添加
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((username) => (
          <span key={username} className="flex items-center gap-1 px-2 py-1 bg-slate-600 text-white rounded text-sm">
            {getUserDisplayName(username)}
            <button
              type="button"
              onClick={() => removeUser(username)}
              className="text-white hover:text-red-300 ml-1"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};