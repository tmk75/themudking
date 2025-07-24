import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { fetchUsers, createUser, updateUser, deleteUser, fetchGroups } from './utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTermState] = useState('');
  
  const setSearchTerm = (value) => {
    console.log('setSearchTerm called with:', value);
    console.trace('Call stack:');
    setSearchTermState(value);
  };
  
  // 调试searchTerm变化
  useEffect(() => {
    console.log('searchTerm changed to:', searchTerm);
  }, [searchTerm]);
  const [groups, setGroups] = useState([]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersData, groupsData] = await Promise.all([
        fetchUsers(),
        fetchGroups()
      ]);
      console.log('Loaded users data:', usersData);
      console.log('Loaded groups data:', groupsData);
      setUsers(usersData);
      setFilteredUsers([...usersData]);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      await loadUsers();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      const userId = editingUser?.id;
      if (!userId) {
        throw new Error('No user ID found for update');
      }
      const { id, ...updateData } = userData;
      await updateUser(userId, updateData);
      await loadUsers();
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const UserModal = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      groups: user?.groups || []
    });
    const [selectedGroups, setSelectedGroups] = useState(user?.groups || []);

    const handleSave = () => {
      if (formData.name && formData.username && formData.email && (user || formData.password)) {
        onSave({
          ...formData,
          groups: selectedGroups
        });
      }
    };

    const toggleGroup = (groupName) => {
      setSelectedGroups(prev => 
        prev.includes(groupName)
          ? prev.filter(g => g !== groupName)
          : [...prev, groupName]
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {user ? 'Edit User' : 'Add User'}
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-4">
            <input
              id="modal-name-input"
              name="modalName"
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              id="modal-username-input"
              name="modalUsername"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!user}
            />
            <input
              id="modal-email-input"
              name="modalEmail"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              id="modal-password-input"
              name="modalPassword"
              type="password"
              placeholder={user ? "New Password (optional)" : "Password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Groups</label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {groups.map(group => (
                  <label key={group.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.name)}
                      onChange={() => toggleGroup(group.name)}
                      className="rounded"
                    />
                    <span className="text-sm">{group.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {user ? 'Update' : 'Create'}
            </button>
          </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h1>
          <div className="flex gap-2">
            <a
              href="/groups"
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
            >
              用户组管理
            </a>
            <a
              href="/"
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
            >
              返回看板
            </a>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            id="user-search-input"
            name="userSearch"
            type="text"
            placeholder="Search users..."
            value={searchTerm || ''}
            onChange={(e) => {
              console.log('Search input onChange triggered with:', e.target.value);
              setSearchTerm(e.target.value);
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Groups</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{user.username}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  <div className="flex flex-wrap gap-1">
                    {user.groups && user.groups.length > 0 ? (
                      user.groups.map((group, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                          {group}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingUser(user);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
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

      {showModal && (
        <UserModal
          user={editingUser}
          onSave={editingUser ? handleUpdateUser : handleCreateUser}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;