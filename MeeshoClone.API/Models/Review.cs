namespace MeeshoClone.API.Models;

public class Review
{
    public string? Id { get; set; }
    public string ProductId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserAvatar { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public int HelpfulCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerifiedPurchase { get; set; } = false;
}
