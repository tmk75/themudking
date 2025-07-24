using System;

namespace TaskManagementAPI.Models
{
    /// <summary>
    /// 标记属性为下拉选择类型，前端应该将此字段渲染为下拉选择框而非文本输入框
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class DropdownSelectionAttribute : Attribute
    {
        // 可以在这里添加额外的配置属性，如数据源类型等
    }
}