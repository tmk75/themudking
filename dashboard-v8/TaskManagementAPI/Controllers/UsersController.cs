using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using TaskManagementAPI.Data;
using TaskManagementAPI.Models;
using TaskManagementAPI.DTOs;

namespace TaskManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            var users = await _context.Users
                .Where(u => u.IsActive)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Username = u.Username,
                    Email = u.Email,
                    IsActive = u.IsActive,
                    Groups = _context.UserGroupMemberships
                        .Where(ugm => ugm.UserId == u.Id)
                        .Join(_context.UserGroups,
                            ugm => ugm.GroupId,
                            ug => ug.Id,
                            (ugm, ug) => ug.Name)
                        .ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || !user.IsActive) return NotFound();

            var userGroups = await _context.UserGroupMemberships
                .Where(ugm => ugm.UserId == user.Id)
                .Join(_context.UserGroups,
                    ugm => ugm.GroupId,
                    ug => ug.Id,
                    (ugm, ug) => ug.Name)
                .ToListAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Username = user.Username,
                Email = user.Email,
                IsActive = user.IsActive,
                Groups = userGroups
            };

            return Ok(userDto);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto createUserDto)
        {
            // 验证请求
            if (string.IsNullOrEmpty(createUserDto.Name) || 
                string.IsNullOrEmpty(createUserDto.Username) || 
                string.IsNullOrEmpty(createUserDto.Email) || 
                string.IsNullOrEmpty(createUserDto.Password))
            {
                return BadRequest("All fields are required");
            }

            // 检查用户名和邮箱是否已存在
            if (await _context.Users.AnyAsync(u => u.Username == createUserDto.Username))
            {
                return Conflict("Username already exists");
            }

            if (await _context.Users.AnyAsync(u => u.Email == createUserDto.Email))
            {
                return Conflict("Email already exists");
            }

            // 创建新用户
            var user = new User
            {
                Name = createUserDto.Name,
                Username = createUserDto.Username,
                Email = createUserDto.Email,
                PasswordHash = GetMd5Hash(createUserDto.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // 添加用户组关联
            if (createUserDto.Groups != null && createUserDto.Groups.Any())
            {
                foreach (var groupName in createUserDto.Groups)
                {
                    var group = await _context.UserGroups.FirstOrDefaultAsync(g => g.Name == groupName);
                    if (group != null)
                    {
                        _context.UserGroupMemberships.Add(new UserGroupMembership
                        {
                            UserId = user.Id,
                            GroupId = group.Id,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
                await _context.SaveChangesAsync();
            }

            // 获取用户所属的组
            var userGroups = await _context.UserGroupMemberships
                .Where(ugm => ugm.UserId == user.Id)
                .Join(_context.UserGroups,
                    ugm => ugm.GroupId,
                    ug => ug.Id,
                    (ugm, ug) => ug.Name)
                .ToListAsync();

            // 创建用户DTO
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Username = user.Username,
                Email = user.Email,
                IsActive = user.IsActive,
                Groups = userGroups
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto updateUserDto)
        {
            if (id != updateUserDto.Id) return BadRequest();

            var user = await _context.Users.FindAsync(id);
            if (user == null || !user.IsActive) return NotFound();

            // 更新用户信息
            user.Name = updateUserDto.Name ?? user.Name;
            user.Email = updateUserDto.Email ?? user.Email;
            user.UpdatedAt = DateTime.UtcNow;

            // 如果提供了新密码，则更新密码
            if (!string.IsNullOrEmpty(updateUserDto.Password))
            {
                user.PasswordHash = GetMd5Hash(updateUserDto.Password);
            }

            // 更新用户组关联
            if (updateUserDto.Groups != null)
            {
                // 删除现有的组关联
                var existingMemberships = await _context.UserGroupMemberships
                    .Where(ugm => ugm.UserId == user.Id)
                    .ToListAsync();
                _context.UserGroupMemberships.RemoveRange(existingMemberships);

                // 添加新的组关联
                foreach (var groupName in updateUserDto.Groups)
                {
                    var group = await _context.UserGroups.FirstOrDefaultAsync(g => g.Name == groupName);
                    if (group != null)
                    {
                        _context.UserGroupMemberships.Add(new UserGroupMembership
                        {
                            UserId = user.Id,
                            GroupId = group.Id,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            // 软删除：将用户标记为非活动
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }

        // 辅助方法：计算MD5哈希值
        private string GetMd5Hash(string input)
        {
            using (MD5 md5 = MD5.Create())
            {
                byte[] inputBytes = Encoding.UTF8.GetBytes(input);
                byte[] hashBytes = md5.ComputeHash(inputBytes);

                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < hashBytes.Length; i++)
                {
                    sb.Append(hashBytes[i].ToString("x2"));
                }
                return sb.ToString();
            }
        }
    }
}