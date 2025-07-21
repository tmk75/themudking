-- 创建数据库
CREATE DATABASE IF NOT EXISTS TaskManagement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE TaskManagement;

-- 创建Tasks表
CREATE TABLE IF NOT EXISTS Tasks (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description VARCHAR(1000),
    Status VARCHAR(20) NOT NULL DEFAULT 'todo',
    Priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    Assignee VARCHAR(100),
    DueDate DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CompletedAt TIMESTAMP NULL,
    EstimatedHours INT DEFAULT 8,
    Tags JSON,
    RaciData JSON
);

-- 插入示例数据
INSERT INTO Tasks (Title, Description, Status, Priority, Assignee, DueDate, EstimatedHours, Tags, RaciData) VALUES
('Design Homepage UI/UX', 'Create wireframes, mockups and user experience flows for the main landing page', 'todo', 'high', 'John Doe', '2025-07-20', 16, 
 '["Design", "Frontend", "UX"]', 
 '{"responsible": ["John Doe", "Sarah Wilson"], "accountable": ["Mike Chen"], "consulted": ["Alice Brown", "David Kim"], "informed": ["Team Lead", "Product Manager"]}'),

('Database Schema Migration', 'Configure PostgreSQL database with new user authentication tables and relationships', 'in-progress', 'medium', 'Jane Smith', '2025-07-18', 12,
 '["Backend", "Database", "Migration"]',
 '{"responsible": ["Jane Smith"], "accountable": ["Tech Lead"], "consulted": ["DBA Team", "Security Team"], "informed": ["Development Team", "QA Team"]}'),

('User Authentication System', 'Implement secure login system with JWT tokens and multi-factor authentication', 'review', 'high', 'Bob Wilson', '2025-07-16', 20,
 '["Security", "Authentication", "Backend"]',
 '{"responsible": ["Bob Wilson"], "accountable": ["Security Lead"], "consulted": ["Security Team", "Frontend Team"], "informed": ["All Teams", "Stakeholders"]}'),

('API Documentation Portal', 'Document all REST endpoints with interactive examples and testing interface', 'done', 'low', 'Alice Brown', '2025-07-15', 8,
 '["Documentation", "API", "Portal"]',
 '{"responsible": ["Alice Brown"], "accountable": ["Tech Writer"], "consulted": ["Backend Team", "Frontend Team"], "informed": ["External Partners", "Support Team"]}'),

('Mobile Responsive Layout', 'Optimize application layout for mobile devices and tablets with touch interactions', 'todo', 'medium', 'Charlie Davis', '2025-07-25', 14,
 '["Mobile", "Responsive", "Frontend"]',
 '{"responsible": ["Charlie Davis", "UI Team"], "accountable": ["Frontend Lead"], "consulted": ["UX Designer", "QA Team"], "informed": ["Product Team", "Marketing"]}');