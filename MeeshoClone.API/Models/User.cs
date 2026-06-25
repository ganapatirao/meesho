namespace MeeshoClone.API.Models;

public class User
{
    public string? Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Role { get; set; } = "Normal"; // Admin, Premier, Normal
    public bool IsPremier { get; set; } = false;
    public DateTime PremierExpiryDate { get; set; } = DateTime.MinValue;
    public string ProfileImage { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    
    // Security fields
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutUntil { get; set; } = null;
    public string? ResetToken { get; set; } = null;
    public DateTime? ResetTokenExpiry { get; set; } = null;
    public string? CaptchaToken { get; set; } = null;
    public DateTime? CaptchaExpiry { get; set; } = null;
    
    public List<Address> Addresses { get; set; } = new();
    public List<string> Wishlist { get; set; } = new();
    public decimal TotalSpent { get; set; } = 0;
    public int OrderCount { get; set; } = 0;
}

public class Address
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PinCode { get; set; } = string.Empty;
    public string AddressType { get; set; } = "Home"; // Home, Office, Other
    public bool IsDefault { get; set; } = false;
}
