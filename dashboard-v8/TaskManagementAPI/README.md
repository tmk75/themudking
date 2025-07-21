# Task Management API - .NET 8 WebAPI

这是一个基于.NET 8的任务管理系统后端API，支持前端React应用的任务管理功能。

## 功能特性

- ✅ 完整的CRUD操作（创建、读取、更新、删除任务）
- ✅ MySQL 5.7数据库支持
- ✅ Swagger API文档
- ✅ CORS支持前端React应用
- ✅ RACI矩阵数据存储
- ✅ 任务标签和优先级管理

## 技术栈

- .NET 8 WebAPI
- Entity Framework Core 8.0
- MySQL 5.7 (Pomelo.EntityFrameworkCore.MySql)
- Swagger/OpenAPI

## 快速开始

### 1. 数据库配置

1. 确保MySQL 5.7已安装并运行
2. 修改 `appsettings.json` 中的数据库连接字符串：
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TaskManagement;Uid=root;Pwd=your_password;Port=3306;"
  }
}
```

3. 执行数据库初始化脚本：
```sql
-- 在MySQL中执行 create_database.sql 文件
mysql -u root -p < create_database.sql
```

### 2. 运行API

```bash
# 进入API目录
cd TaskManagementAPI

# 还原NuGet包
dotnet restore

# 运行应用
dotnet run
```

API将在 `http://localhost:5000` 启动

### 3. 访问Swagger文档

打开浏览器访问：`http://localhost:5000/swagger`

## API端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/tasks` | 获取所有任务 |
| GET | `/api/tasks/{id}` | 获取指定任务 |
| POST | `/api/tasks` | 创建新任务 |
| PUT | `/api/tasks/{id}` | 更新任务 |
| DELETE | `/api/tasks/{id}` | 删除任务 |

## 数据模型

```json
{
  "id": 1,
  "title": "任务标题",
  "description": "任务描述",
  "status": "todo|in-progress|review|done",
  "priority": "low|medium|high|critical",
  "assignee": "负责人",
  "dueDate": "2025-07-20",
  "createdAt": "2025-07-10T00:00:00Z",
  "completedAt": null,
  "estimatedHours": 8,
  "tags": "[\"标签1\", \"标签2\"]",
  "raciData": "{\"responsible\": [\"人员1\"], \"accountable\": [\"人员2\"]}"
}
```

## 前端集成

前端React应用需要修改API基础URL：
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 宝塔面板MySQL配置

如果使用宝塔面板的MySQL：

1. 在宝塔面板中创建数据库 `TaskManagement`
2. 修改连接字符串中的端口（通常是3306）
3. 确保MySQL服务正在运行
4. 检查防火墙设置允许3306端口

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否运行
   - 验证连接字符串中的用户名和密码
   - 确认数据库已创建

2. **CORS错误**
   - 确保前端运行在 `http://localhost:3000`
   - 检查Program.cs中的CORS配置

3. **端口冲突**
   - 修改launchSettings.json中的端口配置
   - 或使用 `dotnet run --urls="http://localhost:5001"`

## 开发环境

- Visual Studio 2022 或 VS Code
- .NET 8 SDK
- MySQL 5.7+
- Node.js (用于前端React应用)