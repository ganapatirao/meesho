using System.ComponentModel.DataAnnotations;

namespace HappyShoppingClone.API.Models;

public class Category
{
    public string? Id { get; set; }
    
    [Required(ErrorMessage = "Category name is required")]
    [MinLength(2, ErrorMessage = "Category name must be at least 2 characters")]
    [MaxLength(50, ErrorMessage = "Category name cannot exceed 50 characters")]
    [RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "Category name can only contain lowercase letters, numbers, and hyphens")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Display name is required")]
    [MinLength(2, ErrorMessage = "Display name must be at least 2 characters")]
    [MaxLength(100, ErrorMessage = "Display name cannot exceed 100 characters")]
    public string DisplayName { get; set; } = string.Empty;
    
    [MaxLength(2, ErrorMessage = "Icon cannot exceed 2 characters")]
    public string Icon { get; set; } = string.Empty;
    
    [MaxLength(5000000, ErrorMessage = "Image base64 data cannot exceed 5MB")]
    public string Image { get; set; } = string.Empty;
    
    [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string Description { get; set; } = string.Empty;
    
    public bool IsFeatured { get; set; } = false;
    
    [Range(0, int.MaxValue, ErrorMessage = "Display order must be a positive number")]
    public int DisplayOrder { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class CategoryValidationRules
{
    public class FieldRule
    {
        public bool Required { get; set; }
        public int? MinLength { get; set; }
        public int? MaxLength { get; set; }
        public string? Regex { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public FieldRule Name { get; set; } = new();
    public FieldRule DisplayName { get; set; } = new();
    public FieldRule Icon { get; set; } = new();
    public FieldRule Image { get; set; } = new();
    public FieldRule Description { get; set; } = new();
    public FieldRule DisplayOrder { get; set; } = new();
}
