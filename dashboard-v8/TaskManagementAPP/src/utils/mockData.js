// 模拟数据处理工具
// 当API不可用时，提供模拟数据

// 模拟任务数据
export const mockTasks = [
  { 
    id: 1, 
    title: 'Design Homepage', 
    description: 'Create wireframes and mockups', 
    status: 'todo', 
    priority: 'high', 
    assignee: 'John Doe', 
    responsible: 'John Doe', 
    accountable: 'Jane Smith', 
    consulted: ['Bob Wilson'], 
    informed: ['Alice Brown'], 
    group: 'Development', 
    dueDate: '2025-07-20', 
    createdAt: '2025-07-10', 
    completedAt: null,
    tags: ['Design', 'Frontend', 'UX'],
    raciData: JSON.stringify({
      responsible: ['John Doe'],
      accountable: ['Jane Smith'],
      consulted: ['Bob Wilson'],
      informed: ['Alice Brown']
    })
  },
  { 
    id: 2, 
    title: 'Setup Database', 
    description: 'Configure PostgreSQL database', 
    status: 'in-progress', 
    priority: 'medium', 
    assignee: 'Jane Smith', 
    responsible: 'Jane Smith', 
    accountable: 'Charlie Davis', 
    consulted: ['John Doe'], 
    informed: ['Bob Wilson'], 
    group: 'Development', 
    dueDate: '2025-07-18', 
    createdAt: '2025-07-08', 
    completedAt: null,
    tags: ['Backend', 'Database', 'Migration'],
    raciData: JSON.stringify({
      responsible: ['Jane Smith'],
      accountable: ['Charlie Davis'],
      consulted: ['John Doe'],
      informed: ['Bob Wilson']
    })
  },
  { 
    id: 3, 
    title: 'User Authentication', 
    description: 'Implement login system', 
    status: 'review', 
    priority: 'high', 
    assignee: 'Bob Wilson', 
    responsible: 'Bob Wilson', 
    accountable: 'John Doe', 
    consulted: ['Jane Smith'], 
    informed: ['Charlie Davis'], 
    group: 'Security', 
    dueDate: '2025-07-16', 
    createdAt: '2025-07-05', 
    completedAt: null,
    tags: ['Security', 'Authentication', 'Backend'],
    raciData: JSON.stringify({
      responsible: ['Bob Wilson'],
      accountable: ['John Doe'],
      consulted: ['Jane Smith'],
      informed: ['Charlie Davis']
    })
  },
  { 
    id: 4, 
    title: 'API Documentation', 
    description: 'Document REST endpoints', 
    status: 'done', 
    priority: 'low', 
    assignee: 'Alice Brown', 
    responsible: 'Alice Brown', 
    accountable: 'Bob Wilson', 
    consulted: ['Charlie Davis'], 
    informed: ['John Doe'], 
    group: 'Documentation', 
    dueDate: '2025-07-15', 
    createdAt: '2025-07-01', 
    completedAt: '2025-07-14',
    tags: ['Documentation', 'API', 'Portal'],
    raciData: JSON.stringify({
      responsible: ['Alice Brown'],
      accountable: ['Bob Wilson'],
      consulted: ['Charlie Davis'],
      informed: ['John Doe']
    })
  },
  { 
    id: 5, 
    title: 'Mobile Responsive', 
    description: 'Make app mobile-friendly', 
    status: 'todo', 
    priority: 'medium', 
    assignee: 'Charlie Davis', 
    responsible: 'Charlie Davis', 
    accountable: 'Alice Brown', 
    consulted: ['John Doe'], 
    informed: ['Jane Smith'], 
    group: 'Design', 
    dueDate: '2025-07-25', 
    createdAt: '2025-07-12', 
    completedAt: null,
    tags: ['Mobile', 'Responsive', 'Frontend'],
    raciData: JSON.stringify({
      responsible: ['Charlie Davis'],
      accountable: ['Alice Brown'],
      consulted: ['John Doe'],
      informed: ['Jane Smith']
    })
  }
];

// 模拟用户数据
export const mockUsers = [
  { id: 1, name: 'John Doe', username: 'john', email: 'john@example.com', groups: ['Development', 'Management'] },
  { id: 2, name: 'Jane Smith', username: 'jane', email: 'jane@example.com', groups: ['Design', 'Marketing'] },
  { id: 3, name: 'Bob Wilson', username: 'bob', email: 'bob@example.com', groups: ['Development', 'Security'] },
  { id: 4, name: 'Alice Brown', username: 'alice', email: 'alice@example.com', groups: ['QA', 'Documentation'] },
  { id: 5, name: 'Charlie Davis', username: 'charlie', email: 'charlie@example.com', groups: ['Management', 'Design'] },
  { id: 6, name: 'Carol Johnson', username: 'carol', email: 'carol@example.com', groups: ['Development', 'Management'] },
  { id: 7, name: 'Admin User', username: 'admin', email: 'admin@example.com', groups: ['Management', 'Development', 'Security'] }
];

// 模拟用户组数据
export const mockGroups = [
  { id: 1, name: 'Development', description: 'Development team responsible for software development and technical implementation' },
  { id: 2, name: 'Design', description: 'Design team responsible for UI/UX design and user experience' },
  { id: 3, name: 'QA', description: 'QA team responsible for testing and quality control' },
  { id: 4, name: 'Management', description: 'Management team responsible for project management and decision making' },
  { id: 5, name: 'Marketing', description: 'Marketing team responsible for product promotion and marketing strategies' },
  { id: 6, name: 'Support', description: 'Support team responsible for customer service and technical support' },
  { id: 7, name: 'Security', description: 'Security team responsible for system security and risk control' },
  { id: 8, name: 'Documentation', description: 'Documentation team responsible for technical documentation and user manuals' }
];

// 模拟API调用函数
export const mockFetch = async (url, options = {}) => {
  console.log(`Mock API call to: ${url}`);
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 处理不同的API端点
  if (url.includes('/api/tasks')) {
    if (options.method === 'GET') {
      return {
        ok: true,
        json: async () => mockTasks
      };
    } else if (options.method === 'POST') {
      const newTask = JSON.parse(options.body);
      newTask.id = Date.now();
      return {
        ok: true,
        json: async () => newTask
      };
    } else if (options.method === 'PUT') {
      return {
        ok: true,
        json: async () => ({})
      };
    } else if (options.method === 'DELETE') {
      return {
        ok: true,
        json: async () => ({})
      };
    }
  } else if (url.includes('/api/users')) {
    return {
      ok: true,
      json: async () => mockUsers
    };
  } else if (url.includes('/api/groups')) {
    return {
      ok: true,
      json: async () => mockGroups
    };
  } else if (url.includes('/api/auth/login')) {
    const { username, password } = JSON.parse(options.body);
    const user = mockUsers.find(u => u.username === username);
    
    if (user) {
      return {
        ok: true,
        json: async () => ({
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          groups: user.groups
        })
      };
    } else {
      return {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid credentials' })
      };
    }
  }
  
  // 默认返回404
  return {
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: async () => ({ message: 'Not Found' })
  };
};

// 包装fetch函数，在API调用失败时使用模拟数据
export const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
    console.warn(`API call failed: ${url}. Using mock data instead.`);
    return mockFetch(url, options);
  } catch (error) {
    console.error(`API call error: ${error.message}. Using mock data instead.`);
    return mockFetch(url, options);
  }
};