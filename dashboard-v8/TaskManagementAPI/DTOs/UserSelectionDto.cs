namespace TaskManagementAPI.DTOs
{
    /// <summary>
    /// 用于下拉选择的用户信息
    /// </summary>
    public class UserSelectionDto
    {
        /// <summary>
        /// 用户名，用作选择值
        /// </summary>
        public string Username { get; set; } = string.Empty;
        
        /// <summary>
        /// 用户显示名称
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// 用户邮箱
        /// </summary>
        public string Email { get; set; } = string.Empty;
    }
}