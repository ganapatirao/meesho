using System.ComponentModel.DataAnnotations;

namespace HappyShoppingClone.API.Models;

public class Product
{
    public string? Id { get; set; }
    
    [Required(ErrorMessage = "Vendor ID is required")]
    public string VendorId { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Company ID is required")]
    public string CompanyId { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Product name is required")]
    [MinLength(2, ErrorMessage = "Product name must be at least 2 characters")]
    [MaxLength(200, ErrorMessage = "Product name cannot exceed 200 characters")]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
    public string Description { get; set; } = string.Empty;
    
    public List<string> ImageUrls { get; set; } = new();
    
    [Required(ErrorMessage = "At least one product image is required")]
    [MinLength(1, ErrorMessage = "At least one product image is required")]
    public List<string> ImageBase64 { get; set; } = new();
    
    [Required(ErrorMessage = "Price is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal Price { get; set; }
    
    [Range(0, double.MaxValue, ErrorMessage = "Original price must be positive")]
    public decimal OriginalPrice { get; set; }
    
    [Range(0, 100, ErrorMessage = "Discount percentage must be between 0 and 100")]
    public int DiscountPercentage { get; set; } = 0;
    
    [Required(ErrorMessage = "Category is required")]
    public string CategoryId { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "SubCategory is required")]
    public string SubCategoryId { get; set; } = string.Empty;
    
    public List<string> Tags { get; set; } = new();
    
    public bool IsFeatured { get; set; } = false;
    
    public bool IsTrending { get; set; } = false;
    
    public bool IsPremierExclusive { get; set; } = false;
    
    [Range(0, 5, ErrorMessage = "Rating must be between 0 and 5")]
    public decimal Rating { get; set; } = 0;
    
    [Range(0, int.MaxValue, ErrorMessage = "Review count must be positive")]
    public int ReviewCount { get; set; } = 0;
    
    [Range(0, int.MaxValue, ErrorMessage = "Stock must be positive")]
    public int Stock { get; set; } = 0;
    
    [Range(0, int.MaxValue, ErrorMessage = "Sold count must be positive")]
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

public class ProductValidationRules
{
    public class FieldRule
    {
        public bool Required { get; set; }
        public int? MinLength { get; set; }
        public int? MaxLength { get; set; }
        public string? Regex { get; set; }
        public string? ErrorMessage { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
    }

    public FieldRule Name { get; set; } = new();
    public FieldRule Description { get; set; } = new();
    public FieldRule Price { get; set; } = new();
    public FieldRule OriginalPrice { get; set; } = new();
    public FieldRule CategoryId { get; set; } = new();
    public FieldRule SubCategoryId { get; set; } = new();
    public FieldRule Stock { get; set; } = new();
    public FieldRule ImageBase64 { get; set; } = new();
}
