import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Plus, Edit2, Trash2, Calendar, User, Clock, TrendingUp, BarChart3, Target, Users, UserCheck, MessageCircle, Eye, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const KanbanDashboard = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design Homepage', description: 'Create wireframes and mockups', status: 'todo', priority: 'high', assignee: 'John Doe', responsible: 'John Doe', accountable: 'Jane Smith', consulted: ['Bob Wilson'], informed: ['Alice Brown'], group: 'Development', dueDate: '2025-07-20', createdAt: '2025-07-10', completedAt: null },
    { id: 2, title: 'Setup Database', description: 'Configure PostgreSQL database', status: 'in-progress', priority: 'medium', assignee: 'Jane Smith', responsible: 'Jane Smith', accountable: 'Charlie Davis', consulted: ['John Doe'], informed: ['Bob Wilson'], group: 'Development', dueDate: '2025-07-18', createdAt: '2025-07-08', completedAt: null },
    { id: 3, title: 'User Authentication', description: 'Implement login system', status: 'review', priority: 'high', assignee: 'Bob Wilson', responsible: 'Bob Wilson', accountable: 'John Doe', consulted: ['Jane Smith'], informed: ['Charlie Davis'], group: 'Security', dueDate: '2025-07-16', createdAt: '2025-07-05', completedAt: null },
    { id: 4, title: 'API Documentation', description: 'Document REST endpoints', status: 'done', priority: 'low', assignee: 'Alice Brown', responsible: 'Alice Brown', accountable: 'Bob Wilson', consulted: ['Charlie Davis'], informed: ['John Doe'], group: 'Documentation', dueDate: '2025-07-15', createdAt: '2025-07-01', completedAt: '2025-07-14' },
    { id: 5, title: 'Mobile Responsive', description: 'Make app mobile-friendly', status: 'todo', priority: 'medium', assignee: 'Charlie Davis', responsible: 'Charlie Davis', accountable: 'Alice Brown', consulted: ['John Doe'], informed: ['Jane Smith'], group: 'Design', dueDate: '2025-07-25', createdAt: '2025-07-12', completedAt: null },
  ]);
  
  const [users, setUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('all');

  const [activeView, setActiveView] = useState('kanban');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-blue-50 border-blue-200' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'review', title: 'Review', color: 'bg-purple-50 border-purple-200' },
    { id: 'done', title: 'Done', color: 'bg-green-50 border-green-200' }
  ];

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedTask) {
      const updatedTask = {
        ...draggedTask,
        status,
        completedAt: status === 'done' ? new Date().toISOString().split('T')[0] : null
      };
      setTasks(tasks.map(task =>
        task.id === draggedTask.id ? updatedTask : task
      ));
      setDraggedTask(null);
    }
  };

  // BI Analytics Functions
  const getTasksByStatus = () => {
    const statusCounts = columns.map(col => ({
      name: col.title,
      count: tasks.filter(task => task.status === col.id).length
    }));
    return statusCounts;
  };

  const getTasksByPriority = () => {
    const priorityCounts = ['low', 'medium', 'high'].map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      count: tasks.filter(task => task.priority === priority).length
    }));
    return priorityCounts;
  };

  const getTasksByAssignee = () => {
    const assigneeCounts = {};
    tasks.forEach(task => {
      assigneeCounts[task.assignee] = (assigneeCounts[task.assignee] || 0) + 1;
    });
    return Object.entries(assigneeCounts).map(([name, count]) => ({ name, count }));
  };

  const getCompletionTrend = () => {
    const completedTasks = tasks.filter(task => task.completedAt);
    const trendData = {};

    completedTasks.forEach(task => {
      const date = task.completedAt;
      trendData[date] = (trendData[date] || 0) + 1;
    });

    return Object.entries(trendData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({ date, completed: count }));
  };

  const getOverdueTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task =>
      task.status !== 'done' &&
      task.dueDate &&
      task.dueDate < today
    );
  };

  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'];

  const TaskCard = ({ task }) => (
    <div
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 text-sm">{task.title}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setEditingTask(task)}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-xs mb-3">{task.description}</p>

      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <User size={12} />
          <span>{task.assignee}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        {task.group && (
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
            {task.group}
          </span>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={12} />
            <span>{task.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );

  const TaskModal = ({ task, onSave, onClose }) => {
    // 确保consulted和informed字段是数组
    const processTask = (taskData) => {
      if (!taskData) return null;
      
      // 处理consulted字段
      let consulted = taskData.consulted || [];
      if (typeof consulted === 'string') {
        consulted = consulted.split(',').filter(item => item.trim() !== '');
      }
      
      // 处理informed字段
      let informed = taskData.informed || [];
      if (typeof informed === 'string') {
        informed = informed.split(',').filter(item => item.trim() !== '');
      }
      
      return {
        ...taskData,
        consulted,
        informed
      };
    };
    
    const [formData, setFormData] = useState(processTask(task) || {
      title: '', 
      description: '', 
      status: 'todo', 
      priority: 'medium', 
      assignee: '', 
      responsible: '',
      accountable: '',
      consulted: [],
      informed: [],
      group: '',
      dueDate: ''
    });

    // Handle multi-select for consulted and informed
    const [consultedUser, setConsultedUser] = useState('');
    const [informedUser, setInformedUser] = useState('');

    const handleSave = () => {
      if (formData.title.trim()) {
        onSave(formData);
      }
    };

    const addConsultedUser = () => {
      if (consultedUser && !formData.consulted.includes(consultedUser)) {
        setFormData({
          ...formData,
          consulted: [...(formData.consulted || []), consultedUser]
        });
        setConsultedUser('');
      }
    };

    const removeConsultedUser = (user) => {
      setFormData({
        ...formData,
        consulted: formData.consulted.filter(u => u !== user)
      });
    };

    const addInformedUser = () => {
      if (informedUser && !formData.informed.includes(informedUser)) {
        setFormData({
          ...formData,
          informed: [...(formData.informed || []), informedUser]
        });
        setInformedUser('');
      }
    };

    const removeInformedUser = (user) => {
      setFormData({
        ...formData,
        informed: formData.informed.filter(u => u !== user)
      });
    };

    // Get all available groups
    const availableGroups = getAvailableGroups().filter(g => g !== 'all');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">{task ? 'Edit Task' : 'Add New Task'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <select
                value={formData.group || ''}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a group</option>
                {availableGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-medium text-gray-800 mb-3">RACI Assignment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsible (R)
                  </label>
                  <select
                    value={formData.responsible || ''}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accountable (A)
                  </label>
                  <select
                    value={formData.accountable || ''}
                    onChange={(e) => setFormData({ ...formData, accountable: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consulted (C)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={consultedUser}
                      onChange={(e) => setConsultedUser(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select user</option>
                      {users.map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addConsultedUser}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.consulted && formData.consulted.map((user, index) => (
                      <span key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                        {user}
                        <button
                          type="button"
                          onClick={() => removeConsultedUser(user)}
                          className="text-blue-600 hover:text-red-500"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Informed (I)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={informedUser}
                      onChange={(e) => setInformedUser(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select user</option>
                      {users.map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addInformedUser}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.informed && formData.informed.map((user, index) => (
                      <span key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                        {user}
                        <button
                          type="button"
                          onClick={() => removeInformedUser(user)}
                          className="text-blue-600 hover:text-red-500"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={formData.assignee || ''}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select user</option>
                {users.map(user => (
                  <option key={user.id} value={user.name}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fetch users for dropdowns
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 从API获取用户数据
        console.log('Fetching users from API...');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users`);
        if (response.ok) {
          const data = await response.json();
          console.log('Users fetched successfully:', data);
          setUsers(data);
        } else {
          console.error('API request failed:', response.status, response.statusText);
          alert('Failed to fetch users from API. Please check your API connection.');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Error connecting to API. Please check your network connection.');
      }
    };
    
    // 立即执行一次获取用户数据
    fetchUsers();
    
    // 不使用默认用户数据，确保所有数据都来自API
  }, []);
  
  // Get all available groups from tasks and users
  const getAvailableGroups = () => {
    const groupSet = new Set();
    
    // Add groups from tasks
    tasks.forEach(task => {
      if (task.group) {
        groupSet.add(task.group);
      }
    });
    
    // Add groups from users
    users.forEach(user => {
      if (user.groups) {
        user.groups.forEach(group => groupSet.add(group));
      }
    });
    
    return ['all', ...Array.from(groupSet)];
  };
  
  // Filter tasks by selected group
  const getFilteredTasks = () => {
    if (selectedGroup === 'all') {
      return tasks;
    }
    
    // If user is logged in, filter by their groups
    if (currentUser && currentUser.groups) {
      // If viewing a specific group, show only tasks from that group
      if (selectedGroup !== 'all') {
        return tasks.filter(task => task.group === selectedGroup);
      }
      
      // Otherwise show tasks from all groups the user belongs to
      return tasks.filter(task => 
        currentUser.groups.includes(task.group)
      );
    }
    
    return tasks;
  };
  
  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          {/* User info and navigation */}
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-xl font-bold text-blue-600">GCPD</Link>
              <nav className="flex gap-4">
                <Link to="/" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
                <Link to="/users" className="text-gray-600 hover:text-blue-600">Users</Link>
              </nav>
            </div>
            {currentUser && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Logged in as <span className="font-medium">{currentUser.name}</span>
                </span>
                <button 
                  onClick={onLogout}
                  className="text-gray-600 hover:text-red-600 flex items-center gap-1"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Dashboard header */}
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">Project Management Dashboard</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('kanban')}
                className={`px-4 py-2 rounded-md transition-colors ${activeView === 'kanban'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Kanban Board
              </button>
              <button
                onClick={() => setActiveView('reports')}
                className={`px-4 py-2 rounded-md transition-colors ${activeView === 'reports'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                BI Reports
              </button>
              <Link
                to="/v8"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Try v8 (RACI)
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeView === 'kanban' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Task Board</h2>
                <span className="text-sm text-gray-500">
                  {filteredTasks.length} total tasks • {getOverdueTasks().length} overdue
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <label htmlFor="group-filter" className="mr-2 text-sm text-gray-600">Group:</label>
                  <select
                    id="group-filter"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {getAvailableGroups().map(group => (
                      <option key={group} value={group}>
                        {group === 'all' ? 'All Groups' : group}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Task
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {columns.map(column => (
                <div
                  key={column.id}
                  className={`rounded-lg border-2 border-dashed p-4 min-h-96 ${column.color}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">{column.title}</h3>
                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm">
                      {tasks.filter(task => task.status === column.id).length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {tasks
                      .filter(task => task.status === column.id)
                      .map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Business Intelligence Reports</h2>
              <p className="text-gray-600">Analytics and insights for your project management</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="text-blue-500" size={20} />
                  <h3 className="text-lg font-semibold">Tasks by Status</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTasksByStatus()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="text-green-500" size={20} />
                  <h3 className="text-lg font-semibold">Priority Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getTasksByPriority()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {getTasksByPriority().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-purple-500" size={20} />
                  <h3 className="text-lg font-semibold">Completion Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getCompletionTrend()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="text-orange-500" size={20} />
                  <h3 className="text-lg font-semibold">Tasks by Assignee</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTasksByAssignee()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-red-500" size={20} />
                  <h3 className="text-lg font-semibold">Key Metrics</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Tasks</span>
                    <span className="font-semibold text-2xl">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-2xl text-green-600">
                      {tasks.filter(t => t.status === 'done').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-semibold text-2xl text-blue-600">
                      {tasks.filter(t => t.status === 'in-progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overdue</span>
                    <span className="font-semibold text-2xl text-red-600">
                      {getOverdueTasks().length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Overdue Tasks</h3>
                <div className="space-y-3">
                  {getOverdueTasks().length > 0 ? (
                    getOverdueTasks().map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div>
                          <h4 className="font-medium text-red-800">{task.title}</h4>
                          <p className="text-sm text-red-600">Due: {task.dueDate} • Assigned to: {task.assignee}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No overdue tasks! 🎉</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddTask && (
        <TaskModal
          task={null}
          onSave={(taskData) => {
            const task = {
              id: Date.now(),
              ...taskData,
              createdAt: new Date().toISOString().split('T')[0],
              completedAt: null
            };
            setTasks([...tasks, task]);
            setShowAddTask(false);
          }}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {editingTask && (
        <TaskModal
          task={editingTask}
          onSave={(updatedTask) => {
            setTasks(tasks.map(task =>
              task.id === updatedTask.id ? updatedTask : task
            ));
            setEditingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default KanbanDashboard;