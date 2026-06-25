namespace MeeshoClone.API.Models;

public class Vendor
{
    public string? Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Logo { get; set; } = string.Empty;
    public string CoverImage { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty; // Clothing, Electronics, etc.
    public string GSTNumber { get; set; } = string.Empty;
    public string PANNumber { get; set; } = string.Empty;
    public Address BusinessAddress { get; set; } = new();
    public bool IsVerified { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public decimal Rating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public int TotalProducts { get; set; } = 0;
    public int TotalSales { get; set; } = 0;
    public decimal TotalRevenue { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<string> ProductIds { get; set; } = new();
}
