namespace MeeshoClone.API.Models;

public class Category
{
    public string? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ParentId { get; set; } = string.Empty;
    public List<string> SubCategoryIds { get; set; } = new();
    public bool IsFeatured { get; set; } = false;
    public int ProductCount { get; set; } = 0;
    public int DisplayOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
