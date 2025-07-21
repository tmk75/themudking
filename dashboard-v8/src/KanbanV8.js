import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Plus, Edit2, Trash2, Calendar, User, Clock, TrendingUp, BarChart3, Target, Users, UserCheck, Eye, MessageCircle } from 'lucide-react';

// 确保API路径正确
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

const KanbanV8 = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // API Functions
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      const data = await response.json();
      const formattedTasks = data.map(task => {
        // 格式化日期字段
        const dueDate = task.dueDate ? task.dueDate.split('T')[0] : '';
        const completedAt = task.completedAt ? task.completedAt.split('T')[0] : null;
        
        return {
          ...task,
          dueDate,
          completedAt,
          tags: JSON.parse(task.tags || '[]'),
          raci: JSON.parse(task.raciData || '{}')
        };
      });
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          assignee: taskData.assignee,
          dueDate: taskData.dueDate,
          createdAt: taskData.createdAt,
          completedAt: taskData.completedAt,
          estimatedHours: taskData.estimatedHours,
          tags: JSON.stringify(taskData.tags || []),
          raciData: JSON.stringify(taskData.raci || {})
        })
      });
      const newTask = await response.json();
      setTasks([...tasks, {
        ...newTask,
        tags: JSON.parse(newTask.tags || '[]'),
        raci: JSON.parse(newTask.raciData || '{}')
      }]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null, success: false });

  const updateTask = async (taskData) => {
    try {
      setUpdateStatus({ loading: true, error: null, success: false });

      const response = await fetch(`${API_BASE_URL}/tasks/${taskData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          tags: JSON.stringify(taskData.tags),
          raciData: JSON.stringify(taskData.raci)
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // 更新本地状态
      const updatedTask = {
        ...taskData,
        tags: taskData.tags,
        raci: taskData.raci
      };

      setTasks(tasks.map(task => task.id === taskData.id ? updatedTask : task));
      setUpdateStatus({ loading: false, error: null, success: true });

      // 3秒后清除成功状态
      setTimeout(() => {
        setUpdateStatus(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      console.error('Error updating task:', error);
      setUpdateStatus({ loading: false, error: error.message, success: false });
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const [activeView, setActiveView] = useState('kanban');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-blue-500/20 border-blue-500/30', icon: Clock },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500/20 border-yellow-500/30', icon: TrendingUp },
    { id: 'review', title: 'Review', color: 'bg-purple-500/20 border-purple-500/30', icon: Eye },
    { id: 'done', title: 'Done', color: 'bg-green-500/20 border-green-500/30', icon: UserCheck }
  ];

  const priorityColors = {
    low: 'bg-green-500/20 text-green-300 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-300 border-red-500/30',
    critical: 'bg-red-600/20 text-red-200 border-red-600/30'
  };

  const raciColors = {
    responsible: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    accountable: 'bg-blue-600/20 text-blue-200 border-blue-600/30',
    consulted: 'bg-blue-700/20 text-blue-100 border-blue-700/30',
    informed: 'bg-slate-600/20 text-slate-300 border-slate-600/30'
  };

  const raciRoles = {
    responsible: { label: 'Responsible', color: 'text-blue-300', icon: User },
    accountable: { label: 'Accountable', color: 'text-blue-200', icon: UserCheck },
    consulted: { label: 'Consulted', color: 'text-blue-100', icon: MessageCircle },
    informed: { label: 'Informed', color: 'text-slate-300', icon: Eye }
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
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
      updateTask(updatedTask);
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
    const priorityCounts = ['low', 'medium', 'high', 'critical'].map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      count: tasks.filter(task => task.priority === priority).length
    }));
    return priorityCounts;
  };

  const getRACIDistribution = () => {
    const raciData = {};
    tasks.forEach(task => {
      Object.keys(task.raci).forEach(role => {
        raciData[role] = (raciData[role] || 0) + task.raci[role].length;
      });
    });
    return Object.entries(raciData).map(([role, count]) => ({
      name: raciRoles[role].label,
      count
    }));
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

  const COLORS = ['#3B82F6', '#1E40AF', '#1E3A8A', '#64748B'];

  const TaskCard = ({ task }) => {
    const IconComponent = columns.find(col => col.id === task.status)?.icon || Clock;

    return (
      <div
        className="bg-slate-800 border border-slate-600 rounded-xl p-4 mb-4 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-grab hover:-translate-y-2 hover:border-blue-500 group"
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
      >
        {/* Horizontal Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <IconComponent size={16} className="text-blue-400" />
            </div>
            <h3 className="font-semibold text-white text-sm flex-1">{task.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditingTask(task)}
              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-xs mb-3 leading-relaxed">{task.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>

        {/* RACI Section */}
        <div className="bg-slate-700/50 rounded-lg p-3 mb-3 border border-slate-600">
          <h4 className="text-white text-xs font-semibold mb-2">RACI Matrix</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(task.raci).map(([role, people]) => {
              const roleInfo = raciRoles[role];
              const RoleIcon = roleInfo.icon;
              return (
                <div key={role} className={`p-2 rounded border ${raciColors[role]}`}>
                  <div className="flex items-center gap-1 mb-1">
                    <RoleIcon size={10} />
                    <span className="text-xs font-medium">{roleInfo.label.charAt(0)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {people.slice(0, 2).map((person, index) => (
                      <span key={index} className="text-xs bg-black/20 px-1 rounded">
                        {person.split(' ')[0]}
                      </span>
                    ))}
                    {people.length > 2 && (
                      <span className="text-xs opacity-70">+{people.length - 2}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{task.assignee}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{task.dueDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{task.estimatedHours}h</span>
          </div>
        </div>
      </div>
    );
  };

  const TaskModal = ({ task, onSave, onClose }) => {
    // 处理日期格式，确保dueDate是YYYY-MM-DD格式
    const initialTask = task ? {
      ...task,
      dueDate: task.dueDate ? (task.dueDate.includes('T') ? task.dueDate.split('T')[0] : task.dueDate) : '',
      completedAt: task.completedAt ? (task.completedAt.includes('T') ? task.completedAt.split('T')[0] : task.completedAt) : null
    } : null;
    
    const [formData, setFormData] = useState(initialTask || {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      estimatedHours: 8,
      tags: [],
      raci: {
        responsible: [],
        accountable: [],
        consulted: [],
        informed: []
      }
    });

    const [newTag, setNewTag] = useState('');
    const [raciInputs, setRaciInputs] = useState({
      responsible: '',
      accountable: '',
      consulted: '',
      informed: ''
    });

    const handleSave = () => {
      if (formData.title.trim()) {
        onSave({
          ...formData,
          id: task?.id || Date.now(),
          createdAt: task?.createdAt || new Date().toISOString().split('T')[0],
          completedAt: task?.completedAt || null
        });
      }
    };

    const addTag = () => {
      if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag.trim()]
        });
        setNewTag('');
      }
    };

    const removeTag = (tagToRemove) => {
      setFormData({
        ...formData,
        tags: formData.tags.filter(tag => tag !== tagToRemove)
      });
    };

    const addRACIPerson = (role) => {
      const person = raciInputs[role].trim();
      if (person && !formData.raci[role].includes(person)) {
        setFormData({
          ...formData,
          raci: {
            ...formData.raci,
            [role]: [...formData.raci[role], person]
          }
        });
        setRaciInputs({
          ...raciInputs,
          [role]: ''
        });
      }
    };

    const removeRACIPerson = (role, personToRemove) => {
      setFormData({
        ...formData,
        raci: {
          ...formData.raci,
          [role]: formData.raci[role].filter(person => person !== personToRemove)
        }
      });
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-600">
          <h2 className="text-2xl font-bold text-white mb-6">{task ? 'Edit Task' : 'Add New Task'}</h2>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Assignee</label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Hours</label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-white hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* RACI Matrix */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4">RACI Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(raciRoles).map(([role, roleInfo]) => {
                  const RoleIcon = roleInfo.icon;
                  return (
                    <div key={role} className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <RoleIcon size={16} />
                        {roleInfo.label}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={raciInputs[role]}
                          onChange={(e) => setRaciInputs({ ...raciInputs, [role]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && addRACIPerson(role)}
                          className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add person and press Enter"
                        />
                        <button
                          type="button"
                          onClick={() => addRACIPerson(role)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formData.raci[role].map((person, index) => (
                          <span key={index} className="flex items-center gap-1 px-2 py-1 bg-slate-600 text-white rounded text-sm">
                            {person}
                            <button
                              type="button"
                              onClick={() => removeRACIPerson(role, person)}
                              className="text-white hover:text-red-300"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-600">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Global Care Program Dashboard
            </h1>
            <div className="flex gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-sm">
              <button
                onClick={() => setActiveView('kanban')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeView === 'kanban'
                    ? 'bg-white/20 text-white shadow-lg transform -translate-y-0.5'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                Kanban Board
              </button>
              <button
                onClick={() => setActiveView('reports')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeView === 'reports'
                    ? 'bg-white/20 text-white shadow-lg transform -translate-y-0.5'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                BI Reports
              </button>
              <button
                onClick={() => setActiveView('raci')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeView === 'raci'
                    ? 'bg-white/20 text-white shadow-lg transform -translate-y-0.5'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                RACI Matrix
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeView === 'kanban' ? (
          <div>
            {/* Kanban Header */}
            <div className="flex justify-between items-center mb-6 p-6 bg-slate-800/50 rounded-xl border border-slate-700 shadow-xl backdrop-blur-sm">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Task Board</h2>
                <p className="text-slate-300">
                  {tasks.length} total tasks • {getOverdueTasks().length} overdue • {tasks.filter(t => t.status === 'done').length} completed
                </p>
              </div>
              <button
                onClick={() => setShowAddTask(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <Plus size={20} />
                Add Task
              </button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {columns.map(column => {
                const IconComponent = column.icon;
                return (
                  <div
                    key={column.id}
                    className={`${column.color} rounded-xl p-4 min-h-[600px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-dashed`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <IconComponent size={20} className="text-white" />
                        </div>
                        <h3 className="font-bold text-white text-lg">{column.title}</h3>
                      </div>
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {tasks.filter(task => task.status === column.id).length}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {tasks
                        .filter(task => task.status === column.id)
                        .map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeView === 'raci' ? (
          <div>
            {/* RACI Header */}
            <div className="mb-6 p-6 bg-slate-800/50 rounded-xl border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-2">RACI Responsibility Matrix</h2>
              <p className="text-slate-300">Role assignments and accountability across all tasks</p>
            </div>

            {/* RACI Legend */}
            <div className="mb-6 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">RACI Legend</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(raciRoles).map(([role, roleInfo]) => {
                  const RoleIcon = roleInfo.icon;
                  return (
                    <div key={role} className={`p-4 rounded-lg border ${raciColors[role]}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <RoleIcon size={18} />
                        <span className="font-semibold">{roleInfo.label}</span>
                      </div>
                      <p className="text-xs opacity-80">
                        {role === 'responsible' && 'Does the work'}
                        {role === 'accountable' && 'Signs off on work'}
                        {role === 'consulted' && 'Provides input'}
                        {role === 'informed' && 'Kept in the loop'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RACI Matrix Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="text-left p-4 text-white font-semibold">Task</th>
                      {Object.entries(raciRoles).map(([role, roleInfo]) => (
                        <th key={role} className="text-center p-4 text-white font-semibold min-w-32">
                          <div className="flex items-center justify-center gap-2">
                            <roleInfo.icon size={16} />
                            {roleInfo.label}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id} className="border-t border-slate-600 hover:bg-slate-700/30">
                        <td className="p-4">
                          <div>
                            <div className="font-semibold text-white mb-1">{task.title}</div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <User size={12} />
                              {task.assignee}
                            </div>
                            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${priorityColors[task.priority]}`}>
                              {columns.find(col => col.id === task.status)?.title}
                            </span>
                          </div>
                        </td>

                        {Object.entries(raciRoles).map(([role, roleInfo]) => (
                          <td key={role} className="p-4 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {task.raci[role].map((person, index) => (
                                <span key={index} className={`px-2 py-1 rounded text-xs ${raciColors[role]}`}>
                                  {person}
                                </span>
                              ))}
                              {task.raci[role].length === 0 && (
                                <span className="text-slate-500 text-xs">—</span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Reports Header */}
            <div className="mb-6 p-6 bg-slate-800/50 rounded-xl border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-2">Business Intelligence & RACI Analytics</h2>
              <p className="text-slate-300">Comprehensive insights into project progress and team responsibilities</p>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Tasks by Status */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BarChart3 size={20} className="text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Tasks by Status</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTasksByStatus()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* RACI Distribution */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Users size={20} className="text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">RACI Role Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getRACIDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {getRACIDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Completion Trend */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-700/20 rounded-lg">
                    <TrendingUp size={20} className="text-blue-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Completion Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getCompletionTrend()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                    <Line type="monotone" dataKey="completed" stroke="#1E40AF" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Workload by Assignee */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-600/20 rounded-lg">
                    <User size={20} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Workload by Assignee</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTasksByAssignee()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                    <Bar dataKey="count" fill="#64748B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metrics and Overdue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Metrics */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Clock size={20} className="text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Total Tasks</span>
                    <span className="text-2xl font-bold text-blue-400">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Completed</span>
                    <span className="text-2xl font-bold text-green-400">
                      {tasks.filter(t => t.status === 'done').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">In Progress</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {tasks.filter(t => t.status === 'in-progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Overdue</span>
                    <span className="text-2xl font-bold text-red-400">
                      {getOverdueTasks().length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Total Effort</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {tasks.reduce((sum, task) => sum + task.estimatedHours, 0)}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Overdue Tasks */}
              <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Clock size={20} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Overdue Tasks</h3>
                </div>
                <div className="space-y-3">
                  {getOverdueTasks().length > 0 ? (
                    getOverdueTasks().map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-red-300 mb-1">{task.title}</h4>
                          <p className="text-sm text-red-400">Due: {task.dueDate} • Assigned to: {task.assignee}</p>
                          <div className="text-xs text-red-400 mt-1">
                            Accountable: {task.raci.accountable.join(', ')}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-slate-400">{task.estimatedHours}h</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🎉</div>
                      <p className="text-slate-400">No overdue tasks!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-white text-xl">Loading tasks...</div>
        </div>
      )}

      {/* Modals */}
      {showAddTask && (
        <TaskModal
          task={null}
          onSave={(taskData) => {
            createTask(taskData);
            setShowAddTask(false);
          }}
          onClose={() => setShowAddTask(false)}
        />
      )}

      {editingTask && (
        <TaskModal
          task={editingTask}
          onSave={(updatedTask) => {
            updateTask(updatedTask);
            setEditingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default KanbanV8;