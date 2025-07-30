using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagementAPI.Data;
using TaskManagementAPI.Models;
using TaskManagementAPI.DTOs;

namespace TaskManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly TaskDbContext _context;

        public GroupsController(TaskDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetGroups()
        {
            var groups = await _context.UserGroups
                .Select(g => new {
                    g.Id,
                    g.Name,
                    g.Description,
                    g.CreatedAt,
                    g.UpdatedAt,
                    UserCount = _context.UserGroupMemberships.Count(um => um.GroupId == g.Id),
                    TaskCount = _context.Tasks.Count(t => t.GroupId == g.Id)
                })
                .ToListAsync();
            
            return Ok(groups);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetGroup(int id)
        {
            var group = await _context.UserGroups
                .Where(g => g.Id == id)
                .Select(g => new {
                    g.Id,
                    g.Name,
                    g.Description,
                    g.CreatedAt,
                    g.UpdatedAt,
                    UserCount = _context.UserGroupMemberships.Count(um => um.GroupId == g.Id),
                    TaskCount = _context.Tasks.Count(t => t.GroupId == g.Id)
                })
                .FirstOrDefaultAsync();
            
            if (group == null) return NotFound();
            return Ok(group);
        }

        [HttpPost]
        public async Task<ActionResult<UserGroup>> CreateGroup(UserGroup group)
        {
            _context.UserGroups.Add(group);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetGroup), new { id = group.Id }, group);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGroup(int id, UserGroup group)
        {
            if (id != group.Id) return BadRequest();
            
            var existingGroup = await _context.UserGroups.FindAsync(id);
            if (existingGroup == null) return NotFound();
            
            existingGroup.Name = group.Name;
            existingGroup.Description = group.Description;
            existingGroup.UpdatedAt = DateTime.UtcNow;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GroupExists(id)) return NotFound();
                throw;
            }
            
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            var group = await _context.UserGroups.FindAsync(id);
            if (group == null) return NotFound();
            
            // 检查是否有关联的任务
            var taskCount = await _context.Tasks.CountAsync(t => t.GroupId == id);
            if (taskCount > 0)
            {
                return BadRequest(new { message = "无法删除用户组，该用户组下还有任务" });
            }
            
            // 删除用户组成员关系
            var memberships = await _context.UserGroupMemberships
                .Where(um => um.GroupId == id)
                .ToListAsync();
            _context.UserGroupMemberships.RemoveRange(memberships);
            
            // 删除用户组
            _context.UserGroups.Remove(group);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }

        [HttpGet("{id}/users")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetGroupUsers(int id)
        {
            var group = await _context.UserGroups.FindAsync(id);
            if (group == null) return NotFound();

            var users = await _context.UserGroupMemberships
                .Where(ugm => ugm.GroupId == id)
                .Join(_context.Users,
                    ugm => ugm.UserId,
                    u => u.Id,
                    (ugm, u) => new UserDto
                    {
                        Id = u.Id,
                        Name = u.Name,
                        Username = u.Username,
                        Email = u.Email,
                        IsActive = u.IsActive,
                        Groups = new List<string> { group.Name }
                    })
                .ToListAsync();

            return Ok(users);
        }

        private bool GroupExists(int id)
        {
            return _context.UserGroups.Any(e => e.Id == id);
        }
    }
}