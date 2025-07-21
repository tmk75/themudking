import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        // For demo purposes, use mock data if API fails
        setUsers([
          { id: 1, name: 'John Doe', email: 'john@example.com', groups: ['Development', 'Management'] },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', groups: ['Design', 'Marketing'] },
          { id: 3, name: 'Bob Wilson', email: 'bob@example.com', groups: ['Development'] },
          { id: 4, name: 'Alice Brown', email: 'alice@example.com', groups: ['QA', 'Support'] },
          { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', groups: ['Management'] },
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use mock data for demo
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', groups: ['Development', 'Management'] },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', groups: ['Design', 'Marketing'] },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', groups: ['Development'] },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', groups: ['QA', 'Support'] },
        { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', groups: ['Management'] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Create user
  const createUser = async (userData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
      } else {
        // For demo purposes, create a mock user
        const newUser = {
          id: Date.now(),
          ...userData
        };
        setUsers([...users, newUser]);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      // For demo purposes, create a mock user
      const newUser = {
        id: Date.now(),
        ...userData
      };
      setUsers([...users, newUser]);
    }
  };

  // Update user
  const updateUser = async (userData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        setUsers(users.map(user => user.id === userData.id ? userData : user));
      } else {
        // For demo purposes, update the user locally
        setUsers(users.map(user => user.id === userData.id ? userData : user));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      // For demo purposes, update the user locally
      setUsers(users.map(user => user.id === userData.id ? userData : user));
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setUsers(users.filter(user => user.id !== userId));
        } else {
          // For demo purposes, delete the user locally
          setUsers(users.filter(user => user.id !== userId));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        // For demo purposes, delete the user locally
        setUsers(users.filter(user => user.id !== userId));
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const UserModal = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState(user || {
      name: '',
      email: '',
      password: '',
      groups: []
    });
    const [newGroup, setNewGroup] = useState('');
    const [availableGroups] = useState(['Development', 'Design', 'QA', 'Management', 'Marketing', 'Support']);

    const handleSave = () => {
      if (formData.name && formData.email) {
        onSave(formData);
      }
    };

    const addGroup = () => {
      if (newGroup && !formData.groups.includes(newGroup)) {
        setFormData({
          ...formData,
          groups: [...formData.groups, newGroup]
        });
        setNewGroup('');
      }
    };

    const removeGroup = (groupToRemove) => {
      setFormData({
        ...formData,
        groups: formData.groups.filter(group => group !== groupToRemove)
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {user ? 'Edit User' : 'Add New User'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password {user ? '(Leave blank to keep current)' : ''}
              </label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required={!user}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Groups
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select a group</option>
                  {availableGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addGroup}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.groups && formData.groups.map((group, index) => (
                  <span key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm">
                    {group}
                    <button
                      type="button"
                      onClick={() => removeGroup(group)}
                      className="text-blue-600 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Save User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h1>
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Groups
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex flex-wrap gap-1">
                        {user.groups && user.groups.map((group, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-xs">
                            {group}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddUser && (
        <UserModal
          user={null}
          onSave={(userData) => {
            createUser(userData);
            setShowAddUser(false);
          }}
          onClose={() => setShowAddUser(false)}
        />
      )}

      {editingUser && (
        <UserModal
          user={editingUser}
          onSave={(userData) => {
            updateUser(userData);
            setEditingUser(null);
          }}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;