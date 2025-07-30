using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskManagementAPI.DTOs
{
    public class TaskDto
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string Status { get; set; } = "todo";
        
        [Required]
        public string Priority { get; set; } = "medium";
        
        public string Assignee { get; set; } = string.Empty;
        
        public DateTime? DueDate { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        public int EstimatedHours { get; set; } = 8;
        
        public List<string> Tags { get; set; } = new List<string>();
        
        public int? GroupId { get; set; }
        
        public string? GroupName { get; set; }
        
        // RACI 相关字段
        public string? Responsible { get; set; }
        
        public string? Accountable { get; set; }
        
        public string? Consulted { get; set; }
        
        public string? Informed { get; set; }
    }
}