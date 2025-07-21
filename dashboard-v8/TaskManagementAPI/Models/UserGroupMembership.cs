using System.ComponentModel.DataAnnotations;

namespace TaskManagementAPI.Models
{
    public class UserGroupMembership
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        
        public int GroupId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}