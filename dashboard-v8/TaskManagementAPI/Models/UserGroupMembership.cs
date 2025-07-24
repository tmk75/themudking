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
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual UserGroup UserGroup { get; set; } = null!;
    }
}