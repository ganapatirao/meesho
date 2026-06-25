using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using MongoDB.Driver;

namespace BusinessPlatform.API.Seed
{
    public class AdvertisingSeedData
    {
        private readonly MongoDbContext _context;

        public AdvertisingSeedData(MongoDbContext context)
        {
            _context = context;
        }

        private string GenerateSvgDataUrl(string color, string text = "")
        {
            var svg = $"<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='{color}'/><text x='200' y='150' font-family='Arial' font-size='24' fill='white' text-anchor='middle'>{text}</text></svg>";
            var bytes = System.Text.Encoding.UTF8.GetBytes(svg);
            var base64 = Convert.ToBase64String(bytes);
            return $"data:image/svg+xml;base64,{base64}";
        }

        public async Task SeedAsync()
        {
            await _context.AdCategories.DeleteManyAsync(_ => true);
            await _context.Advertisements.DeleteManyAsync(_ => true);
            await _context.AdResponses.DeleteManyAsync(_ => true);

            // Seed Ad Categories
            var adCategories = new[]
            {
                new AdCategory { Name = "Electronics", Emoji = "📱" },
                new AdCategory { Name = "Vehicles", Emoji = "🚗" },
                new AdCategory { Name = "Real Estate", Emoji = "🏠" },
                new AdCategory { Name = "Furniture", Emoji = "🪑" },
                new AdCategory { Name = "Jobs", Emoji = "💼" },
                new AdCategory { Name = "Services", Emoji = "🔧" }
            };
            await _context.AdCategories.InsertManyAsync(adCategories);

            // Get users for seller references
            var users = await _context.Users.Find(_ => true).ToListAsync();
            var user1 = users.FirstOrDefault(u => u.Username == "johnsmith");
            var user2 = users.FirstOrDefault(u => u.Username == "janedoe");
            var user3 = users.FirstOrDefault(u => u.Username == "bobwilson");
            var user4 = users.FirstOrDefault(u => u.Username == "alicebrown");

            // Seed Advertisements
            var ads = new[]
            {
                new Advertisement {
                    Title = "iPhone 14 Pro - Excellent Condition",
                    Description = "Like new iPhone 14 Pro, 256GB, comes with original box and accessories. No scratches, battery health 98%.",
                    Price = 799.99m,
                    CategoryName = "Electronics",
                    Subcategory = "Mobiles",
                    Location = "New York, NY",
                    City = "New York",
                    Condition = "Like New",
                    SellerId = user1?.Id,
                    SellerName = user1?.FullName,
                    SellerPhone = "+1-555-0101",
                    PhoneDisplayStatus = "Visible",
                    SellerEmail = "john@example.com",
                    ImageUrl = GenerateSvgDataUrl("#3B82F6", "iPhone"),
                    ImageUrls = new List<string> {
                        GenerateSvgDataUrl("#3B82F6", "iPhone 1"),
                        GenerateSvgDataUrl("#60A5FA", "iPhone 2"),
                        GenerateSvgDataUrl("#93C5FD", "iPhone 3"),
                        GenerateSvgDataUrl("#BFDBFE", "iPhone 4")
                    },
                    Negotiable = true,
                    IsFeatured = true,
                    IsUrgent = false,
                    Views = 245,
                    PostedDate = DateTime.UtcNow.AddDays(-5)
                },
                new Advertisement {
                    Title = "2019 Toyota Camry - Low Mileage",
                    Description = "Well-maintained 2019 Toyota Camry with only 35,000 miles. Clean title, single owner, full service history.",
                    Price = 18500.00m,
                    CategoryName = "Vehicles",
                    Subcategory = "Cars",
                    Location = "Los Angeles, CA",
                    City = "Los Angeles",
                    Condition = "Good",
                    SellerId = user2?.Id,
                    SellerName = user2?.FullName,
                    SellerPhone = "+1-555-0102",
                    PhoneDisplayStatus = "Hidden",
                    SellerEmail = "jane@example.com",
                    ImageUrl = GenerateSvgDataUrl("#EF4444", "Car"),
                    ImageUrls = new List<string> {
                        GenerateSvgDataUrl("#EF4444", "Car 1"),
                        GenerateSvgDataUrl("#F87171", "Car 2"),
                        GenerateSvgDataUrl("#FCA5A5", "Car 3"),
                        GenerateSvgDataUrl("#FECACA", "Car 4")
                    },
                    Negotiable = true,
                    IsFeatured = false,
                    IsUrgent = true,
                    Views = 512,
                    PostedDate = DateTime.UtcNow.AddDays(-10)
                },
                new Advertisement {
                    Title = "Modern Sofa Set - Brand New",
                    Description = "Beautiful 3-piece sofa set, gray fabric, never used. Includes 3-seater, 2-seater, and armchair.",
                    Price = 599.99m,
                    CategoryName = "Furniture",
                    Subcategory = "Sofas",
                    Location = "Chicago, IL",
                    City = "Chicago",
                    Condition = "New",
                    SellerId = user3?.Id,
                    SellerName = user3?.FullName,
                    SellerPhone = "+1-555-0103",
                    PhoneDisplayStatus = "Visible",
                    SellerEmail = "bob@example.com",
                    ImageUrl = GenerateSvgDataUrl("#F59E0B", "House"),
                    ImageUrls = new List<string> {
                        GenerateSvgDataUrl("#F59E0B", "House 1"),
                        GenerateSvgDataUrl("#FBBF24", "House 2"),
                        GenerateSvgDataUrl("#FCD34D", "House 3"),
                        GenerateSvgDataUrl("#FDE68A", "House 4")
                    },
                    Negotiable = false,
                    IsFeatured = false,
                    IsUrgent = false,
                    Views = 128,
                    PostedDate = DateTime.UtcNow.AddDays(-3)
                },
                new Advertisement {
                    Title = "2BR Apartment for Rent",
                    Description = "Spacious 2-bedroom apartment in downtown area, close to amenities. 1200 sq ft, modern kitchen, parking included.",
                    Price = 1500.00m,
                    CategoryName = "Real Estate",
                    Subcategory = "Apartments",
                    Location = "Houston, TX",
                    City = "Houston",
                    Condition = "Good",
                    SellerId = user4?.Id,
                    SellerName = user4?.FullName,
                    SellerPhone = "+1-555-0104",
                    PhoneDisplayStatus = "Hidden",
                    SellerEmail = "alice@example.com",
                    ImageUrl = GenerateSvgDataUrl("#8B5CF6", "Sofa"),
                    ImageUrls = new List<string> {
                        GenerateSvgDataUrl("#8B5CF6", "Sofa 1"),
                        GenerateSvgDataUrl("#A78BFA", "Sofa 2"),
                        GenerateSvgDataUrl("#C4B5FD", "Sofa 3"),
                        GenerateSvgDataUrl("#DDD6FE", "Sofa 4")
                    },
                    Negotiable = true,
                    IsFeatured = true,
                    IsUrgent = false,
                    Views = 342,
                    PostedDate = DateTime.UtcNow.AddDays(-7)
                },
                new Advertisement {
                    Title = "MacBook Pro 2021 - Refurbished",
                    Description = "MacBook Pro 14-inch M1 Pro, 16GB RAM, 512GB SSD, excellent condition. Includes charger and original box.",
                    Price = 1499.99m,
                    CategoryName = "Electronics",
                    Subcategory = "Laptops",
                    Location = "Seattle, WA",
                    City = "Seattle",
                    Condition = "Good",
                    SellerId = user1?.Id,
                    SellerName = user1?.FullName,
                    SellerPhone = "+1-555-0101",
                    PhoneDisplayStatus = "Visible",
                    SellerEmail = "john@example.com",
                    ImageUrl = GenerateSvgDataUrl("#06B6D4", "Desk"),
                    ImageUrls = new List<string> {
                        GenerateSvgDataUrl("#06B6D4", "Desk 1"),
                        GenerateSvgDataUrl("#22D3EE", "Desk 2"),
                        GenerateSvgDataUrl("#67E8F9", "Desk 3"),
                        GenerateSvgDataUrl("#A5F3FC", "Desk 4")
                    },
                    Negotiable = true,
                    IsFeatured = false,
                    IsUrgent = true,
                    Views = 189,
                    PostedDate = DateTime.UtcNow.AddDays(-2)
                },
                new Advertisement {
                    Title = "Royal Enfield Classic 350 - 2022",
                    Description = "Well-maintained Royal Enfield Classic 350, 2022 model, 8000 km. Single owner, all papers clear.",
                    Price = 145000.00m,
                    CategoryName = "Vehicles",
                    Subcategory = "Bikes",
                    Location = "Mumbai, MH",
                    City = "Mumbai",
                    Condition = "Excellent",
                    SellerId = user2?.Id,
                    SellerName = user2?.FullName,
                    SellerPhone = "+1-555-0102",
                    PhoneDisplayStatus = "Visible",
                    SellerEmail = "jane@example.com",
                    ImageUrl = GenerateSvgDataUrl("#F97316", "Bike"),
                    ImageUrls = new List<string> {
                        GenerateSvgDataUrl("#F97316", "Bike 1"),
                        GenerateSvgDataUrl("#FB923C", "Bike 2"),
                        GenerateSvgDataUrl("#FDBA74", "Bike 3"),
                        GenerateSvgDataUrl("#FED7AA", "Bike 4")
                    },
                    Negotiable = true,
                    IsFeatured = true,
                    IsUrgent = false,
                    Views = 423,
                    PostedDate = DateTime.UtcNow.AddDays(-12)
                }
            };
            await _context.Advertisements.InsertManyAsync(ads);
        }
    }
}
