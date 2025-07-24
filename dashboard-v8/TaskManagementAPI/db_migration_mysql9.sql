-- ===================================
-- 数据库迁移脚本
-- 适配 MySQL 9.3.0
-- 创建表结构和种子数据
-- ===================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS TaskManagement CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE TaskManagement;

-- 暂时禁用外键检查，以便于删除和创建表
SET FOREIGN_KEY_CHECKS = 0;

-- ===================================
-- 1. 删除现有表（按照依赖关系的反序）
-- ===================================

-- 删除视图
DROP VIEW IF EXISTS UserWithGroups;
DROP VIEW IF EXISTS TaskDetails;

-- 删除存储过程
DROP PROCEDURE IF EXISTS AuthenticateUser;

-- 删除表
DROP TABLE IF EXISTS UserGroupMemberships;
DROP TABLE IF EXISTS Tasks;
DROP TABLE IF EXISTS UserGroups;
DROP TABLE IF EXISTS Users;

-- ===================================
-- 2. 创建表结构
-- ===================================

-- 创建用户表
CREATE TABLE Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL COMMENT '用户真实姓名',
    Username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录用户名',
    Email VARCHAR(255) NOT NULL UNIQUE COMMENT '邮箱地址',
    PasswordHash VARCHAR(255) NOT NULL COMMENT '密码哈希值',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    IsActive BOOLEAN DEFAULT TRUE COMMENT '是否激活',
    INDEX idx_username (Username),
    INDEX idx_email (Email),
    INDEX idx_active (IsActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';

-- 创建用户组表
CREATE TABLE UserGroups (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE COMMENT '组名',
    Description VARCHAR(500) COMMENT '组描述',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_name (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户组表';

-- 创建任务表
CREATE TABLE Tasks (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL COMMENT '任务标题',
    Description VARCHAR(1000) COMMENT '任务描述',
    Status ENUM('todo', 'in-progress', 'review', 'done') NOT NULL DEFAULT 'todo' COMMENT '状态',
    Priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' COMMENT '优先级',
    Assignee VARCHAR(100) COMMENT '指派给',
    DueDate DATE COMMENT '截止日期',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    CompletedAt TIMESTAMP NULL COMMENT '完成时间',
    EstimatedHours INT DEFAULT 8 COMMENT '预计工时',
    Tags JSON COMMENT '标签',
    RaciData JSON COMMENT 'RACI数据',
    GroupId INT COMMENT '所属组ID',
    Responsible VARCHAR(100) COMMENT '负责人',
    Accountable VARCHAR(100) COMMENT '问责人',
    Consulted TEXT COMMENT '咨询人员（逗号分隔）',
    Informed TEXT COMMENT '知情人员（逗号分隔）',
    FOREIGN KEY (GroupId) REFERENCES UserGroups(Id) ON DELETE SET NULL,
    INDEX idx_status (Status),
    INDEX idx_priority (Priority),
    INDEX idx_assignee (Assignee),
    INDEX idx_due_date (DueDate),
    INDEX idx_group_id (GroupId),
    INDEX idx_responsible (Responsible),
    INDEX idx_accountable (Accountable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='任务表';

-- 创建用户-组关联表
CREATE TABLE UserGroupMemberships (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL COMMENT '用户ID',
    GroupId INT NOT NULL COMMENT '组ID',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (GroupId) REFERENCES UserGroups(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_group (UserId, GroupId),
    INDEX idx_user_id (UserId),
    INDEX idx_group_id (GroupId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户组成员关系表';

-- ===================================
-- 3. 创建视图和存储过程
-- ===================================

-- 用户及其所属组的视图
CREATE VIEW UserWithGroups AS
SELECT 
    u.Id as UserId,
    u.Name as UserName,
    u.Username as UserLoginName,
    u.Email as UserEmail,
    u.IsActive as UserIsActive,
    u.CreatedAt as UserCreatedAt,
    COALESCE(GROUP_CONCAT(g.Name ORDER BY g.Name SEPARATOR ','), '') as UserGroups
FROM Users u
LEFT JOIN UserGroupMemberships ugm ON u.Id = ugm.UserId
LEFT JOIN UserGroups g ON ugm.GroupId = g.Id
WHERE u.IsActive = TRUE
GROUP BY u.Id, u.Name, u.Username, u.Email, u.IsActive, u.CreatedAt;

-- 任务详细信息视图
CREATE VIEW TaskDetails AS
SELECT 
    t.*,
    COALESCE(g.Name, 'No Group') as GroupName,
    COALESCE(g.Description, '') as GroupDescription
FROM Tasks t
LEFT JOIN UserGroups g ON t.GroupId = g.Id;

-- 用户认证存储过程
DELIMITER //
CREATE PROCEDURE AuthenticateUser(
    IN p_username VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
    IN p_password_hash VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
)
BEGIN
    SELECT 
        u.Id,
        u.Name,
        u.Username,
        u.Email,
        u.IsActive,
        COALESCE(GROUP_CONCAT(g.Name ORDER BY g.Name SEPARATOR ','), '') as UserGroups
    FROM Users u
    LEFT JOIN UserGroupMemberships ugm ON u.Id = ugm.UserId
    LEFT JOIN UserGroups g ON ugm.GroupId = g.Id
    WHERE u.Username = p_username COLLATE utf8mb4_0900_ai_ci
      AND u.PasswordHash = p_password_hash COLLATE utf8mb4_0900_ai_ci
      AND u.IsActive = TRUE
    GROUP BY u.Id, u.Name, u.Username, u.Email, u.IsActive;
END //
DELIMITER ;

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- ===================================
-- 4. 插入种子数据
-- ===================================

-- 插入用户组数据
INSERT INTO UserGroups (Name, Description) VALUES
('Development', '开发团队，负责软件开发和技术实现'),
('Design', '设计团队，负责UI/UX设计和用户体验'),
('QA', '质量保证团队，负责测试和质量控制'),
('Management', '管理团队，负责项目管理和决策'),
('Marketing', '市场团队，负责产品推广和市场策略'),
('Support', '支持团队，负责客户服务和技术支持'),
('Security', '安全团队，负责系统安全和风险控制'),
('Documentation', '文档团队，负责技术文档和用户手册');

-- 插入用户数据
-- 密码123456的MD5哈希值：e10adc3949ba59abbe56e057f20f883e
INSERT INTO Users (Name, Username, Email, PasswordHash) VALUES
('Carol Johnson', 'carol', 'carol@example.com', 'e10adc3949ba59abbe56e057f20f883e'),
('John Doe', 'john', 'john@example.com', 'e10adc3949ba59abbe56e057f20f883e'),
('Jane Smith', 'jane', 'jane@example.com', 'e10adc3949ba59abbe56e057f20f883e'),
('Bob Wilson', 'bob', 'bob@example.com', 'e10adc3949ba59abbe56e057f20f883e'),
('Alice Brown', 'alice', 'alice@example.com', 'e10adc3949ba59abbe56e057f20f883e'),
('Charlie Davis', 'charlie', 'charlie@example.com', 'e10adc3949ba59abbe56e057f20f883e'),
('Admin User', 'admin', 'admin@example.com', 'e10adc3949ba59abbe56e057f20f883e');

-- 为用户分配组
-- Carol用户分配到Development和Management组
INSERT INTO UserGroupMemberships (UserId, GroupId) 
SELECT u.Id, g.Id FROM Users u, UserGroups g 
WHERE (u.Username = 'carol' AND g.Name IN ('Development', 'Management'))
   OR (u.Username = 'john' AND g.Name IN ('Development'))
   OR (u.Username = 'jane' AND g.Name IN ('Design', 'Marketing'))
   OR (u.Username = 'bob' AND g.Name IN ('Development', 'Security'))
   OR (u.Username = 'alice' AND g.Name IN ('QA', 'Documentation'))
   OR (u.Username = 'charlie' AND g.Name IN ('Management', 'Design'))
   OR (u.Username = 'admin' AND g.Name IN ('Management', 'Development', 'Security'));

-- 插入任务数据
INSERT INTO Tasks (Title, Description, Status, Priority, Assignee, DueDate, EstimatedHours, Tags, RaciData, GroupId, Responsible, Accountable, Consulted, Informed) VALUES
('Design Homepage UI/UX', 'Create wireframes, mockups and user experience flows for the main landing page', 'todo', 'high', 'John Doe', '2025-07-20', 16, 
 JSON_ARRAY('Design', 'Frontend', 'UX'), 
 JSON_OBJECT(
   'responsible', JSON_ARRAY('John Doe'),
   'accountable', JSON_ARRAY('Carol Johnson'),
   'consulted', JSON_ARRAY('Jane Smith', 'Bob Wilson'),
   'informed', JSON_ARRAY('Alice Brown', 'Charlie Davis')
 ),
 (SELECT Id FROM UserGroups WHERE Name = 'Development'),
 'John Doe',
 'Carol Johnson',
 'Jane Smith,Bob Wilson',
 'Alice Brown,Charlie Davis'),

('Database Schema Migration', 'Configure PostgreSQL database with new user authentication tables and relationships', 'in-progress', 'medium', 'Jane Smith', '2025-07-18', 12,
 JSON_ARRAY('Backend', 'Database', 'Migration'),
 JSON_OBJECT(
   'responsible', JSON_ARRAY('Jane Smith'),
   'accountable', JSON_ARRAY('Carol Johnson'),
   'consulted', JSON_ARRAY('John Doe', 'Bob Wilson'),
   'informed', JSON_ARRAY('Alice Brown', 'Admin User')
 ),
 (SELECT Id FROM UserGroups WHERE Name = 'Development'),
 'Jane Smith',
 'Carol Johnson',
 'John Doe,Bob Wilson',
 'Alice Brown,Admin User'),

('User Authentication System', 'Implement secure login system with JWT tokens and multi-factor authentication', 'review', 'high', 'Bob Wilson', '2025-07-16', 20,
 JSON_ARRAY('Security', 'Authentication', 'Backend'),
 JSON_OBJECT(
   'responsible', JSON_ARRAY('Bob Wilson'),
   'accountable', JSON_ARRAY('Admin User'),
   'consulted', JSON_ARRAY('Carol Johnson', 'Jane Smith'),
   'informed', JSON_ARRAY('John Doe', 'Alice Brown')
 ),
 (SELECT Id FROM UserGroups WHERE Name = 'Security'),
 'Bob Wilson',
 'Admin User',
 'Carol Johnson,Jane Smith',
 'John Doe,Alice Brown'),

('API Documentation Portal', 'Document all REST endpoints with interactive examples and testing interface', 'done', 'low', 'Alice Brown', '2025-07-15', 8,
 JSON_ARRAY('Documentation', 'API', 'Portal'),
 JSON_OBJECT(
   'responsible', JSON_ARRAY('Alice Brown'),
   'accountable', JSON_ARRAY('Carol Johnson'),
   'consulted', JSON_ARRAY('John Doe', 'Jane Smith'),
   'informed', JSON_ARRAY('Bob Wilson', 'Charlie Davis')
 ),
 (SELECT Id FROM UserGroups WHERE Name = 'Documentation'),
 'Alice Brown',
 'Carol Johnson',
 'John Doe,Jane Smith',
 'Bob Wilson,Charlie Davis'),

('Mobile Responsive Layout', 'Optimize application layout for mobile devices and tablets with touch interactions', 'todo', 'medium', 'Charlie Davis', '2025-07-25', 14,
 JSON_ARRAY('Mobile', 'Responsive', 'Frontend'),
 JSON_OBJECT(
   'responsible', JSON_ARRAY('Charlie Davis'),
   'accountable', JSON_ARRAY('Carol Johnson'),
   'consulted', JSON_ARRAY('Jane Smith', 'John Doe'),
   'informed', JSON_ARRAY('Alice Brown', 'Bob Wilson')
 ),
 (SELECT Id FROM UserGroups WHERE Name = 'Design'),
 'Charlie Davis',
 'Carol Johnson',
 'Jane Smith,John Doe',
 'Alice Brown,Bob Wilson');

-- ===================================
-- 5. 验证数据
-- ===================================

-- 检查carol用户是否创建成功
SELECT 'Carol用户创建检查' as CheckType, COUNT(*) as Count 
FROM Users WHERE Username = 'carol';

-- 检查用户组数量
SELECT '用户组创建检查' as CheckType, COUNT(*) as Count 
FROM UserGroups;

-- 检查carol用户的组分配
SELECT 'Carol用户组分配检查' as CheckType, 
       u.Username, 
       u.Name,
       u.Email,
       COALESCE(GROUP_CONCAT(g.Name ORDER BY g.Name SEPARATOR ', '), 'No Groups') as UserGroups
FROM Users u
LEFT JOIN UserGroupMemberships ugm ON u.Id = ugm.UserId
LEFT JOIN UserGroups g ON ugm.GroupId = g.Id
WHERE u.Username = 'carol'
GROUP BY u.Id, u.Username, u.Name, u.Email;

-- 检查任务数据
SELECT '任务数据检查' as CheckType, COUNT(*) as Count 
FROM Tasks;

-- 测试carol用户登录
SELECT '=== Carol用户登录测试 ===' as Info;
CALL AuthenticateUser('carol', 'e10adc3949ba59abbe56e057f20f883e');

-- 显示所有用户信息
SELECT '=== 所有用户信息 ===' as Info;
SELECT Id, Name, Username, Email, IsActive, CreatedAt FROM Users ORDER BY Id;

-- 显示carol用户的详细信息
SELECT '=== Carol用户详细信息 ===' as Info;
SELECT * FROM UserWithGroups WHERE UserLoginName = 'carol';

-- 显示所有用户组
SELECT '=== 所有用户组 ===' as Info;
SELECT Id, Name, Description FROM UserGroups ORDER BY Name;

-- 显示任务统计
SELECT '=== 任务统计信息 ===' as Info;
SELECT 
    COUNT(*) as TotalTasks,
    COUNT(CASE WHEN GroupId IS NOT NULL THEN 1 END) as TasksWithGroup,
    COUNT(CASE WHEN Responsible IS NOT NULL THEN 1 END) as TasksWithResponsible,
    COUNT(CASE WHEN Accountable IS NOT NULL THEN 1 END) as TasksWithAccountable
FROM Tasks;

-- ===================================
-- 6. 添加 MySQL 9.3.0 特有的功能
-- ===================================

-- 创建一个任务搜索函数，使用全文搜索
CREATE FULLTEXT INDEX idx_task_search ON Tasks(Title, Description);

-- 创建一个任务搜索存储过程
DELIMITER //
CREATE PROCEDURE SearchTasks(
    IN p_search_term VARCHAR(255)
)
BEGIN
    SELECT 
        t.*,
        MATCH(t.Title, t.Description) AGAINST(p_search_term IN NATURAL LANGUAGE MODE) as Relevance
    FROM Tasks t
    WHERE MATCH(t.Title, t.Description) AGAINST(p_search_term IN NATURAL LANGUAGE MODE)
    ORDER BY Relevance DESC;
END //
DELIMITER ;

-- 创建一个获取用户任务的存储过程
DELIMITER //
CREATE PROCEDURE GetUserTasks(
    IN p_username VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
)
BEGIN
    SELECT 
        t.*,
        g.Name as GroupName
    FROM Tasks t
    LEFT JOIN UserGroups g ON t.GroupId = g.Id
    WHERE t.Assignee = p_username COLLATE utf8mb4_0900_ai_ci
       OR t.Responsible = p_username COLLATE utf8mb4_0900_ai_ci
       OR t.Accountable = p_username COLLATE utf8mb4_0900_ai_ci
       OR FIND_IN_SET(p_username COLLATE utf8mb4_0900_ai_ci, REPLACE(t.Consulted, ' ', '')) > 0
       OR FIND_IN_SET(p_username COLLATE utf8mb4_0900_ai_ci, REPLACE(t.Informed, ' ', '')) > 0
    ORDER BY 
        CASE 
            WHEN t.Status = 'todo' THEN 1
            WHEN t.Status = 'in-progress' THEN 2
            WHEN t.Status = 'review' THEN 3
            WHEN t.Status = 'done' THEN 4
            ELSE 5
        END,
        t.Priority DESC,
        t.DueDate;
END //
DELIMITER ;

-- 测试新增的存储过程
SELECT '=== 测试任务搜索 ===' as Info;
CALL SearchTasks('Authentication');

SELECT '=== 测试获取用户任务 ===' as Info;
CALL GetUserTasks('john');

-- ===================================
-- 脚本执行完成
-- ===================================

SELECT '=== 数据库迁移和种子数据创建完成 ===' as Status, NOW() as CompletedAt;