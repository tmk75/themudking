using System.ComponentModel.DataAnnotations;

namespace TaskManagementAPI.Models
{
    public class UserGroup
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual ICollection<UserGroupMembership> UserMemberships { get; set; } = new List<UserGroupMembership>();
        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
}