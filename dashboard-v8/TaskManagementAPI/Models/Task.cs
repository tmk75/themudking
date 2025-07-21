using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagementAPI.Models
{
    public class Task
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "todo";
        
        [Required]
        [MaxLength(20)]
        public string Priority { get; set; } = "medium";
        
        [MaxLength(100)]
        public string Assignee { get; set; } = string.Empty;
        
        public DateTime? DueDate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedAt { get; set; }
        
        public int EstimatedHours { get; set; } = 8;
        
        [Column(TypeName = "json")]
        public string Tags { get; set; } = "[]";
        
        [Column(TypeName = "json")]
        public string RaciData { get; set; } = "{}";
    }
}