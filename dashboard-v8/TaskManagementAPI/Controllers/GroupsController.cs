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
        public async Task<ActionResult<IEnumerable<UserGroup>>> GetGroups()
        {
            return await _context.UserGroups.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserGroup>> GetGroup(int id)
        {
            var group = await _context.UserGroups.FindAsync(id);
            if (group == null) return NotFound();
            return group;
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
            
            _context.Entry(group).State = EntityState.Modified;
            
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