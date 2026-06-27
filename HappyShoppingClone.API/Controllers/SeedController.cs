using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly MongoDbContext _context;

    public SeedController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult> SeedDatabase()
    {
        // Clear existing data
        await _context.Users.DeleteManyAsync(_ => true);
        await _context.Vendors.DeleteManyAsync(_ => true);
        await _context.Products.DeleteManyAsync(_ => true);
        await _context.Companies.DeleteManyAsync(_ => true);
        await _context.Categories.DeleteManyAsync(_ => true);
        await _context.SubCategories.DeleteManyAsync(_ => true);
        await _context.Orders.DeleteManyAsync(_ => true);
        await _context.Carts.DeleteManyAsync(_ => true);
        await _context.Reviews.DeleteManyAsync(_ => true);
        await _context.SiteConfigurations.DeleteManyAsync(_ => true);

        // Seed Categories - 24 comprehensive categories
        var categories = new List<Category>
        {
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "fashion", DisplayName = "fashion", Icon = "👗", Image = "", Description = "Latest fashion trends for men and women", IsFeatured = true, DisplayOrder = 0 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "electronics", DisplayName = "electronics", Icon = "📱", Image = "", Description = "Mobiles, laptops, and electronic gadgets", IsFeatured = true, DisplayOrder = 1 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "home-living", DisplayName = "home-living", Icon = "🏠", Image = "", Description = "Furniture, decor, and home essentials", IsFeatured = true, DisplayOrder = 2 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "beauty", DisplayName = "beauty", Icon = "💄", Image = "", Description = "Makeup, skincare, and personal care", IsFeatured = true, DisplayOrder = 3 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "sports", DisplayName = "sports", Icon = "⚽", Image = "", Description = "Sports equipment and fitness gear", IsFeatured = true, DisplayOrder = 4 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "books", DisplayName = "books", Icon = "📚", Image = "", Description = "Books, stationery, and educational materials", IsFeatured = true, DisplayOrder = 5 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "jewelry", DisplayName = "jewelry", Icon = "💍", Image = "", Description = "Gold, silver, and fashion jewelry", IsFeatured = true, DisplayOrder = 6 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "footwear", DisplayName = "footwear", Icon = "👟", Image = "", Description = "Shoes, sandals, and footwear for all", IsFeatured = true, DisplayOrder = 7 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "kids", DisplayName = "kids", Icon = "👶", Image = "", Description = "Clothing, toys, and kids essentials", IsFeatured = true, DisplayOrder = 8 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "kitchen", DisplayName = "kitchen", Icon = "🍳", Image = "", Description = "Cookware, appliances, and kitchen tools", IsFeatured = false, DisplayOrder = 9 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "grocery", DisplayName = "grocery", Icon = "🛒", Image = "", Description = "Food items and daily essentials", IsFeatured = false, DisplayOrder = 10 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "health", DisplayName = "health", Icon = "💊", Image = "", Description = "Healthcare and wellness products", IsFeatured = false, DisplayOrder = 11 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "automotive", DisplayName = "automotive", Icon = "🚗", Image = "", Description = "Car accessories and automotive parts", IsFeatured = false, DisplayOrder = 12 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "toys", DisplayName = "toys", Icon = "🧸", Image = "", Description = "Toys, games, and children's entertainment", IsFeatured = false, DisplayOrder = 13 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "furniture", DisplayName = "furniture", Icon = "🛋️", Image = "", Description = "Home and office furniture", IsFeatured = false, DisplayOrder = 14 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "watches", DisplayName = "watches", Icon = "⌚", Image = "", Description = "Analog and digital watches", IsFeatured = false, DisplayOrder = 15 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "bags", DisplayName = "bags", Icon = "👜", Image = "", Description = "Handbags, backpacks, and travel bags", IsFeatured = false, DisplayOrder = 16 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "accessories", DisplayName = "accessories", Icon = "🎒", Image = "", Description = "Fashion accessories and add-ons", IsFeatured = false, DisplayOrder = 17 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "pet-supplies", DisplayName = "pet-supplies", Icon = "�", Image = "", Description = "Pet food, toys, and accessories", IsFeatured = false, DisplayOrder = 18 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "garden", DisplayName = "garden", Icon = "🌱", Image = "", Description = "Gardening tools and plants", IsFeatured = false, DisplayOrder = 19 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "music", DisplayName = "music", Icon = "🎵", Image = "", Description = "Musical instruments and accessories", IsFeatured = false, DisplayOrder = 20 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "office", DisplayName = "office", Icon = "📎", Image = "", Description = "Office supplies and stationery", IsFeatured = false, DisplayOrder = 21 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "luggage", DisplayName = "luggage", Icon = "🧳", Image = "", Description = "Travel bags and luggage", IsFeatured = false, DisplayOrder = 22 },
            new Category { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "tools", DisplayName = "tools", Icon = "🔧", Image = "", Description = "Hardware and DIY tools", IsFeatured = false, DisplayOrder = 23 }
        };

        await _context.Categories.InsertManyAsync(categories);

        // Get the inserted categories with their IDs
        var insertedCategories = await _context.Categories.Find(_ => true).ToListAsync();

        // Seed SubCategories
        var subCategories = new List<SubCategory>();
        
        if (insertedCategories.Count > 0)
        {
            // Fashion SubCategories
            var fashionCategory = insertedCategories.FirstOrDefault(c => c.Name == "fashion");
            if (fashionCategory != null)
            {
                subCategories.AddRange(new List<SubCategory>
                {
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "mens-wear", DisplayName = "Men's Wear", CategoryId = fashionCategory.Id, Icon = "👔", Image = "", Description = "Clothing for men", IsFeatured = true, DisplayOrder = 0 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "womens-wear", DisplayName = "Women's Wear", CategoryId = fashionCategory.Id, Icon = "👗", Image = "", Description = "Clothing for women", IsFeatured = true, DisplayOrder = 1 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "kids-wear", DisplayName = "Kids' Wear", CategoryId = fashionCategory.Id, Icon = "👶", Image = "", Description = "Clothing for kids", IsFeatured = false, DisplayOrder = 2 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "ethnic-wear", DisplayName = "Ethnic Wear", CategoryId = fashionCategory.Id, Icon = "🎎", Image = "", Description = "Traditional clothing", IsFeatured = true, DisplayOrder = 3 }
                });
            }

            // Electronics SubCategories
            var electronicsCategory = insertedCategories.FirstOrDefault(c => c.Name == "electronics");
            if (electronicsCategory != null)
            {
                subCategories.AddRange(new List<SubCategory>
                {
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "mobiles", DisplayName = "Mobiles", CategoryId = electronicsCategory.Id, Icon = "📱", Image = "", Description = "Smartphones and mobiles", IsFeatured = true, DisplayOrder = 0 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "laptops", DisplayName = "Laptops", CategoryId = electronicsCategory.Id, Icon = "💻", Image = "", Description = "Laptops and computers", IsFeatured = true, DisplayOrder = 1 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "audio", DisplayName = "Audio", CategoryId = electronicsCategory.Id, Icon = "🎧", Image = "", Description = "Audio equipment", IsFeatured = false, DisplayOrder = 2 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "wearables", DisplayName = "Wearables", CategoryId = electronicsCategory.Id, Icon = "⌚", Image = "", Description = "Smartwatches and fitness", IsFeatured = true, DisplayOrder = 3 }
                });
            }

            // Home & Living SubCategories
            var homeCategory = insertedCategories.FirstOrDefault(c => c.Name == "home-living");
            if (homeCategory != null)
            {
                subCategories.AddRange(new List<SubCategory>
                {
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "furniture", DisplayName = "furniture", CategoryId = homeCategory.Id, Icon = "🛋️", Image = "", Description = "Home furniture", IsFeatured = true, DisplayOrder = 0 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "bedding", DisplayName = "Bedding", CategoryId = homeCategory.Id, Icon = "🛏️", Image = "", Description = "Bed sheets and linens", IsFeatured = false, DisplayOrder = 1 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "decor", DisplayName = "Decor", CategoryId = homeCategory.Id, Icon = "🏺", Image = "", Description = "Home decoration", IsFeatured = true, DisplayOrder = 2 }
                });
            }

            // Beauty SubCategories
            var beautyCategory = insertedCategories.FirstOrDefault(c => c.Name == "beauty");
            if (beautyCategory != null)
            {
                subCategories.AddRange(new List<SubCategory>
                {
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "makeup", DisplayName = "Makeup", CategoryId = beautyCategory.Id, Icon = "💄", Image = "", Description = "Makeup products", IsFeatured = true, DisplayOrder = 0 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "skincare", DisplayName = "Skincare", CategoryId = beautyCategory.Id, Icon = "🧴", Image = "", Description = "Skin care products", IsFeatured = true, DisplayOrder = 1 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "haircare", DisplayName = "Haircare", CategoryId = beautyCategory.Id, Icon = "💇", Image = "", Description = "Hair care products", IsFeatured = false, DisplayOrder = 2 }
                });
            }

            // Sports SubCategories
            var sportsCategory = insertedCategories.FirstOrDefault(c => c.Name == "sports");
            if (sportsCategory != null)
            {
                subCategories.AddRange(new List<SubCategory>
                {
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "fitness", DisplayName = "Fitness", CategoryId = sportsCategory.Id, Icon = "🏋️", Image = "", Description = "Fitness equipment", IsFeatured = true, DisplayOrder = 0 },
                    new SubCategory { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "outdoor-sports", DisplayName = "Outdoor Sports", CategoryId = sportsCategory.Id, Icon = "⚽", Image = "", Description = "Outdoor sports gear", IsFeatured = false, DisplayOrder = 1 }
                });
            }
        }

        await _context.SubCategories.InsertManyAsync(subCategories);

        // Seed Companies - 18 diverse companies
        var companies = new List<Company>
        {
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Nike", DisplayName = "Nike", Logo = "", Description = "Sports and fashion brand", Category = "fashion", IsVerified = true, IsFeatured = true, Rating = 4.5m, ReviewCount = 12500, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Samsung", DisplayName = "Samsung", Logo = "", Description = "Electronics giant", Category = "electronics", IsVerified = true, IsFeatured = true, Rating = 4.3m, ReviewCount = 8900, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "IKEA", DisplayName = "IKEA", Logo = "", Description = "Home furniture", Category = "home-living", IsVerified = true, IsFeatured = true, Rating = 4.4m, ReviewCount = 6700, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "L'Oreal", DisplayName = "L'Oreal", Logo = "", Description = "Beauty products", Category = "beauty", IsVerified = true, IsFeatured = true, Rating = 4.2m, ReviewCount = 5400, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Adidas", DisplayName = "Adidas", Logo = "", Description = "Sports brand", Category = "sports", IsVerified = true, IsFeatured = true, Rating = 4.4m, ReviewCount = 9800, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Penguin", DisplayName = "Penguin", Logo = "", Description = "Books publisher", Category = "books", IsVerified = true, IsFeatured = false, Rating = 4.1m, ReviewCount = 3200, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Tanishq", DisplayName = "Tanishq", Logo = "", Description = "Gold and diamond jewelry", Category = "jewelry", IsVerified = true, IsFeatured = true, Rating = 4.6m, ReviewCount = 8900, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Puma", DisplayName = "Puma", Logo = "", Description = "Sports footwear and apparel", Category = "footwear", IsVerified = true, IsFeatured = true, Rating = 4.3m, ReviewCount = 7600, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "H&M", DisplayName = "H&M", Logo = "", Description = "Kids fashion and clothing", Category = "kids", IsVerified = true, IsFeatured = true, Rating = 4.2m, ReviewCount = 5400, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Prestige", DisplayName = "Prestige", Logo = "", Description = "Kitchen appliances and cookware", Category = "kitchen", IsVerified = true, IsFeatured = false, Rating = 4.3m, ReviewCount = 4500, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "BigBasket", DisplayName = "BigBasket", Logo = "", Description = "Online grocery store", Category = "grocery", IsVerified = true, IsFeatured = false, Rating = 4.1m, ReviewCount = 12000, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Himalaya", DisplayName = "Himalaya", Logo = "", Description = "Healthcare and wellness", Category = "health", IsVerified = true, IsFeatured = false, Rating = 4.4m, ReviewCount = 6700, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "3M", DisplayName = "3M", Logo = "", Description = "Automotive accessories", Category = "automotive", IsVerified = true, IsFeatured = false, Rating = 4.2m, ReviewCount = 3200, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Lego", DisplayName = "Lego", Logo = "", Description = "Construction toys and games", Category = "toys", IsVerified = true, IsFeatured = true, Rating = 4.7m, ReviewCount = 15000, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Godrej", DisplayName = "Godrej", Logo = "", Description = "Home and office furniture", Category = "furniture", IsVerified = true, IsFeatured = false, Rating = 4.3m, ReviewCount = 5600, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Fossil", DisplayName = "Fossil", Logo = "", Description = "Fashion watches and accessories", Category = "watches", IsVerified = true, IsFeatured = true, Rating = 4.4m, ReviewCount = 4300, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Wildcraft", DisplayName = "Wildcraft", Logo = "", Description = "Backpacks and travel gear", Category = "bags", IsVerified = true, IsFeatured = false, Rating = 4.2m, ReviewCount = 3800, TotalProducts = 0 },
            new Company { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), Name = "Ray-Ban", DisplayName = "Ray-Ban", Logo = "", Description = "Fashion accessories and eyewear", Category = "accessories", IsVerified = true, IsFeatured = true, Rating = 4.5m, ReviewCount = 7200, TotalProducts = 0 }
        };

        await _context.Companies.InsertManyAsync(companies);

        // Get the inserted companies with their IDs
        var insertedCompanies = await _context.Companies.Find(_ => true).ToListAsync();

        // Seed Vendors - 18 diverse vendors
        var vendors = new List<Vendor>
        {
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Fashion Hub", DisplayName = "Fashion Hub", Email = "vendor1@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543210", BusinessType = "fashion", IsVerified = true, Rating = 4.5m, ReviewCount = 1200, TotalSales = 5000, TotalRevenue = 2500000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Tech Store", DisplayName = "Tech Store", Email = "vendor2@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543211", BusinessType = "electronics", IsVerified = true, Rating = 4.3m, ReviewCount = 980, TotalSales = 3500, TotalRevenue = 17500000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Home Essentials", DisplayName = "Home Essentials", Email = "vendor3@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543212", BusinessType = "home-living", IsVerified = true, Rating = 4.4m, ReviewCount = 850, TotalSales = 2800, TotalRevenue = 1400000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Beauty Zone", DisplayName = "Beauty Zone", Email = "vendor4@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543213", BusinessType = "beauty", IsVerified = true, Rating = 4.2m, ReviewCount = 720, TotalSales = 2200, TotalRevenue = 1100000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Sports World", DisplayName = "Sports World", Email = "vendor5@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543214", BusinessType = "sports", IsVerified = true, Rating = 4.4m, ReviewCount = 1100, TotalSales = 4200, TotalRevenue = 2100000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Book Haven", DisplayName = "Book Haven", Email = "vendor6@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543215", BusinessType = "books", IsVerified = true, Rating = 4.1m, ReviewCount = 650, TotalSales = 1800, TotalRevenue = 900000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Jewelry Palace", DisplayName = "Jewelry Palace", Email = "vendor7@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543216", BusinessType = "jewelry", IsVerified = true, Rating = 4.6m, ReviewCount = 890, TotalSales = 3200, TotalRevenue = 8900000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Footwear Factory", DisplayName = "Footwear Factory", Email = "vendor8@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543217", BusinessType = "footwear", IsVerified = true, Rating = 4.3m, ReviewCount = 760, TotalSales = 4100, TotalRevenue = 2050000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Kids Corner", DisplayName = "Kids Corner", Email = "vendor9@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543218", BusinessType = "kids", IsVerified = true, Rating = 4.2m, ReviewCount = 540, TotalSales = 2900, TotalRevenue = 1450000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Kitchen Pro", DisplayName = "Kitchen Pro", Email = "vendor10@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543219", BusinessType = "kitchen", IsVerified = true, Rating = 4.3m, ReviewCount = 450, TotalSales = 1800, TotalRevenue = 900000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Fresh Mart", DisplayName = "Fresh Mart", Email = "vendor11@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543220", BusinessType = "grocery", IsVerified = true, Rating = 4.1m, ReviewCount = 1200, TotalSales = 8500, TotalRevenue = 4250000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Health Plus", DisplayName = "Health Plus", Email = "vendor12@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543221", BusinessType = "health", IsVerified = true, Rating = 4.4m, ReviewCount = 670, TotalSales = 2400, TotalRevenue = 1200000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Auto Parts", DisplayName = "Auto Parts", Email = "vendor13@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543222", BusinessType = "automotive", IsVerified = true, Rating = 4.2m, ReviewCount = 320, TotalSales = 1500, TotalRevenue = 750000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Toy Kingdom", DisplayName = "Toy Kingdom", Email = "vendor14@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543223", BusinessType = "toys", IsVerified = true, Rating = 4.7m, ReviewCount = 1500, TotalSales = 6200, TotalRevenue = 3100000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Furniture World", DisplayName = "Furniture World", Email = "vendor15@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543224", BusinessType = "furniture", IsVerified = true, Rating = 4.3m, ReviewCount = 560, TotalSales = 2100, TotalRevenue = 1050000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Watch Gallery", DisplayName = "Watch Gallery", Email = "vendor16@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543225", BusinessType = "watches", IsVerified = true, Rating = 4.4m, ReviewCount = 430, TotalSales = 1900, TotalRevenue = 950000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Bag Emporium", DisplayName = "Bag Emporium", Email = "vendor17@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543226", BusinessType = "bags", IsVerified = true, Rating = 4.2m, ReviewCount = 380, TotalSales = 1600, TotalRevenue = 800000m },
            new Vendor { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), CompanyName = "Style Accessories", DisplayName = "Style Accessories", Email = "vendor18@example.com", Password = HashPassword("password123"), PhoneNumber = "9876543227", BusinessType = "accessories", IsVerified = true, Rating = 4.5m, ReviewCount = 720, TotalSales = 2800, TotalRevenue = 1400000m }
        };

        await _context.Vendors.InsertManyAsync(vendors);

        // Get the inserted vendors with their IDs
        var insertedVendors = await _context.Vendors.Find(_ => true).ToListAsync();

        // Seed Users
        var users = new List<User>
        {
            new User { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), FullName = "Admin User", Email = "admin@happyshopping.com", Password = HashPassword("Admin@123"), PhoneNumber = "9999999999", Role = "Admin", IsPremier = true, PremierExpiryDate = DateTime.UtcNow.AddDays(365), TotalSpent = 0, OrderCount = 0 },
            new User { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), FullName = "Premier User", Email = "premier@happyshopping.com", Password = HashPassword("Premier@123"), PhoneNumber = "8888888888", Role = "Normal", IsPremier = true, PremierExpiryDate = DateTime.UtcNow.AddDays(365), TotalSpent = 50000, OrderCount = 25 },
            new User { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), FullName = "Normal User", Email = "user@happyshopping.com", Password = HashPassword("User@123"), PhoneNumber = "7777777777", Role = "Normal", IsPremier = false, TotalSpent = 15000, OrderCount = 8 },
            new User { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), FullName = "John Doe", Email = "john@example.com", Password = HashPassword("John@123"), PhoneNumber = "6666666666", Role = "Normal", IsPremier = false, TotalSpent = 8000, OrderCount = 4 },
            new User { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), FullName = "Jane Smith", Email = "jane@example.com", Password = HashPassword("Jane@123"), PhoneNumber = "5555555555", Role = "Normal", IsPremier = true, PremierExpiryDate = DateTime.UtcNow.AddDays(180), TotalSpent = 35000, OrderCount = 18 }
        };

        await _context.Users.InsertManyAsync(users);

        // Get the inserted users with their IDs
        var insertedUsers = await _context.Users.Find(_ => true).ToListAsync();

        // Seed Products - 60+ products with variants across all categories
        var products = new List<Product>();
        
        if (insertedVendors.Count > 0 && insertedCompanies.Count > 0)
        {
            // Fashion Products (10 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[0].Id ?? "", CompanyId = insertedCompanies[0].Id ?? "", Name = "Men's Casual Shirt", Description = "Comfortable cotton shirt", Price = 599m, OriginalPrice = 999m, DiscountPercentage = 40, Category = "fashion", SubCategory = "men's-wear", IsFeatured = true, IsTrending = true, Rating = 4.5m, ReviewCount = 1200, Stock = 500, SoldCount = 2500, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500" }, Variants = new List<ProductVariant> { new ProductVariant { Id = Guid.NewGuid().ToString(), Color = "Blue", ColorCode = "#0000FF", Sizes = new List<string> { "S", "M", "L", "XL" }, Price = 599m, Stock = 125 }, new ProductVariant { Id = Guid.NewGuid().ToString(), Color = "White", ColorCode = "#FFFFFF", Sizes = new List<string> { "S", "M", "L" }, Price = 599m, Stock = 100 } } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[0].Id ?? "", CompanyId = insertedCompanies[0].Id ?? "", Name = "Women's Dress", Description = "Elegant party dress", Price = 899m, OriginalPrice = 1499m, DiscountPercentage = 40, Category = "fashion", SubCategory = "women's-wear", IsFeatured = true, IsTrending = false, Rating = 4.3m, ReviewCount = 890, Stock = 300, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500" }, Variants = new List<ProductVariant> { new ProductVariant { Id = Guid.NewGuid().ToString(), Color = "Red", ColorCode = "#FF0000", Sizes = new List<string> { "S", "M", "L" }, Price = 899m, Stock = 100 }, new ProductVariant { Id = Guid.NewGuid().ToString(), Color = "Black", ColorCode = "#000000", Sizes = new List<string> { "S", "M", "L", "XL" }, Price = 899m, Stock = 150 } } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[0].Id ?? "", CompanyId = insertedCompanies[0].Id ?? "", Name = "Men's T-Shirt", Description = "Premium cotton t-shirt", Price = 399m, OriginalPrice = 699m, DiscountPercentage = 43, Category = "fashion", SubCategory = "men's-wear", IsFeatured = false, IsTrending = true, Rating = 4.2m, ReviewCount = 560, Stock = 800, SoldCount = 3200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[0].Id ?? "", CompanyId = insertedCompanies[0].Id ?? "", Name = "Women's Top", Description = "Stylish casual top", Price = 449m, OriginalPrice = 799m, DiscountPercentage = 44, Category = "fashion", SubCategory = "women's-wear", IsFeatured = false, IsTrending = true, Rating = 4.1m, ReviewCount = 450, Stock = 600, SoldCount = 2800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[0].Id ?? "", CompanyId = insertedCompanies[0].Id ?? "", Name = "Men's Jeans", Description = "Slim fit denim jeans", Price = 999m, OriginalPrice = 1599m, DiscountPercentage = 38, Category = "fashion", SubCategory = "men's-wear", IsFeatured = true, IsTrending = false, Rating = 4.4m, ReviewCount = 980, Stock = 400, SoldCount = 1900, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[0].Id ?? "", CompanyId = insertedCompanies[0].Id ?? "", Name = "Women's Jeans", Description = "High waist skinny jeans", Price = 899m, OriginalPrice = 1399m, DiscountPercentage = 36, Category = "fashion", SubCategory = "women's-wear", IsFeatured = true, IsTrending = true, Rating = 4.3m, ReviewCount = 870, Stock = 350, SoldCount = 2100, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[0].Id ?? "", CompanyId = insertedCompanies[0].Id ?? "", Name = "Men's Blazer", Description = "Formal blazer for men", Price = 1999m, OriginalPrice = 3499m, DiscountPercentage = 43, Category = "fashion", SubCategory = "men's-wear", IsFeatured = false, IsTrending = false, Rating = 4.5m, ReviewCount = 340, Stock = 150, SoldCount = 680, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[0].Id ?? "", CompanyId = insertedCompanies[0].Id ?? "", Name = "Women's Kurti", Description = "Traditional ethnic wear", Price = 699m, OriginalPrice = 1199m, DiscountPercentage = 42, Category = "fashion", SubCategory = "women's-wear", IsFeatured = true, IsTrending = true, Rating = 4.4m, ReviewCount = 1200, Stock = 450, SoldCount = 3400, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[0].Id ?? "", CompanyId = insertedCompanies[0].Id ?? "", Name = "Men's Polo", Description = "Classic polo t-shirt", Price = 549m, OriginalPrice = 899m, DiscountPercentage = 39, Category = "fashion", SubCategory = "men's-wear", IsFeatured = false, IsTrending = false, Rating = 4.2m, ReviewCount = 670, Stock = 550, SoldCount = 2300, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1625910513413-5fc45e60f2a2?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[0].Id ?? "", CompanyId = insertedCompanies[0].Id ?? "", Name = "Women's Saree", Description = "Designer silk saree", Price = 1499m, OriginalPrice = 2499m, DiscountPercentage = 40, Category = "fashion", SubCategory = "women's-wear", IsFeatured = true, IsTrending = false, Rating = 4.6m, ReviewCount = 890, Stock = 200, SoldCount = 1200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500" } }
            });

            // Electronics Products (8 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[1].Id ?? "", CompanyId = insertedCompanies[1].Id ?? "", Name = "Smartphone", Description = "Latest smartphone with 5G", Price = 15000m, OriginalPrice = 20000m, DiscountPercentage = 25, Category = "electronics", SubCategory = "mobiles", IsFeatured = true, IsTrending = true, Rating = 4.5m, ReviewCount = 2500, Stock = 200, SoldCount = 3500, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[1].Id ?? "", CompanyId = insertedCompanies[1].Id ?? "", Name = "Laptop", Description = "High performance laptop", Price = 45000m, OriginalPrice = 60000m, DiscountPercentage = 25, Category = "electronics", SubCategory = "laptops", IsFeatured = true, IsTrending = false, Rating = 4.4m, ReviewCount = 1800, Stock = 100, SoldCount = 2200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[1].Id ?? "", CompanyId = insertedCompanies[1].Id ?? "", Name = "Wireless Earbuds", Description = "Bluetooth earbuds with noise cancellation", Price = 1999m, OriginalPrice = 3499m, DiscountPercentage = 43, Category = "electronics", SubCategory = "audio", IsFeatured = true, IsTrending = true, Rating = 4.3m, ReviewCount = 3200, Stock = 500, SoldCount = 8900, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[1].Id ?? "", CompanyId = insertedCompanies[1].Id ?? "", Name = "Smart Watch", Description = "Fitness tracking smartwatch", Price = 2999m, OriginalPrice = 4999m, DiscountPercentage = 40, Category = "electronics", SubCategory = "wearables", IsFeatured = true, IsTrending = true, Rating = 4.4m, ReviewCount = 2800, Stock = 300, SoldCount = 5600, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[1].Id ?? "", CompanyId = insertedCompanies[1].Id ?? "", Name = "Bluetooth Speaker", Description = "Portable bluetooth speaker", Price = 1499m, OriginalPrice = 2499m, DiscountPercentage = 40, Category = "electronics", SubCategory = "audio", IsFeatured = false, IsTrending = true, Rating = 4.2m, ReviewCount = 1900, Stock = 400, SoldCount = 4200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[1].Id ?? "", CompanyId = insertedCompanies[1].Id ?? "", Name = "Power Bank", Description = "20000mAh power bank", Price = 999m, OriginalPrice = 1599m, DiscountPercentage = 38, Category = "electronics", SubCategory = "accessories", IsFeatured = false, IsTrending = false, Rating = 4.1m, ReviewCount = 1500, Stock = 600, SoldCount = 3800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[1].Id ?? "", CompanyId = insertedCompanies[1].Id ?? "", Name = "USB Charger", Description = "Fast charging adapter", Price = 499m, OriginalPrice = 799m, DiscountPercentage = 38, Category = "electronics", SubCategory = "accessories", IsFeatured = false, IsTrending = false, Rating = 4.0m, ReviewCount = 2200, Stock = 800, SoldCount = 6500, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[1].Id ?? "", CompanyId = insertedCompanies[1].Id ?? "", Name = "Webcam HD", Description = "1080p HD webcam", Price = 2499m, OriginalPrice = 3999m, DiscountPercentage = 38, Category = "electronics", SubCategory = "accessories", IsFeatured = false, IsTrending = true, Rating = 4.3m, ReviewCount = 890, Stock = 250, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500" } }
            });

            // Home & Living Products (5 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[2].Id ?? "", CompanyId = insertedCompanies[2].Id ?? "", Name = "Sofa Set", Description = "Comfortable 3-seater sofa", Price = 25000m, OriginalPrice = 35000m, DiscountPercentage = 29, Category = "home-living", SubCategory = "furniture", IsFeatured = true, IsTrending = false, Rating = 4.3m, ReviewCount = 750, Stock = 50, SoldCount = 450, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[2].Id ?? "", CompanyId = insertedCompanies[2].Id ?? "", Name = "Bed Sheet Set", Description = "Premium cotton bed sheets", Price = 1299m, OriginalPrice = 1999m, DiscountPercentage = 35, Category = "home-living", SubCategory = "bedding", IsFeatured = true, IsTrending = true, Rating = 4.4m, ReviewCount = 1200, Stock = 300, SoldCount = 3400, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[2].Id ?? "", CompanyId = insertedCompanies[2].Id ?? "", Name = "Curtains Set", Description = "Decorative window curtains", Price = 899m, OriginalPrice = 1499m, DiscountPercentage = 40, Category = "home-living", SubCategory = "decor", IsFeatured = false, IsTrending = false, Rating = 4.2m, ReviewCount = 560, Stock = 400, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[2].Id ?? "", CompanyId = insertedCompanies[2].Id ?? "", Name = "Dining Table", Description = "6-seater dining table", Price = 15000m, OriginalPrice = 22000m, DiscountPercentage = 32, Category = "home-living", SubCategory = "furniture", IsFeatured = true, IsTrending = false, Rating = 4.5m, ReviewCount = 340, Stock = 30, SoldCount = 280, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[2].Id ?? "", CompanyId = insertedCompanies[2].Id ?? "", Name = "Wall Decor Set", Description = "Modern wall art decor", Price = 1999m, OriginalPrice = 2999m, DiscountPercentage = 33, Category = "home-living", SubCategory = "decor", IsFeatured = false, IsTrending = true, Rating = 4.3m, ReviewCount = 780, Stock = 200, SoldCount = 1200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500" } }
            });

            // Beauty Products (5 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[3].Id ?? "", CompanyId = insertedCompanies[3].Id ?? "", Name = "Lipstick Set", Description = "Premium lipstick collection", Price = 499m, OriginalPrice = 799m, DiscountPercentage = 38, Category = "beauty", SubCategory = "makeup", IsFeatured = true, IsTrending = true, Rating = 4.4m, ReviewCount = 1100, Stock = 600, SoldCount = 3200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[3].Id ?? "", CompanyId = insertedCompanies[3].Id ?? "", Name = "Face Cream", Description = "Moisturizing face cream", Price = 399m, OriginalPrice = 699m, DiscountPercentage = 43, Category = "beauty", SubCategory = "skincare", IsFeatured = true, IsTrending = true, Rating = 4.5m, ReviewCount = 1800, Stock = 500, SoldCount = 4500, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[3].Id ?? "", CompanyId = insertedCompanies[3].Id ?? "", Name = "Eyeshadow Palette", Description = "Professional eyeshadow palette", Price = 799m, OriginalPrice = 1299m, DiscountPercentage = 38, Category = "beauty", SubCategory = "makeup", IsFeatured = false, IsTrending = true, Rating = 4.3m, ReviewCount = 890, Stock = 300, SoldCount = 2100, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[3].Id ?? "", CompanyId = insertedCompanies[3].Id ?? "", Name = "Hair Serum", Description = "Smoothing hair serum", Price = 349m, OriginalPrice = 599m, DiscountPercentage = 42, Category = "beauty", SubCategory = "haircare", IsFeatured = false, IsTrending = false, Rating = 4.2m, ReviewCount = 650, Stock = 400, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[3].Id ?? "", CompanyId = insertedCompanies[3].Id ?? "", Name = "Foundation", Description = "Long-lasting foundation", Price = 599m, OriginalPrice = 999m, DiscountPercentage = 40, Category = "beauty", SubCategory = "makeup", IsFeatured = true, IsTrending = true, Rating = 4.4m, ReviewCount = 1400, Stock = 450, SoldCount = 3800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=500" } }
            });

            // Sports Products (5 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[4].Id ?? "", CompanyId = insertedCompanies[4].Id ?? "", Name = "Running Shoes", Description = "Professional running shoes", Price = 2999m, OriginalPrice = 4999m, DiscountPercentage = 40, Category = "sports", SubCategory = "footwear", IsFeatured = true, IsTrending = true, Rating = 4.5m, ReviewCount = 1800, Stock = 400, SoldCount = 4200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[4].Id ?? "", CompanyId = insertedCompanies[4].Id ?? "", Name = "Yoga Mat", Description = "Non-slip yoga mat", Price = 599m, OriginalPrice = 999m, DiscountPercentage = 40, Category = "sports", SubCategory = "fitness", IsFeatured = true, IsTrending = true, Rating = 4.3m, ReviewCount = 1200, Stock = 500, SoldCount = 3400, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[4].Id ?? "", CompanyId = insertedCompanies[4].Id ?? "", Name = "Dumbbells Set", Description = "Adjustable dumbbells set", Price = 2999m, OriginalPrice = 4999m, DiscountPercentage = 40, Category = "sports", SubCategory = "fitness", IsFeatured = false, IsTrending = false, Rating = 4.4m, ReviewCount = 560, Stock = 150, SoldCount = 890, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[4].Id ?? "", CompanyId = insertedCompanies[4].Id ?? "", Name = "Sports Bag", Description = "Large sports duffel bag", Price = 899m, OriginalPrice = 1499m, DiscountPercentage = 40, Category = "sports", SubCategory = "accessories", IsFeatured = false, IsTrending = true, Rating = 4.2m, ReviewCount = 780, Stock = 300, SoldCount = 2100, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[4].Id ?? "", CompanyId = insertedCompanies[4].Id ?? "", Name = "Cricket Kit", Description = "Complete cricket kit", Price = 4999m, OriginalPrice = 7999m, DiscountPercentage = 38, Category = "sports", SubCategory = "equipment", IsFeatured = true, IsTrending = false, Rating = 4.6m, ReviewCount = 340, Stock = 80, SoldCount = 450, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500" } }
            });

            // Books Products (4 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[5].Id ?? "", CompanyId = insertedCompanies[5].Id ?? "", Name = "Best Seller Novel", Description = "Top rated fiction novel", Price = 299m, OriginalPrice = 499m, DiscountPercentage = 40, Category = "books", SubCategory = "fiction", IsFeatured = true, IsTrending = true, Rating = 4.6m, ReviewCount = 2200, Stock = 500, SoldCount = 5600, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[5].Id ?? "", CompanyId = insertedCompanies[5].Id ?? "", Name = "Self Help Book", Description = "Motivational self help", Price = 349m, OriginalPrice = 599m, DiscountPercentage = 42, Category = "books", SubCategory = "self-help", IsFeatured = false, IsTrending = true, Rating = 4.4m, ReviewCount = 1800, Stock = 400, SoldCount = 4200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[5].Id ?? "", CompanyId = insertedCompanies[5].Id ?? "", Name = "Educational Book", Description = "Study guide for students", Price = 499m, OriginalPrice = 799m, DiscountPercentage = 38, Category = "books", SubCategory = "education", IsFeatured = false, IsTrending = false, Rating = 4.3m, ReviewCount = 890, Stock = 300, SoldCount = 2100, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[5].Id ?? "", CompanyId = insertedCompanies[5].Id ?? "", Name = "Biography Book", Description = "Inspiring biography", Price = 399m, OriginalPrice = 699m, DiscountPercentage = 43, Category = "books", SubCategory = "biography", IsFeatured = true, IsTrending = false, Rating = 4.5m, ReviewCount = 1200, Stock = 350, SoldCount = 2800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500" } }
            });

            // Jewelry Products (4 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[6].Id ?? "", CompanyId = insertedCompanies[6].Id ?? "", Name = "Gold Necklace", Description = "22K gold necklace", Price = 25000m, OriginalPrice = 35000m, DiscountPercentage = 29, Category = "jewelry", SubCategory = "gold", IsFeatured = true, IsTrending = true, Rating = 4.7m, ReviewCount = 450, Stock = 50, SoldCount = 340, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[6].Id ?? "", CompanyId = insertedCompanies[6].Id ?? "", Name = "Diamond Ring", Description = "Solitaire diamond ring", Price = 45000m, OriginalPrice = 65000m, DiscountPercentage = 31, Category = "jewelry", SubCategory = "diamond", IsFeatured = true, IsTrending = false, Rating = 4.8m, ReviewCount = 280, Stock = 20, SoldCount = 150, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[6].Id ?? "", CompanyId = insertedCompanies[6].Id ?? "", Name = "Silver Earrings", Description = "Sterling silver earrings", Price = 1499m, OriginalPrice = 2499m, DiscountPercentage = 40, Category = "jewelry", SubCategory = "silver", IsFeatured = false, IsTrending = true, Rating = 4.4m, ReviewCount = 890, Stock = 200, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[6].Id ?? "", CompanyId = insertedCompanies[6].Id ?? "", Name = "Fashion Bracelet", Description = "Trendy fashion bracelet", Price = 599m, OriginalPrice = 999m, DiscountPercentage = 40, Category = "jewelry", SubCategory = "fashion", IsFeatured = true, IsTrending = true, Rating = 4.3m, ReviewCount = 1200, Stock = 400, SoldCount = 3200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500" } }
            });

            // Footwear Products (4 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[7].Id ?? "", CompanyId = insertedCompanies[7].Id ?? "", Name = "Sports Shoes", Description = "High performance sports shoes", Price = 2499m, OriginalPrice = 3999m, DiscountPercentage = 38, Category = "footwear", SubCategory = "sports", IsFeatured = true, IsTrending = true, Rating = 4.5m, ReviewCount = 1800, Stock = 300, SoldCount = 4200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[7].Id ?? "", CompanyId = insertedCompanies[7].Id ?? "", Name = "Formal Shoes", Description = "Leather formal shoes", Price = 1999m, OriginalPrice = 3499m, DiscountPercentage = 43, Category = "footwear", SubCategory = "formal", IsFeatured = false, IsTrending = false, Rating = 4.4m, ReviewCount = 890, Stock = 200, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[7].Id ?? "", CompanyId = insertedCompanies[7].Id ?? "", Name = "Casual Sandals", Description = "Comfortable casual sandals", Price = 799m, OriginalPrice = 1299m, DiscountPercentage = 38, Category = "footwear", SubCategory = "casual", IsFeatured = true, IsTrending = true, Rating = 4.2m, ReviewCount = 1200, Stock = 400, SoldCount = 3400, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[7].Id ?? "", CompanyId = insertedCompanies[7].Id ?? "", Name = "Flip Flops", Description = "Beach flip flops", Price = 399m, OriginalPrice = 699m, DiscountPercentage = 43, Category = "footwear", SubCategory = "casual", IsFeatured = false, IsTrending = true, Rating = 4.1m, ReviewCount = 780, Stock = 500, SoldCount = 2800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500" } }
            });

            // Kids Products (4 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[8].Id ?? "", CompanyId = insertedCompanies[8].Id ?? "", Name = "Kids T-Shirt", Description = "Cotton t-shirt for kids", Price = 299m, OriginalPrice = 499m, DiscountPercentage = 40, Category = "kids", SubCategory = "clothing", IsFeatured = true, IsTrending = true, Rating = 4.3m, ReviewCount = 1200, Stock = 400, SoldCount = 3400, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[8].Id ?? "", CompanyId = insertedCompanies[8].Id ?? "", Name = "Kids Dress", Description = "Party dress for girls", Price = 599m, OriginalPrice = 999m, DiscountPercentage = 40, Category = "kids", SubCategory = "clothing", IsFeatured = true, IsTrending = false, Rating = 4.4m, ReviewCount = 890, Stock = 250, SoldCount = 2100, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[8].Id ?? "", CompanyId = insertedCompanies[8].Id ?? "", Name = "Kids Shoes", Description = "Comfortable shoes for kids", Price = 499m, OriginalPrice = 799m, DiscountPercentage = 38, Category = "kids", SubCategory = "footwear", IsFeatured = false, IsTrending = true, Rating = 4.2m, ReviewCount = 780, Stock = 300, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[8].Id ?? "", CompanyId = insertedCompanies[8].Id ?? "", Name = "School Bag", Description = "School bag for kids", Price = 699m, OriginalPrice = 1199m, DiscountPercentage = 42, Category = "kids", SubCategory = "accessories", IsFeatured = true, IsTrending = true, Rating = 4.5m, ReviewCount = 1500, Stock = 350, SoldCount = 4200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" } }
            });

            // Kitchen Products (4 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[9].Id ?? "", CompanyId = insertedCompanies[9].Id ?? "", Name = "Non-Stick Cookware", Description = "Non-stick cookware set", Price = 2999m, OriginalPrice = 4999m, DiscountPercentage = 40, Category = "kitchen", SubCategory = "cookware", IsFeatured = true, IsTrending = true, Rating = 4.4m, ReviewCount = 890, Stock = 200, SoldCount = 2100, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[9].Id ?? "", CompanyId = insertedCompanies[9].Id ?? "", Name = "Dinner Set", Description = "Premium dinner set", Price = 1999m, OriginalPrice = 3499m, DiscountPercentage = 43, Category = "kitchen", SubCategory = "dining", IsFeatured = true, IsTrending = false, Rating = 4.3m, ReviewCount = 670, Stock = 150, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1603199506016-5d54ebef7609?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[9].Id ?? "", CompanyId = insertedCompanies[9].Id ?? "", Name = "Kitchen Knife Set", Description = "Professional knife set", Price = 1499m, OriginalPrice = 2499m, DiscountPercentage = 40, Category = "kitchen", SubCategory = "tools", IsFeatured = false, IsTrending = true, Rating = 4.5m, ReviewCount = 560, Stock = 300, SoldCount = 1400, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[9].Id ?? "", CompanyId = insertedCompanies[9].Id ?? "", Name = "Storage Containers", Description = "Food storage containers", Price = 799m, OriginalPrice = 1299m, DiscountPercentage = 38, Category = "kitchen", SubCategory = "storage", IsFeatured = false, IsTrending = false, Rating = 4.2m, ReviewCount = 890, Stock = 400, SoldCount = 2300, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500" } }
            });

            // Toys Products (4 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[13].Id ?? "", CompanyId = insertedCompanies[13].Id ?? "", Name = "Building Blocks", Description = "Educational building blocks", Price = 1499m, OriginalPrice = 2499m, DiscountPercentage = 40, Category = "toys", SubCategory = "educational", IsFeatured = true, IsTrending = true, Rating = 4.7m, ReviewCount = 1800, Stock = 300, SoldCount = 5200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[13].Id ?? "", CompanyId = insertedCompanies[13].Id ?? "", Name = "Remote Control Car", Description = "Fast remote control car", Price = 1999m, OriginalPrice = 3499m, DiscountPercentage = 43, Category = "toys", SubCategory = "vehicles", IsFeatured = true, IsTrending = true, Rating = 4.5m, ReviewCount = 1200, Stock = 200, SoldCount = 3400, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[13].Id ?? "", CompanyId = insertedCompanies[13].Id ?? "", Name = "Board Game Set", Description = "Classic board games collection", Price = 999m, OriginalPrice = 1599m, DiscountPercentage = 38, Category = "toys", SubCategory = "games", IsFeatured = false, IsTrending = false, Rating = 4.4m, ReviewCount = 780, Stock = 250, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1610890716271-e2fe9e9a0c0d?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[13].Id ?? "", CompanyId = insertedCompanies[13].Id ?? "", Name = "Puzzle Set", Description = "Educational puzzle games", Price = 599m, OriginalPrice = 999m, DiscountPercentage = 40, Category = "toys", SubCategory = "educational", IsFeatured = false, IsTrending = true, Rating = 4.3m, ReviewCount = 650, Stock = 350, SoldCount = 2100, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1606307585776-427c3c614ed0?w=500" } }
            });

            // Watches Products (3 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[15].Id ?? "", CompanyId = insertedCompanies[15].Id ?? "", Name = "Analog Watch", Description = "Classic analog watch", Price = 3999m, OriginalPrice = 6999m, DiscountPercentage = 43, Category = "watches", SubCategory = "analog", IsFeatured = true, IsTrending = true, Rating = 4.5m, ReviewCount = 890, Stock = 150, SoldCount = 2100, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[15].Id ?? "", CompanyId = insertedCompanies[15].Id ?? "", Name = "Digital Watch", Description = "Modern digital watch", Price = 1999m, OriginalPrice = 3499m, DiscountPercentage = 43, Category = "watches", SubCategory = "digital", IsFeatured = true, IsTrending = true, Rating = 4.3m, ReviewCount = 1200, Stock = 250, SoldCount = 3400, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[15].Id ?? "", CompanyId = insertedCompanies[15].Id ?? "", Name = "Sports Watch", Description = "Waterproof sports watch", Price = 2499m, OriginalPrice = 4499m, DiscountPercentage = 44, Category = "watches", SubCategory = "sports", IsFeatured = false, IsTrending = false, Rating = 4.4m, ReviewCount = 780, Stock = 200, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500" } }
            });

            // Bags Products (3 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[16].Id ?? "", CompanyId = insertedCompanies[16].Id ?? "", Name = "Backpack", Description = "Travel backpack", Price = 1499m, OriginalPrice = 2499m, DiscountPercentage = 40, Category = "bags", SubCategory = "backpacks", IsFeatured = true, IsTrending = true, Rating = 4.4m, ReviewCount = 1200, Stock = 300, SoldCount = 3400, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[16].Id ?? "", CompanyId = insertedCompanies[16].Id ?? "", Name = "Handbag", Description = "Designer handbag", Price = 1999m, OriginalPrice = 3499m, DiscountPercentage = 43, Category = "bags", SubCategory = "handbags", IsFeatured = true, IsTrending = false, Rating = 4.5m, ReviewCount = 890, Stock = 200, SoldCount = 2100, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[16].Id ?? "", CompanyId = insertedCompanies[16].Id ?? "", Name = "Travel Bag", Description = "Large travel bag", Price = 2499m, OriginalPrice = 4499m, DiscountPercentage = 44, Category = "bags", SubCategory = "travel", IsFeatured = false, IsTrending = true, Rating = 4.3m, ReviewCount = 670, Stock = 150, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" } }
            });

            // Accessories Products (3 products)
            products.AddRange(new List<Product>
            {
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[17].Id ?? "", CompanyId = insertedCompanies[17].Id ?? "", Name = "Sunglasses", Description = "UV protection sunglasses", Price = 999m, OriginalPrice = 1799m, DiscountPercentage = 44, Category = "accessories", SubCategory = "eyewear", IsFeatured = true, IsTrending = true, Rating = 4.4m, ReviewCount = 1500, Stock = 400, SoldCount = 4200, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[17].Id ?? "", CompanyId = insertedCompanies[17].Id ?? "", Name = "Wallet", Description = "Leather wallet", Price = 599m, OriginalPrice = 999m, DiscountPercentage = 40, Category = "accessories", SubCategory = "wallets", IsFeatured = false, IsTrending = false, Rating = 4.2m, ReviewCount = 890, Stock = 300, SoldCount = 2100, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500" } },
                new Product { Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(), VendorId = insertedVendors[17].Id ?? "", CompanyId = insertedCompanies[17].Id ?? "", Name = "Belt", Description = "Genuine leather belt", Price = 499m, OriginalPrice = 899m, DiscountPercentage = 44, Category = "accessories", SubCategory = "belts", IsFeatured = false, IsTrending = true, Rating = 4.3m, ReviewCount = 780, Stock = 350, SoldCount = 1800, ImageUrls = new List<string> { "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" } }
            });
        }

        await _context.Products.InsertManyAsync(products);

        // Seed Reviews
        var reviews = new List<Review>();
        var reviewComments = new[] { "Amazing product!", "Great quality", "Value for money", "Fast delivery", "Excellent service", "Highly recommended" };
        var userNames = new[] { "John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "David Brown" };

        if (insertedUsers.Count > 3)
        {
            foreach (var product in products.Take(5))
            {
                for (int i = 0; i < 5; i++)
                {
                    reviews.Add(new Review
                    {
                        Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                        ProductId = product.Id ?? "",
                        UserId = insertedUsers[3].Id ?? "",
                        UserName = userNames[i],
                        UserAvatar = "",
                        Rating = new Random().Next(3, 6),
                        Comment = reviewComments[i],
                        IsVerifiedPurchase = true
                    });
                }
            }
        }

        await _context.Reviews.InsertManyAsync(reviews);

        // Seed Site Configuration
        var siteConfiguration = new SiteConfiguration
        {
            SiteName = "HappyShopping Clone",
            SiteDescription = "Your one-stop shop for everything you need",
            Site = new SiteSection
            {
                Name = "HappyShopping Clone",
                Description = "Your one-stop shop for everything you need",
                HeroImage = string.Empty,
                HeroImageBase64 = string.Empty,
                SlideshowImages = new List<string>(),
                SlideshowImagesBase64 = new List<string>(),
                EnableSlideshow = false,
                BasicInfoOrder = 1,
                HeroImageOrder = 2,
                SlideshowOrder = 3
            },
            Header = new HeaderConfiguration
            {
                Logo = string.Empty,
                LogoBase64 = string.Empty,
                LogoText = "HappyShopping",
                BackgroundColor = "#EC4899",
                BackgroundColorEnd = "#8B5CF6",
                TextColor = "#FFFFFF",
                Links = new List<HeaderLink>(),
                Icons = new List<HeaderIcon>(),
                MobileMenuIcon = string.Empty,
                MobileMenuIconBase64 = string.Empty,
                LogoBrandingOrder = 1,
                SearchSettingsOrder = 2,
                ShowSearchIcon = false,
                ShowLoginIcon = false,
                CustomIconsOrder = 4
            },
            Footer = new FooterConfiguration
            {
                CompanyName = "HappyShopping Clone",
                CompanyDescription = "Your trusted e-commerce platform",
                SocialLinks = new List<SocialNetworkLink>(),
                CompanyInfoOrder = 1,
                BusinessLinks = new List<BusinessLink>(),
                BusinessLinksOrder = 2,
                ContactFields = new List<ContactFieldNew>(),
                ContactUsOrder = 3,
                CopyrightText = "© 2024 HappyShopping Clone. All rights reserved.",
                CopyrightLinks = new List<CopyrightLinkNew>(),
                CopyrightSectionOrder = 4,
                BackgroundColor = "#1F2937",
                BackgroundColorEnd = "#111827",
                TextColor = "#FFFFFF",
                SocialLinksLegacy = new List<SocialMediaLink>(),
                ContactFieldsLegacy = new List<ContactField>(),
                Sections = new List<FooterSection>(),
                CopyrightLinksLegacy = new List<CopyrightLink>(),
                Logo = string.Empty,
                LogoBase64 = string.Empty
            }
        };
        siteConfiguration.Id = null;
        siteConfiguration.CreatedAt = DateTime.UtcNow;
        siteConfiguration.UpdatedAt = DateTime.UtcNow;
        await _context.SiteConfigurations.InsertOneAsync(siteConfiguration);

        return Ok(new { success = true, message = "Database seeded successfully with all required data" });
    }

    private string HashPassword(string password)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}
