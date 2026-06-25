using MongoDB.Bson;

using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;



namespace BusinessPlatform.API.Models

{

    public class Category

    {

        [BsonId]

        [BsonRepresentation(BsonType.ObjectId)]

        public string? Id { get; set; }



        [BsonElement("name")]

        public string Name { get; set; } = string.Empty;



        [BsonElement("description")]

        public string Description { get; set; } = string.Empty;



        [BsonElement("imageUrl")]

        public string ImageUrl { get; set; } = string.Empty;



        [BsonElement("icon")]

        public string Icon { get; set; } = string.Empty;



        [BsonElement("status")]

        public string Status { get; set; } = "Active";



        [BsonElement("displaySequence")]

        [Required(ErrorMessage = "Display sequence is required")]

        [RegularExpression(@"^\d+$", ErrorMessage = "Display sequence must be numeric only")]

        [Range(0, int.MaxValue, ErrorMessage = "Display sequence must be a positive integer")]

        public int DisplaySequence { get; set; } = 0;



        [BsonElement("createdAt")]

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }



    public class Subcategory

    {

        [BsonId]

        [BsonRepresentation(BsonType.ObjectId)]

        public string? Id { get; set; }



        [BsonElement("categoryId")]

        [Required(ErrorMessage = "Category is required")]

        public string CategoryId { get; set; } = string.Empty;



        [BsonElement("categoryName")]

        public string CategoryName { get; set; } = string.Empty;



        [BsonElement("name")]

        [Required(ErrorMessage = "Name is required")]

        [StringLength(100, ErrorMessage = "Name must not exceed 100 characters")]

        public string Name { get; set; } = string.Empty;



        [BsonElement("description")]

        public string Description { get; set; } = string.Empty;



        [BsonElement("imageUrl")]

        public string ImageUrl { get; set; } = string.Empty;



        [BsonElement("status")]

        public string Status { get; set; } = "Active";



        [BsonElement("displaySequence")]

        [Required(ErrorMessage = "Display sequence is required")]

        [RegularExpression(@"^\d+$", ErrorMessage = "Display sequence must be numeric only")]

        [Range(0, int.MaxValue, ErrorMessage = "Display sequence must be a positive integer")]

        public int DisplaySequence { get; set; } = 0;



        [BsonElement("createdAt")]

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }



    public class Product

    {

        [BsonId]

        [BsonRepresentation(BsonType.ObjectId)]

        public string? Id { get; set; }



        [BsonElement("name")]

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name must not exceed 100 characters")]
        [RegularExpression(@"^[a-zA-Z0-9\s\-']+$", ErrorMessage = "Name can only contain letters, numbers, spaces, hyphens, and apostrophes")]
        public string Name { get; set; } = string.Empty;



        [BsonElement("description")]
        [Required(ErrorMessage = "Description is required")]
        [StringLength(5000, ErrorMessage = "Description must not exceed 5000 characters")]
        public string Description { get; set; } = string.Empty;



        [BsonElement("price")]
        [Required(ErrorMessage = "Price is required")]
        [RegularExpression(@"^\d{1,7}$", ErrorMessage = "Price must be numeric only and not exceed 7 digits")]
        [Range(0.01, 9999999, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }



        [BsonElement("categoryId")]

        public string? CategoryId { get; set; }



        [BsonElement("categoryName")]
        [Required(ErrorMessage = "Category is required")]
        public string CategoryName { get; set; } = string.Empty;



        [BsonElement("subcategoryId")]

        public string? SubcategoryId { get; set; }



        [BsonElement("subcategoryName")]

        public string SubcategoryName { get; set; } = string.Empty;



        [BsonElement("displaySequence")]
        [Required(ErrorMessage = "Display sequence is required")]
        [RegularExpression(@"^\d+$", ErrorMessage = "Display sequence must be numeric only")]
        [Range(0, int.MaxValue, ErrorMessage = "Display sequence must be a positive integer")]
        public int DisplaySequence { get; set; } = 0;



        [BsonElement("stock")]
        [Required(ErrorMessage = "Stock is required")]
        [RegularExpression(@"^\d{1,7}$", ErrorMessage = "Stock must be numeric only and not exceed 7 digits")]
        [Range(0, 9999999, ErrorMessage = "Stock must be 0 or greater")]
        public int Stock { get; set; }



        [BsonElement("seller")]
        [Required(ErrorMessage = "Seller is required")]
        [StringLength(50, ErrorMessage = "Seller must not exceed 50 characters")]
        [RegularExpression(@"^[a-zA-Z\s\-']+$", ErrorMessage = "Seller can only contain letters, spaces, hyphens, and apostrophes")]
        public string Seller { get; set; } = string.Empty;



        [BsonElement("rating")]
        [RegularExpression(@"^\d+(\.\d{1,2})?$", ErrorMessage = "Rating must be numeric")]
        [Range(0, 5, ErrorMessage = "Rating must be between 0 and 5")]
        public double Rating { get; set; }



        [BsonElement("reviewCount")]

        public int ReviewCount { get; set; }



        [BsonElement("imageUrl")]
        [Required(ErrorMessage = "Primary image is required")]
        public string ImageUrl { get; set; } = string.Empty;



        [BsonElement("imageUrls")]
        [Required(ErrorMessage = "At least one secondary image is required")]
        [MinLength(1, ErrorMessage = "At least one secondary image is required")]
        public List<string> ImageUrls { get; set; } = new List<string>();



        [BsonElement("status")]
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression(@"^(Active|Inactive)$", ErrorMessage = "Status must be either Active or Inactive")]
        public string Status { get; set; } = "Active";



