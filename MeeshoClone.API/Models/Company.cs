namespace MeeshoClone.API.Models;

public class Company
{
    public string? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Logo { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public List<string> VendorIds { get; set; } = new();
    public bool IsVerified { get; set; } = false;
    public bool IsFeatured { get; set; } = false;
    public decimal Rating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public int TotalProducts { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
