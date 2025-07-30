using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskManagementAPI.Data;
using TaskManagementAPI.DTOs;
using TaskManagementAPI.Models;
using BCrypt.Net;

namespace TaskManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly TaskDbContext _context;

        public UsersController(TaskDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var groups = await _context.UserGroupMemberships
                    .Where(ugm => ugm.UserId == user.Id)
                    .Join(_context.UserGroups, ugm => ugm.GroupId, g => g.Id, (ugm, g) => g.Name)
                    .ToListAsync();

                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Username = user.Username,
                    Email = user.Email,
                    IsActive = user.IsActive,
                    Groups = groups
                });
            }

            return Ok(userDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound();

            var groups = await _context.UserGroupMemberships
                .Where(ugm => ugm.UserId == id)
                .Join(_context.UserGroups, ugm => ugm.GroupId, g => g.Id, (ugm, g) => g.Name)
                .ToListAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Username = user.Username,
                Email = user.Email,
                IsActive = user.IsActive,
                Groups = groups
            };

            return Ok(userDto);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto createUserDto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == createUserDto.Username))
                return BadRequest("Username already exists");

            if (await _context.Users.AnyAsync(u => u.Email == createUserDto.Email))
                return BadRequest("Email already exists");

            var user = new User
            {
                Name = createUserDto.Name,
                Username = createUserDto.Username,
                Email = createUserDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (createUserDto.Groups != null && createUserDto.Groups.Any())
            {
                var groups = await _context.UserGroups
                    .Where(g => createUserDto.Groups.Contains(g.Name))
                    .ToListAsync();

                foreach (var group in groups)
                {
                    _context.UserGroupMemberships.Add(new UserGroupMembership
                    {
                        UserId = user.Id,
                        GroupId = group.Id
                    });
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Username = user.Username,
                Email = user.Email,
                IsActive = user.IsActive,
                Groups = createUserDto.Groups ?? new List<string>()
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto updateUserDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound();

            if (!string.IsNullOrEmpty(updateUserDto.Name))
                user.Name = updateUserDto.Name;

            if (!string.IsNullOrEmpty(updateUserDto.Email))
            {
                if (await _context.Users.AnyAsync(u => u.Email == updateUserDto.Email && u.Id != id))
                    return BadRequest("Email already exists");
                user.Email = updateUserDto.Email;
            }

            if (!string.IsNullOrEmpty(updateUserDto.Password))
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateUserDto.Password);

            user.UpdatedAt = DateTime.UtcNow;

            if (updateUserDto.Groups != null)
            {
                var existingMemberships = await _context.UserGroupMemberships
                    .Where(ugm => ugm.UserId == id)
                    .ToListAsync();
                _context.UserGroupMemberships.RemoveRange(existingMemberships);
                
                var groups = await _context.UserGroups
                    .Where(g => updateUserDto.Groups.Contains(g.Name))
                    .ToListAsync();

                foreach (var group in groups)
                {
                    _context.UserGroupMemberships.Add(new UserGroupMembership
                    {
                        UserId = user.Id,
                        GroupId = group.Id
                    });
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            // 删除用户组关联
            var memberships = await _context.UserGroupMemberships
                .Where(ugm => ugm.UserId == id)
                .ToListAsync();
            _context.UserGroupMemberships.RemoveRange(memberships);

            // 物理删除用户
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("selection")]
        public async Task<ActionResult<IEnumerable<UserSelectionDto>>> GetUsersForSelection()
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

            return Ok(users);
        }
    }
}