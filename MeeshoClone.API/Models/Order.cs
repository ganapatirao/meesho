namespace MeeshoClone.API.Models;

public class Order
{
    public string? Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public List<OrderItem> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal FinalAmount { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Shipped, Delivered, Cancelled
    public string PaymentStatus { get; set; } = "Pending"; // Pending, Paid, Failed, Refunded
    public string PaymentMethod { get; set; } = string.Empty;
    public Address ShippingAddress { get; set; } = new();
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime EstimatedDeliveryDate { get; set; } = DateTime.UtcNow.AddDays(7);
    public DateTime? DeliveryDate { get; set; }
    public string TrackingNumber { get; set; } = string.Empty;
    public List<OrderStatusHistory> StatusHistory { get; set; } = new();
    public bool IsPremierOrder { get; set; } = false;
    public decimal PremierDiscount { get; set; } = 0;
}

public class OrderItem
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string VariantId { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; } = 0;
}

public class OrderStatusHistory
{
    public string Status { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Note { get; set; } = string.Empty;
}