        [BsonElement("createdAt")]

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;



        [BsonElement("highlights")]
        [Required(ErrorMessage = "At least one highlight is required")]
        [MinLength(1, ErrorMessage = "At least one highlight is required")]
        public List<string> Highlights { get; set; } = new List<string>();



        [BsonElement("offerPercentage")]
        [Range(0, 100, ErrorMessage = "Offer percentage must be between 0 and 100")]
        public int OfferPercentage { get; set; } = 0;



        [BsonElement("sizeOptions")]
        public List<ProductSizeOption> SizeOptions { get; set; } = new List<ProductSizeOption>();



        [BsonElement("colorVariants")]
        public List<ProductColorVariant> ColorVariants { get; set; } = new List<ProductColorVariant>();



        [BsonElement("reviews")]

        public List<ProductReview> Reviews { get; set; } = new List<ProductReview>();

    }



    public class ProductReview

    {

        [BsonElement("userName")]

        public string UserName { get; set; } = string.Empty;



        [BsonElement("rating")]

        public int Rating { get; set; }



        [BsonElement("title")]

        public string Title { get; set; } = string.Empty;



        [BsonElement("comment")]

        public string Comment { get; set; } = string.Empty;



        [BsonElement("createdAt")]

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }



    public class ProductSizeOption

    {

        [BsonElement("name")]

        [Required(ErrorMessage = "Size name is required")]

        public string Name { get; set; } = string.Empty;



        [BsonElement("priceAdjustment")]

        [Required(ErrorMessage = "Price adjustment is required")]

        [Range(-9999999, 9999999, ErrorMessage = "Price adjustment must be within valid range")]

        public decimal PriceAdjustment { get; set; } = 0;



        [BsonElement("stock")]

        [Required(ErrorMessage = "Stock is required")]

        [Range(0, 9999999, ErrorMessage = "Stock must be 0 or greater")]

        public int Stock { get; set; } = 0;



        [BsonElement("isDefault")]

        public bool IsDefault { get; set; } = false;

    }



    public class ProductColorVariant

    {

        [BsonElement("name")]

        [Required(ErrorMessage = "Color name is required")]

        public string Name { get; set; } = string.Empty;



        [BsonElement("hexCode")]

        public string HexCode { get; set; } = string.Empty;



        [BsonElement("imageUrl")]

        [Required(ErrorMessage = "Primary image is required for color variant")]

        public string ImageUrl { get; set; } = string.Empty;



        [BsonElement("imageUrls")]

        public List<string> ImageUrls { get; set; } = new List<string>();



        [BsonElement("priceAdjustment")]

        public decimal PriceAdjustment { get; set; } = 0;



        [BsonElement("sizeOptions")]

        public List<ProductSizeOption> SizeOptions { get; set; } = new List<ProductSizeOption>();



        [BsonElement("stock")]

        public int Stock { get; set; } = 0;



        [BsonElement("isDefault")]

        public bool IsDefault { get; set; } = false;

    }



    public class ShoppingCartItem

    {

        [BsonId]

        [BsonRepresentation(BsonType.ObjectId)]

        public string? Id { get; set; }



        [BsonElement("userId")]

        public string? UserId { get; set; }



        [BsonElement("productId")]

        public string? ProductId { get; set; }



        [BsonElement("quantity")]

        public int Quantity { get; set; }



        [BsonElement("sizeOptionName")]

        public string? SizeOptionName { get; set; }



        [BsonElement("colorVariantName")]

        public string? ColorVariantName { get; set; }



        [BsonElement("price")]

        public decimal Price { get; set; }



        [BsonElement("createdAt")]

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }



    public class OrderItem

    {

        [BsonElement("productId")]

        public string? ProductId { get; set; }



        [BsonElement("productName")]

        public string ProductName { get; set; } = string.Empty;



        [BsonElement("quantity")]

        public int Quantity { get; set; }



        [BsonElement("price")]

        public decimal Price { get; set; }



        [BsonElement("sizeOptionName")]

        public string? SizeOptionName { get; set; }



        [BsonElement("colorVariantName")]

        public string? ColorVariantName { get; set; }

    }



    public class ShoppingOrder

    {

        [BsonId]

        [BsonRepresentation(BsonType.ObjectId)]

        public string? Id { get; set; }



        [BsonElement("userId")]

        public string? UserId { get; set; }



        [BsonElement("userName")]

        public string UserName { get; set; } = string.Empty;



        [BsonElement("userEmail")]

        public string UserEmail { get; set; } = string.Empty;



        [BsonElement("userPhone")]

        public string UserPhone { get; set; } = string.Empty;



        [BsonElement("items")]

        public List<OrderItem> Items { get; set; } = new List<OrderItem>();



        [BsonElement("total")]

        public decimal Total { get; set; }



        [BsonElement("status")]

        public string Status { get; set; } = "Confirmed";



        [BsonElement("shippingAddress")]

        public string ShippingAddress { get; set; } = string.Empty;



        [BsonElement("billingAddress")]

        public string BillingAddress { get; set; } = string.Empty;



        [BsonElement("paymentMethod")]

        public string PaymentMethod { get; set; } = string.Empty;



        [BsonElement("createdAt")]

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }



    public class District

    {

        [BsonId]

        [BsonRepresentation(BsonType.ObjectId)]

        public string? Id { get; set; }



        [BsonElement("name")]

        public string Name { get; set; } = string.Empty;



        [BsonElement("stateCode")]

        public string StateCode { get; set; } = string.Empty;

    }

}

