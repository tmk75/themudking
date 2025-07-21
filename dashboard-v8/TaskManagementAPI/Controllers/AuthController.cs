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
    public class AuthController : ControllerBase
    {
        private readonly TaskDbContext _context;

        public AuthController(TaskDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            // 验证请求
            if (string.IsNullOrEmpty(loginDto.Username) || string.IsNullOrEmpty(loginDto.Password))
            {
                return BadRequest("Username and password are required");
            }

            // 计算密码的MD5哈希值
            string passwordHash = GetMd5Hash(loginDto.Password);

            // 查询用户
            var user = await _context.Users
                .Where(u => u.Username == loginDto.Username && u.PasswordHash == passwordHash && u.IsActive)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Unauthorized("Invalid username or password");
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

            return Ok(userDto);
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