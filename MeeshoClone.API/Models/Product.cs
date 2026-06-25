namespace MeeshoClone.API.Models;

public class Product
{
    public string? Id { get; set; }
    public string VendorId { get; set; } = string.Empty;
    public string CompanyId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> ImageUrls { get; set; } = new();
    public List<string> ImageBase64 { get; set; } = new();
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public int DiscountPercentage { get; set; } = 0;
    public string Category { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public bool IsFeatured { get; set; } = false;
    public bool IsTrending { get; set; } = false;
    public bool IsPremierExclusive { get; set; } = false;
    public decimal Rating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public int Stock { get; set; } = 0;
    public int SoldCount { get; set; } = 0;
    public List<ProductVariant> Variants { get; set; } = new();
    public List<ProductSpecification> Specifications { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ProductVariant
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Color { get; set; } = string.Empty;
    public string ColorCode { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public List<string> Sizes { get; set; } = new();
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

public class ProductSpecification
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
