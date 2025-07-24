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
        [DropdownSelection] // 标记为下拉选择
        public string Assignee { get; set; } = string.Empty;
        
        public DateTime? DueDate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedAt { get; set; }
        
        public int EstimatedHours { get; set; } = 8;
        
        [Column(TypeName = "json")]
        public string Tags { get; set; } = "[]";
        
        [Column(TypeName = "json")]
        public string RaciData { get; set; } = "{}";
        
        // 添加与数据库表中的 GroupId 列对应的属性
        [Column("GroupId")]
        public int? GroupId { get; set; }
        
        // 添加导航属性
        [ForeignKey("GroupId")]
        public virtual UserGroup? UserGroup { get; set; }
        
        // 添加 RACI 相关字段，标记为下拉选择
        [MaxLength(100)]
        [DropdownSelection] // 标记为下拉选择
        public string? Responsible { get; set; }
        
        [MaxLength(100)]
        [DropdownSelection] // 标记为下拉选择
        public string? Accountable { get; set; }
        
        [DropdownSelection] // 标记为下拉选择
        public string? Consulted { get; set; }
        
        [DropdownSelection] // 标记为下拉选择
        public string? Informed { get; set; }
    }
}