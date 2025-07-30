// API 服务
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

// 获取所有任务，可选择按用户名或组ID过滤
export const fetchTasks = async (username = null, groupId = null) => {
  try {
    let url = `${API_BASE_URL}/tasks`;
    const params = new URLSearchParams();
    
    if (username) {
      params.append('username', username);
    }
    
    if (groupId) {
      params.append('groupId', groupId);
    }
    
    // 如果有参数，添加到URL
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// 获取用户所在的所有组
export const fetchUserGroups = async (username) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/user-groups/${username}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user groups:', error);
    throw error;
  }
};

// 获取单个任务
export const fetchTask = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error);
    throw error;
  }
};

// 创建任务
export const createTask = async (taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// 更新任务
export const updateTask = async (id, taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    throw error;
  }
};

// 删除任务
export const deleteTask = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    throw error;
  }
};

// 获取 RACI 用户列表（用于下拉选择）
export const fetchRaciUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/raci-users`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching RACI users:', error);
    throw error;
  }
};

// 用户管理 API

export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

// 用户组管理 API

// 获取用户组
export const fetchGroups = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

// 获取单个用户组
export const fetchGroup = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching group ${id}:`, error);
    throw error;
  }
};

// 创建用户组
export const createGroup = async (groupData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// 更新用户组
export const updateGroup = async (id, groupData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`Error updating group ${id}:`, error);
    throw error;
  }
};

// 删除用户组
export const deleteGroup = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting group ${id}:`, error);
    throw error;
  }
};

// 获取用户组成员
export const fetchGroupUsers = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${id}/users`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching group ${id} users:`, error);
    throw error;
  }
};