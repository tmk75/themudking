using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskManagementAPI.Data;
using TaskManagementAPI.DTOs;
using TaskManagementAPI.Models;

namespace TaskManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskDbContext _context;

        public TasksController(TaskDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks([FromQuery] int? groupId = null, [FromQuery] string username = null)
        {
            // 如果没有提供用户名，返回所有任务
            if (string.IsNullOrEmpty(username) && !groupId.HasValue)
            {
                var allTasks = await _context.Tasks
                    .Select(t => new TaskDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Description = t.Description,
                        Status = t.Status,
                        Priority = t.Priority,
                        Assignee = t.Assignee,
                        DueDate = t.DueDate,
                        CreatedAt = t.CreatedAt,
                        CompletedAt = t.CompletedAt,
                        EstimatedHours = t.EstimatedHours,
                        Tags = DeserializeTags(t.Tags),
                        GroupId = t.GroupId,
                        GroupName = t.UserGroup != null ? t.UserGroup.Name : null,
                        Responsible = t.Responsible,
                        Accountable = t.Accountable,
                        Consulted = t.Consulted,
                        Informed = t.Informed
                    })
                    .ToListAsync();

                return allTasks;
            }

            // 如果提供了组ID，则根据组ID过滤任务
            if (groupId.HasValue)
            {
                var tasksByGroup = await _context.Tasks
                    .Where(t => t.GroupId == groupId.Value)
                    .Select(t => new TaskDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Description = t.Description,
                        Status = t.Status,
                        Priority = t.Priority,
                        Assignee = t.Assignee,
                        DueDate = t.DueDate,
                        CreatedAt = t.CreatedAt,
                        CompletedAt = t.CompletedAt,
                        EstimatedHours = t.EstimatedHours,
                        Tags = DeserializeTags(t.Tags),
                        GroupId = t.GroupId,
                        GroupName = t.UserGroup != null ? t.UserGroup.Name : null,
                        Responsible = t.Responsible,
                        Accountable = t.Accountable,
                        Consulted = t.Consulted,
                        Informed = t.Informed
                    })
                    .ToListAsync();

                return tasksByGroup;
            }

            // 如果提供了用户名，则获取该用户所在的所有组
            var user = await _context.Users
                .Include(u => u.GroupMemberships)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
            {
                return NotFound($"User '{username}' not found");
            }

            // 获取用户所在的所有组ID
            var userGroupIds = user.GroupMemberships.Select(gm => gm.GroupId).ToList();

            // 根据用户所在组过滤任务
            var userTasks = await _context.Tasks
                .Where(t => t.GroupId.HasValue && userGroupIds.Contains(t.GroupId.Value))
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status,
                    Priority = t.Priority,
                    Assignee = t.Assignee,
                    DueDate = t.DueDate,
                    CreatedAt = t.CreatedAt,
                    CompletedAt = t.CompletedAt,
                    EstimatedHours = t.EstimatedHours,
                    Tags = DeserializeTags(t.Tags),
                    GroupId = t.GroupId,
                    GroupName = t.UserGroup != null ? t.UserGroup.Name : null,
                    Responsible = t.Responsible,
                    Accountable = t.Accountable,
                    Consulted = t.Consulted,
                    Informed = t.Informed
                })
                .ToListAsync();

            return userTasks;
        }
        
        /// <summary>
        /// 获取用户所在的所有组
        /// </summary>
        [HttpGet("user-groups/{username}")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserGroups(string username)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
            {
                return NotFound($"User '{username}' not found");
            }

            // 获取用户所在的所有组
            var userGroups = await _context.UserGroupMemberships
                .Where(gm => gm.UserId == user.Id)
                .Join(_context.UserGroups,
                    gm => gm.GroupId,
                    g => g.Id,
                    (gm, g) => new { Id = g.Id, Name = g.Name, Description = g.Description })
                .ToListAsync();

            return userGroups;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetTask(int id)
        {
            var task = await _context.Tasks
                .Include(t => t.UserGroup)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null) return NotFound();

            var taskDto = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Priority = task.Priority,
                Assignee = task.Assignee,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                CompletedAt = task.CompletedAt,
                EstimatedHours = task.EstimatedHours,
                Tags = DeserializeTags(task.Tags),
                GroupId = task.GroupId,
                GroupName = task.UserGroup?.Name,
                Responsible = task.Responsible,
                Accountable = task.Accountable,
                Consulted = task.Consulted,
                Informed = task.Informed
            };

            return taskDto;
        }

        [HttpPost]
        public async Task<ActionResult<TaskDto>> CreateTask(TaskDto taskDto)
        {
            // 验证RACI字段是否来自有效的用户
            if (!await ValidateRaciFields(taskDto))
            {
                return BadRequest("RACI字段包含无效的用户");
            }

            var task = new Models.Task
            {
                Title = taskDto.Title,
                Description = taskDto.Description,
                Status = taskDto.Status,
                Priority = taskDto.Priority,
                Assignee = taskDto.Assignee,
                DueDate = taskDto.DueDate,
                EstimatedHours = taskDto.EstimatedHours,
                Tags = System.Text.Json.JsonSerializer.Serialize(taskDto.Tags),
                GroupId = taskDto.GroupId,
                Responsible = taskDto.Responsible,
                Accountable = taskDto.Accountable,
                Consulted = taskDto.Consulted,
                Informed = taskDto.Informed
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            taskDto.Id = task.Id;
            taskDto.CreatedAt = task.CreatedAt;

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, taskDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskDto taskDto)
        {
            if (id != taskDto.Id) return BadRequest();

            // 验证RACI字段是否来自有效的用户
            if (!await ValidateRaciFields(taskDto))
            {
                return BadRequest("RACI字段包含无效的用户");
            }

            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            task.Title = taskDto.Title;
            task.Description = taskDto.Description;
            task.Status = taskDto.Status;
            task.Priority = taskDto.Priority;
            task.Assignee = taskDto.Assignee;
            task.DueDate = taskDto.DueDate;
            task.EstimatedHours = taskDto.EstimatedHours;
            task.Tags = System.Text.Json.JsonSerializer.Serialize(taskDto.Tags);
            task.GroupId = taskDto.GroupId;
            task.Responsible = taskDto.Responsible;
            task.Accountable = taskDto.Accountable;
            task.Consulted = taskDto.Consulted;
            task.Informed = taskDto.Informed;

            if (task.Status == "done" && task.CompletedAt == null)
            {
                task.CompletedAt = DateTime.UtcNow;
            }
            else if (task.Status != "done")
            {
                task.CompletedAt = null;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// 获取可用于RACI字段的用户列表
        /// </summary>
        [HttpGet("raci-users")]
        public async Task<ActionResult<IEnumerable<UserSelectionDto>>> GetRaciUsers()
        {
            var users = await _context.Users
                .Where(u => u.IsActive)
                .Select(u => new UserSelectionDto
                {
                    Username = u.Username,
                    Name = u.Name,
                    Email = u.Email
                })
                .OrderBy(u => u.Name)
                .ToListAsync();

            return users;
        }

        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }
        
        /// <summary>
        /// 辅助方法：将JSON字符串反序列化为标签列表
        /// </summary>
        private static List<string> DeserializeTags(string json)
        {
            if (string.IsNullOrEmpty(json))
                return new List<string>();
                
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        /// <summary>
        /// 验证RACI字段是否来自有效的用户
        /// </summary>
        private async Task<bool> ValidateRaciFields(TaskDto taskDto)
        {
            var validUsernames = await _context.Users
                .Where(u => u.IsActive)
                .Select(u => u.Username)
                .ToListAsync();

            // 验证Assignee
            if (!string.IsNullOrEmpty(taskDto.Assignee) && !validUsernames.Contains(taskDto.Assignee))
                return false;

            // 验证Responsible
            if (!string.IsNullOrEmpty(taskDto.Responsible) && !validUsernames.Contains(taskDto.Responsible))
                return false;

            // 验证Accountable
            if (!string.IsNullOrEmpty(taskDto.Accountable) && !validUsernames.Contains(taskDto.Accountable))
                return false;

            // 验证Consulted（可能包含多个用户，以逗号分隔）
            if (!string.IsNullOrEmpty(taskDto.Consulted))
            {
                var consultedUsers = taskDto.Consulted.Split(',').Select(u => u.Trim());
                foreach (var user in consultedUsers)
                {
                    if (!validUsernames.Contains(user))
                        return false;
                }
            }

            // 验证Informed（可能包含多个用户，以逗号分隔）
            if (!string.IsNullOrEmpty(taskDto.Informed))
            {
                var informedUsers = taskDto.Informed.Split(',').Select(u => u.Trim());
                foreach (var user in informedUsers)
                {
                    if (!validUsernames.Contains(user))
                        return false;
                }
            }

            return true;
        }
    }
}