using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskManagementAPI.Data;
using TaskManagementAPI.DTOs;

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

        /// <summary>
        /// 获取用户列表，用于下拉选择
        /// </summary>
        /// <returns>用户列表</returns>
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