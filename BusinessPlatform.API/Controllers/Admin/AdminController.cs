using System.Security.Claims;
using System.Text;
using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using BusinessPlatform.API.Seed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using MongoDB.Driver;

namespace BusinessPlatform.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ValidationService _validationService;

        public AdminController(MongoDbContext context, IConfiguration configuration, ValidationService validationService)
        {
            _context = context;
            _configuration = configuration;
            _validationService = validationService;
        }

        private string HashPassword(string password)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id!),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (user == null || user.Password != HashPassword(request.Password))
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Account is inactive" });
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token, user = new { user.Id, user.Email, user.FullName, user.Role } });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var existingUser = await _context.Users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already registered" });
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                Password = HashPassword(request.Password),
                FullName = request.FullName,
                Phone = request.Phone,
                Role = "User",
                IsActive = true
            };

            await _context.Users.InsertOneAsync(user);
            return Ok(new { message = "User registered successfully", user });
        }

        [HttpGet("users")]
        [Authorize]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.Find(_ => true).ToListAsync();
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        [Authorize]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
            return Ok(user);
        }

        [HttpPut("users/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] User user)
        {
            var existingUser = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Only update password if a new one is provided
            if (!string.IsNullOrEmpty(user.Password))
            {
                user.Password = HashPassword(user.Password);
            }
            else
            {
                user.Password = existingUser.Password;
            }

            user.Id = id;
            var result = await _context.Users.ReplaceOneAsync(u => u.Id == id, user);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "User not found" });
            }
            return Ok(new { message = "User updated successfully" });
        }

        [HttpDelete("users/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _context.Users.DeleteOneAsync(u => u.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "User not found" });
            }
            return Ok(new { message = "User deleted successfully" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = await _context.Users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.Password = HashPassword(request.NewPassword);
            var result = await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "User not found" });
            }
            return Ok(new { message = "Password reset successfully" });
        }

        [HttpGet("dashboard")]
        [Authorize]
        public async Task<IActionResult> GetDashboard()
        {
            var totalUsers = (int)await _context.Users.CountDocumentsAsync(FilterDefinition<User>.Empty);
            var totalProducts = (int)await _context.Products.CountDocumentsAsync(FilterDefinition<Product>.Empty);
            var totalOrders = (int)await _context.ShoppingOrders.CountDocumentsAsync(FilterDefinition<ShoppingOrder>.Empty);
            var totalAds = (int)await _context.Advertisements.CountDocumentsAsync(FilterDefinition<Advertisement>.Empty);
            var totalJobs = (int)await _context.Jobs.CountDocumentsAsync(FilterDefinition<Job>.Empty);
            var totalBookings = (int)await _context.Bookings.CountDocumentsAsync(FilterDefinition<Booking>.Empty);

            var orders = await _context.ShoppingOrders.Find(FilterDefinition<ShoppingOrder>.Empty).ToListAsync();
            var totalRevenue = orders.Where(o => o.Status == "Delivered").Sum(o => o.Total);

            var dashboard = new AdminDashboard
            {
                TotalUsers = (int)totalUsers,
                TotalProducts = (int)totalProducts,
                TotalOrders = (int)totalOrders,
                TotalAds = (int)totalAds,
                TotalJobs = (int)totalJobs,
                TotalBookings = (int)totalBookings,
                TotalRevenue = (double)totalRevenue
            };

            return Ok(dashboard);
        }

        [HttpGet("orders/all")]
        [Authorize]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.ShoppingOrders.Find(FilterDefinition<ShoppingOrder>.Empty).ToListAsync();
            return Ok(orders);
        }

        [HttpPut("orders/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] StatusUpdateRequest request)
        {
            var update = Builders<ShoppingOrder>.Update.Set(o => o.Status, request.Status);
            var result = await _context.ShoppingOrders.UpdateOneAsync(o => o.Id == id, update);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Order not found" });
            }
            return Ok(new { message = "Order status updated successfully" });
        }

        [HttpDelete("orders/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteOrder(string id)
        {
            var result = await _context.ShoppingOrders.DeleteOneAsync(o => o.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Order not found" });
            }
            return Ok(new { message = "Order deleted successfully" });
        }

        // Products CRUD
        [HttpGet("products")]
        [Authorize]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products.Find(_ => true).ToListAsync();
            var sortedProducts = products.OrderBy(p => p.DisplaySequence).ToList();
            return Ok(sortedProducts);
        }

        [HttpGet("products/next-sequence/{categoryName}")]
        [Authorize]
        public async Task<IActionResult> GetNextDisplaySequence(string categoryName)
        {
            var lastProduct = await _context.Products
                .Find(p => p.CategoryName == categoryName)
                .SortByDescending(p => p.DisplaySequence)
                .FirstOrDefaultAsync();
            
            var nextSequence = (lastProduct?.DisplaySequence ?? 0) + 1;
            return Ok(new { nextSequence });
        }

        [HttpPost("products")]
        [Authorize]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("Product");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", product.Name, validationSettings["name"]);
                if (!nameResult.IsValid) errors["name"] = nameResult.Errors;
            }

            if (validationSettings.ContainsKey("description"))
            {
                var descriptionResult = _validationService.ValidateField("description", product.Description, validationSettings["description"]);
                if (!descriptionResult.IsValid) errors["description"] = descriptionResult.Errors;
            }
            
            if (validationSettings.ContainsKey("price"))
            {
                var priceResult = _validationService.ValidateField("price", product.Price, validationSettings["price"]);
                if (!priceResult.IsValid) errors["price"] = priceResult.Errors;
            }
            
            if (validationSettings.ContainsKey("stock"))
            {
                var stockResult = _validationService.ValidateField("stock", product.Stock, validationSettings["stock"]);
                if (!stockResult.IsValid) errors["stock"] = stockResult.Errors;
            }
            
            if (validationSettings.ContainsKey("seller"))
            {
                var sellerResult = _validationService.ValidateField("seller", product.Seller, validationSettings["seller"]);
                if (!sellerResult.IsValid) errors["seller"] = sellerResult.Errors;
            }
            
            if (validationSettings.ContainsKey("imageUrl"))
            {
                var imageUrlResult = _validationService.ValidateField("imageUrl", product.ImageUrl, validationSettings["imageUrl"]);
                if (!imageUrlResult.IsValid) errors["imageUrl"] = imageUrlResult.Errors;
            }
            
            if (validationSettings.ContainsKey("imageUrls"))
            {
                var imageUrlsResult = _validationService.ValidateField("imageUrls", product.ImageUrls?.Count ?? 0, validationSettings["imageUrls"]);
                if (!imageUrlsResult.IsValid) errors["imageUrls"] = imageUrlsResult.Errors;
            }
            
            if (validationSettings.ContainsKey("categoryName"))
            {
                // Skip backend validation for categoryName if it's provided
                // Frontend handles the required validation
                if (string.IsNullOrEmpty(product.CategoryName))
                {
                    errors["categoryName"] = new List<string> { "Category is required" };
                }
            }
            
            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", product.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }
            
            if (validationSettings.ContainsKey("highlights"))
            {
                var highlightsResult = _validationService.ValidateField("highlights", product.Highlights?.Count ?? 0, validationSettings["highlights"]);
                if (!highlightsResult.IsValid) errors["highlights"] = highlightsResult.Errors;
            }
            
            if (validationSettings.ContainsKey("offerPercentage"))
            {
                var offerPercentageResult = _validationService.ValidateField("offerPercentage", product.OfferPercentage, validationSettings["offerPercentage"]);
                if (!offerPercentageResult.IsValid) errors["offerPercentage"] = offerPercentageResult.Errors;
            }

            if (validationSettings.ContainsKey("displaySequence"))
            {
                var displaySequenceResult = _validationService.ValidateField("displaySequence", product.DisplaySequence, validationSettings["displaySequence"]);
                if (!displaySequenceResult.IsValid) errors["displaySequence"] = displaySequenceResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            // Fallback to ModelState validation
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

            // Additional validation for highlights item length
            if (product.Highlights != null)
            {
                foreach (var highlight in product.Highlights)
                {
                    if (highlight.Length > 500)
                    {
                        return BadRequest(new { message = "Highlight must not exceed 500 characters" });
                    }
                }
            }

            if (product.OfferPercentage < 0 || product.OfferPercentage > 100)
            {
                return BadRequest(new { message = "Offer percentage must be between 0 and 100" });
            }

            // Validate image URLs - allow data URLs
            if (!string.IsNullOrEmpty(product.ImageUrl) && !product.ImageUrl.StartsWith("data:") && !Uri.TryCreate(product.ImageUrl, UriKind.Absolute, out _))
            {
                return BadRequest(new { message = "Invalid primary image URL format" });
            }

            if (product.ImageUrls != null)
            {
                foreach (var url in product.ImageUrls)
                {
                    if (!string.IsNullOrEmpty(url) && !url.StartsWith("data:") && !Uri.TryCreate(url, UriKind.Absolute, out _))
                    {
                        return BadRequest(new { message = "Invalid secondary image URL format" });
                    }
                }
            }

            product.Id = null;
            product.CreatedAt = DateTime.UtcNow;
            await _context.Products.InsertOneAsync(product);

            // Add or update category in category table
            var existingCategory = await _context.Categories.Find(c => c.Name == product.CategoryName).FirstOrDefaultAsync();
            if (existingCategory == null)
            {
                // Create new category with default values
                var newCategory = new Category
                {
                    Name = product.CategoryName,
                    Description = "",
                    ImageUrl = "",
                    Status = "Active",
                    DisplaySequence = 0,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Categories.InsertOneAsync(newCategory);
            }

            return Ok(new { message = "Product created successfully", product });
        }

        [HttpPut("products/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct(string id, [FromBody] Product product)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("Product");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", product.Name, validationSettings["name"]);
                if (!nameResult.IsValid) errors["name"] = nameResult.Errors;
            }

            if (validationSettings.ContainsKey("description"))
            {
                var descriptionResult = _validationService.ValidateField("description", product.Description, validationSettings["description"]);
                if (!descriptionResult.IsValid) errors["description"] = descriptionResult.Errors;
            }
            
            if (validationSettings.ContainsKey("price"))
            {
                var priceResult = _validationService.ValidateField("price", product.Price, validationSettings["price"]);
                if (!priceResult.IsValid) errors["price"] = priceResult.Errors;
            }
            
            if (validationSettings.ContainsKey("stock"))
            {
                var stockResult = _validationService.ValidateField("stock", product.Stock, validationSettings["stock"]);
                if (!stockResult.IsValid) errors["stock"] = stockResult.Errors;
            }
            
            if (validationSettings.ContainsKey("seller"))
            {
                var sellerResult = _validationService.ValidateField("seller", product.Seller, validationSettings["seller"]);
                if (!sellerResult.IsValid) errors["seller"] = sellerResult.Errors;
            }
            
            if (validationSettings.ContainsKey("imageUrl"))
            {
                var imageUrlResult = _validationService.ValidateField("imageUrl", product.ImageUrl, validationSettings["imageUrl"]);
                if (!imageUrlResult.IsValid) errors["imageUrl"] = imageUrlResult.Errors;
            }
            
            if (validationSettings.ContainsKey("imageUrls"))
            {
                var imageUrlsResult = _validationService.ValidateField("imageUrls", product.ImageUrls?.Count ?? 0, validationSettings["imageUrls"]);
                if (!imageUrlsResult.IsValid) errors["imageUrls"] = imageUrlsResult.Errors;
            }
            
            if (validationSettings.ContainsKey("categoryName"))
            {
                // Skip backend validation for categoryName if it's provided
                // Frontend handles the required validation
                if (string.IsNullOrEmpty(product.CategoryName))
                {
                    errors["categoryName"] = new List<string> { "Category is required" };
                }
            }
            
            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", product.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }
            
            if (validationSettings.ContainsKey("highlights"))
            {
                var highlightsResult = _validationService.ValidateField("highlights", product.Highlights?.Count ?? 0, validationSettings["highlights"]);
                if (!highlightsResult.IsValid) errors["highlights"] = highlightsResult.Errors;
            }
            
            if (validationSettings.ContainsKey("offerPercentage"))
            {
                var offerPercentageResult = _validationService.ValidateField("offerPercentage", product.OfferPercentage, validationSettings["offerPercentage"]);
                if (!offerPercentageResult.IsValid) errors["offerPercentage"] = offerPercentageResult.Errors;
            }

            if (validationSettings.ContainsKey("displaySequence"))
            {
                var displaySequenceResult = _validationService.ValidateField("displaySequence", product.DisplaySequence, validationSettings["displaySequence"]);
                if (!displaySequenceResult.IsValid) errors["displaySequence"] = displaySequenceResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            // Fallback to ModelState validation
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

            // Additional validation for highlights item length
            if (product.Highlights != null)
            {
                foreach (var highlight in product.Highlights)
                {
                    if (highlight.Length > 500)
                    {
                        return BadRequest(new { message = "Highlight must not exceed 500 characters" });
                    }
                }
            }

            if (product.OfferPercentage < 0 || product.OfferPercentage > 100)
            {
                return BadRequest(new { message = "Offer percentage must be between 0 and 100" });
            }

            // Validate image URLs - allow data URLs
            if (!string.IsNullOrEmpty(product.ImageUrl) && !product.ImageUrl.StartsWith("data:") && !Uri.TryCreate(product.ImageUrl, UriKind.Absolute, out _))
            {
                return BadRequest(new { message = "Invalid primary image URL format" });
            }

            if (product.ImageUrls != null)
            {
                foreach (var url in product.ImageUrls)
                {
                    if (!string.IsNullOrEmpty(url) && !url.StartsWith("data:") && !Uri.TryCreate(url, UriKind.Absolute, out _))
                    {
                        return BadRequest(new { message = "Invalid secondary image URL format" });
                    }
                }
            }

            product.Id = id;
            var result = await _context.Products.ReplaceOneAsync(p => p.Id == id, product);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Product not found" });
            }
            return Ok(new { message = "Product updated successfully" });
        }

        [HttpDelete("products/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var product = await _context.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            var result = await _context.Products.DeleteOneAsync(p => p.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Product not found" });
            }

            return Ok(new { message = "Product deleted successfully" });
        }

        [HttpPatch("products/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateProductStatus(string id, [FromBody] StatusUpdateRequest request)
        {
            var update = Builders<Product>.Update.Set(p => p.Status, request.Status);
            var result = await _context.Products.UpdateOneAsync(p => p.Id == id, update);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Product not found" });
            }
            return Ok(new { message = "Product status updated successfully" });
        }

        // Shopping Categories CRUD
        [HttpGet("categories")]
        [Authorize]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories.Find(_ => true).ToListAsync();
            var sortedCategories = categories.OrderBy(c => c.DisplaySequence).ToList();
            return Ok(sortedCategories);
        }

        [HttpGet("categories/next-sequence")]
        [Authorize]
        public async Task<IActionResult> GetNextCategorySequence()
        {
            var lastCategory = await _context.Categories
                .Find(_ => true)
                .SortByDescending(c => c.DisplaySequence)
                .FirstOrDefaultAsync();
            
            var nextSequence = (lastCategory?.DisplaySequence ?? 0) + 1;
            return Ok(new { nextSequence });
        }

        [HttpPost("categories")]
        [Authorize]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

            category.Id = null;
            category.CreatedAt = DateTime.UtcNow;
            await _context.Categories.InsertOneAsync(category);
            return Ok(new { message = "Category created successfully", category });
        }

        [HttpPut("categories/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateCategory(string id, [FromBody] Category category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

            category.Id = id;
            var result = await _context.Categories.ReplaceOneAsync(c => c.Id == id, category);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Category not found" });
            }
            return Ok(new { message = "Category updated successfully" });
        }

        [HttpDelete("categories/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteCategory(string id)
        {
            var category = await _context.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            // Delete all products with this category name
            await _context.Products.DeleteManyAsync(p => p.CategoryName == category.Name);

            // Delete the category
            var result = await _context.Categories.DeleteOneAsync(c => c.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Category not found" });
            }
            return Ok(new { message = "Category and all its products deleted successfully" });
        }

        // Ads CRUD
        [HttpPost("ads")]
        [Authorize]
        public async Task<IActionResult> CreateAd([FromBody] Advertisement ad)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("Advertisement");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("title"))
            {
                var titleResult = _validationService.ValidateField("title", ad.Title, validationSettings["title"]);
                if (!titleResult.IsValid) errors["title"] = titleResult.Errors;
            }

            if (validationSettings.ContainsKey("description"))
            {
                var descriptionResult = _validationService.ValidateField("description", ad.Description, validationSettings["description"]);
                if (!descriptionResult.IsValid) errors["description"] = descriptionResult.Errors;
            }

            if (validationSettings.ContainsKey("price"))
            {
                var priceResult = _validationService.ValidateField("price", ad.Price, validationSettings["price"]);
                if (!priceResult.IsValid) errors["price"] = priceResult.Errors;
            }

            if (validationSettings.ContainsKey("categoryName"))
            {
                var categoryNameResult = _validationService.ValidateField("categoryName", ad.CategoryName, validationSettings["categoryName"]);
                if (!categoryNameResult.IsValid) errors["categoryName"] = categoryNameResult.Errors;
            }

            if (validationSettings.ContainsKey("location"))
            {
                var locationResult = _validationService.ValidateField("location", ad.Location, validationSettings["location"]);
                if (!locationResult.IsValid) errors["location"] = locationResult.Errors;
            }

            if (validationSettings.ContainsKey("city"))
            {
                var cityResult = _validationService.ValidateField("city", ad.City, validationSettings["city"]);
                if (!cityResult.IsValid) errors["city"] = cityResult.Errors;
            }

            if (validationSettings.ContainsKey("condition"))
            {
                var conditionResult = _validationService.ValidateField("condition", ad.Condition, validationSettings["condition"]);
                if (!conditionResult.IsValid) errors["condition"] = conditionResult.Errors;
            }

            if (validationSettings.ContainsKey("sellerName"))
            {
                var sellerNameResult = _validationService.ValidateField("sellerName", ad.SellerName, validationSettings["sellerName"]);
                if (!sellerNameResult.IsValid) errors["sellerName"] = sellerNameResult.Errors;
            }

            if (validationSettings.ContainsKey("sellerPhone"))
            {
                var sellerPhoneResult = _validationService.ValidateField("sellerPhone", ad.SellerPhone, validationSettings["sellerPhone"]);
                if (!sellerPhoneResult.IsValid) errors["sellerPhone"] = sellerPhoneResult.Errors;
            }

            if (validationSettings.ContainsKey("sellerEmail"))
            {
                var sellerEmailResult = _validationService.ValidateField("sellerEmail", ad.SellerEmail, validationSettings["sellerEmail"]);
                if (!sellerEmailResult.IsValid) errors["sellerEmail"] = sellerEmailResult.Errors;
            }

            if (validationSettings.ContainsKey("imageUrl"))
            {
                var imageUrlResult = _validationService.ValidateField("imageUrl", ad.ImageUrl, validationSettings["imageUrl"]);
                if (!imageUrlResult.IsValid) errors["imageUrl"] = imageUrlResult.Errors;
            }

            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", ad.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            // Additional validation for image URLs - allow data URLs
            if (!string.IsNullOrEmpty(ad.ImageUrl) && !ad.ImageUrl.StartsWith("data:") && !Uri.TryCreate(ad.ImageUrl, UriKind.Absolute, out _))
            {
                return BadRequest(new { message = "Invalid image URL format" });
            }

            if (ad.ImageUrls != null)
            {
                foreach (var url in ad.ImageUrls)
                {
                    if (!string.IsNullOrEmpty(url) && !url.StartsWith("data:") && !Uri.TryCreate(url, UriKind.Absolute, out _))
                    {
                        return BadRequest(new { message = "Invalid image URL format in additional images" });
                    }
                }
            }

            ad.Id = null;
            ad.CreatedAt = DateTime.UtcNow;
            ad.UpdatedAt = DateTime.UtcNow;
            await _context.Advertisements.InsertOneAsync(ad);
            return Ok(new { message = "Advertisement created successfully", ad });
        }

        [HttpPut("ads/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAd(string id, [FromBody] Advertisement ad)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("Advertisement");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("title"))
            {
                var titleResult = _validationService.ValidateField("title", ad.Title, validationSettings["title"]);
                if (!titleResult.IsValid) errors["title"] = titleResult.Errors;
            }

            if (validationSettings.ContainsKey("description"))
            {
                var descriptionResult = _validationService.ValidateField("description", ad.Description, validationSettings["description"]);
                if (!descriptionResult.IsValid) errors["description"] = descriptionResult.Errors;
            }

            if (validationSettings.ContainsKey("price"))
            {
                var priceResult = _validationService.ValidateField("price", ad.Price, validationSettings["price"]);
                if (!priceResult.IsValid) errors["price"] = priceResult.Errors;
            }

            if (validationSettings.ContainsKey("categoryName"))
            {
                var categoryNameResult = _validationService.ValidateField("categoryName", ad.CategoryName, validationSettings["categoryName"]);
                if (!categoryNameResult.IsValid) errors["categoryName"] = categoryNameResult.Errors;
            }

            if (validationSettings.ContainsKey("location"))
            {
                var locationResult = _validationService.ValidateField("location", ad.Location, validationSettings["location"]);
                if (!locationResult.IsValid) errors["location"] = locationResult.Errors;
            }

            if (validationSettings.ContainsKey("city"))
            {
                var cityResult = _validationService.ValidateField("city", ad.City, validationSettings["city"]);
                if (!cityResult.IsValid) errors["city"] = cityResult.Errors;
            }

            if (validationSettings.ContainsKey("condition"))
            {
                var conditionResult = _validationService.ValidateField("condition", ad.Condition, validationSettings["condition"]);
                if (!conditionResult.IsValid) errors["condition"] = conditionResult.Errors;
            }

            if (validationSettings.ContainsKey("sellerName"))
            {
                var sellerNameResult = _validationService.ValidateField("sellerName", ad.SellerName, validationSettings["sellerName"]);
                if (!sellerNameResult.IsValid) errors["sellerName"] = sellerNameResult.Errors;
            }

            if (validationSettings.ContainsKey("sellerPhone"))
            {
                var sellerPhoneResult = _validationService.ValidateField("sellerPhone", ad.SellerPhone, validationSettings["sellerPhone"]);
                if (!sellerPhoneResult.IsValid) errors["sellerPhone"] = sellerPhoneResult.Errors;
            }

            if (validationSettings.ContainsKey("sellerEmail"))
            {
                var sellerEmailResult = _validationService.ValidateField("sellerEmail", ad.SellerEmail, validationSettings["sellerEmail"]);
                if (!sellerEmailResult.IsValid) errors["sellerEmail"] = sellerEmailResult.Errors;
            }

            if (validationSettings.ContainsKey("imageUrl"))
            {
                var imageUrlResult = _validationService.ValidateField("imageUrl", ad.ImageUrl, validationSettings["imageUrl"]);
                if (!imageUrlResult.IsValid) errors["imageUrl"] = imageUrlResult.Errors;
            }

            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", ad.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            // Additional validation for image URLs - allow data URLs
            if (!string.IsNullOrEmpty(ad.ImageUrl) && !ad.ImageUrl.StartsWith("data:") && !Uri.TryCreate(ad.ImageUrl, UriKind.Absolute, out _))
            {
                return BadRequest(new { message = "Invalid image URL format" });
            }

            if (ad.ImageUrls != null)
            {
                foreach (var url in ad.ImageUrls)
                {
                    if (!string.IsNullOrEmpty(url) && !url.StartsWith("data:") && !Uri.TryCreate(url, UriKind.Absolute, out _))
                    {
                        return BadRequest(new { message = "Invalid image URL format in additional images" });
                    }
                }
            }

            // Get existing ad to preserve imageUrls if not provided
            var existingAd = await _context.Advertisements.Find(a => a.Id == id).FirstOrDefaultAsync();
            if (existingAd == null)
            {
                return NotFound(new { message = "Advertisement not found" });
            }

            ad.Id = id;
            ad.UpdatedAt = DateTime.UtcNow;
            // Preserve imageUrls if not provided in update
            if (ad.ImageUrls == null || ad.ImageUrls.Count == 0)
            {
                ad.ImageUrls = existingAd.ImageUrls ?? new List<string>();
            }
            var result = await _context.Advertisements.ReplaceOneAsync(a => a.Id == id, ad);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Advertisement not found" });
            }
            return Ok(new { message = "Advertisement updated successfully" });
        }

        [HttpDelete("ads/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAd(string id)
        {
            var result = await _context.Advertisements.DeleteOneAsync(a => a.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Advertisement not found" });
            }
            return Ok(new { message = "Advertisement deleted successfully" });
        }

        [HttpPatch("ads/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateAdStatus(string id, [FromBody] StatusUpdateRequest request)
        {
            var update = Builders<Advertisement>.Update.Set(a => a.Status, request.Status);
            var result = await _context.Advertisements.UpdateOneAsync(a => a.Id == id, update);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Advertisement not found" });
            }
            return Ok(new { message = "Advertisement status updated successfully" });
        }

        // Seed Data
        [HttpPost("seed-data")]
        public async Task<IActionResult> SeedData()
        {
            try
            {
                var seedData = new SeedData(_context);
                await seedData.SeedAsync();
                return Ok(new { message = "Data seeded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error seeding data", error = ex.Message });
            }
        }

        // Public Seed Data (no auth required for development)
        [HttpPost("public-seed-data")]
        public async Task<IActionResult> PublicSeedData()
        {
            try
            {
                var seedData = new SeedData(_context);
                await seedData.SeedAsync();
                return Ok(new { message = "Data seeded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error seeding data", error = ex.Message });
            }
        }

        // Jobs CRUD
        [HttpGet("jobs")]
        [Authorize]
        public async Task<IActionResult> GetJobs()
        {
            var jobs = await _context.Jobs.Find(_ => true).ToListAsync();
            return Ok(jobs);
        }

        [HttpPost("jobs")]
        [Authorize]
        public async Task<IActionResult> CreateJob([FromBody] Job job)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("Job");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("title"))
            {
                var titleResult = _validationService.ValidateField("title", job.Title, validationSettings["title"]);
                if (!titleResult.IsValid) errors["title"] = titleResult.Errors;
            }

            if (validationSettings.ContainsKey("company"))
            {
                var companyResult = _validationService.ValidateField("company", job.Company, validationSettings["company"]);
                if (!companyResult.IsValid) errors["company"] = companyResult.Errors;
            }

            if (validationSettings.ContainsKey("location"))
            {
                var locationResult = _validationService.ValidateField("location", job.Location, validationSettings["location"]);
                if (!locationResult.IsValid) errors["location"] = locationResult.Errors;
            }

            if (validationSettings.ContainsKey("salary"))
            {
                var salaryResult = _validationService.ValidateField("salary", job.Salary, validationSettings["salary"]);
                if (!salaryResult.IsValid) errors["salary"] = salaryResult.Errors;
            }

            if (validationSettings.ContainsKey("type"))
            {
                var typeResult = _validationService.ValidateField("type", job.Type, validationSettings["type"]);
                if (!typeResult.IsValid) errors["type"] = typeResult.Errors;
            }

            if (validationSettings.ContainsKey("description"))
            {
                var descriptionResult = _validationService.ValidateField("description", job.Description, validationSettings["description"]);
                if (!descriptionResult.IsValid) errors["description"] = descriptionResult.Errors;
            }

            if (validationSettings.ContainsKey("skills"))
            {
                var skillsResult = _validationService.ValidateField("skills", job.Skills?.Count ?? 0, validationSettings["skills"]);
                if (!skillsResult.IsValid) errors["skills"] = skillsResult.Errors;
            }

            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", job.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            job.Id = null;
            job.CreatedAt = DateTime.UtcNow;
            await _context.Jobs.InsertOneAsync(job);
            return Ok(new { message = "Job created successfully", job });
        }

        [HttpPut("jobs/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateJob(string id, [FromBody] Job job)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("Job");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("title"))
            {
                var titleResult = _validationService.ValidateField("title", job.Title, validationSettings["title"]);
                if (!titleResult.IsValid) errors["title"] = titleResult.Errors;
            }

            if (validationSettings.ContainsKey("company"))
            {
                var companyResult = _validationService.ValidateField("company", job.Company, validationSettings["company"]);
                if (!companyResult.IsValid) errors["company"] = companyResult.Errors;
            }

            if (validationSettings.ContainsKey("location"))
            {
                var locationResult = _validationService.ValidateField("location", job.Location, validationSettings["location"]);
                if (!locationResult.IsValid) errors["location"] = locationResult.Errors;
            }

            if (validationSettings.ContainsKey("salary"))
            {
                var salaryResult = _validationService.ValidateField("salary", job.Salary, validationSettings["salary"]);
                if (!salaryResult.IsValid) errors["salary"] = salaryResult.Errors;
            }

            if (validationSettings.ContainsKey("type"))
            {
                var typeResult = _validationService.ValidateField("type", job.Type, validationSettings["type"]);
                if (!typeResult.IsValid) errors["type"] = typeResult.Errors;
            }

            if (validationSettings.ContainsKey("description"))
            {
                var descriptionResult = _validationService.ValidateField("description", job.Description, validationSettings["description"]);
                if (!descriptionResult.IsValid) errors["description"] = descriptionResult.Errors;
            }

            if (validationSettings.ContainsKey("skills"))
            {
                var skillsResult = _validationService.ValidateField("skills", job.Skills?.Count ?? 0, validationSettings["skills"]);
                if (!skillsResult.IsValid) errors["skills"] = skillsResult.Errors;
            }

            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", job.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            job.Id = id;
            var result = await _context.Jobs.ReplaceOneAsync(j => j.Id == id, job);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Job not found" });
            }
            return Ok(new { message = "Job updated successfully" });
        }

        [HttpDelete("jobs/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteJob(string id)
        {
            var result = await _context.Jobs.DeleteOneAsync(j => j.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Job not found" });
            }
            return Ok(new { message = "Job deleted successfully" });
        }

        [HttpPatch("jobs/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateJobStatus(string id, [FromBody] StatusUpdateRequest request)
        {
            var update = Builders<Job>.Update.Set(j => j.Status, request.Status);
            var result = await _context.Jobs.UpdateOneAsync(j => j.Id == id, update);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Job not found" });
            }
            return Ok(new { message = "Job status updated successfully" });
        }

        // Transports CRUD
        [HttpPost("transports")]
        [Authorize]
        public async Task<IActionResult> CreateTransport([FromBody] Transport transport)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("Transport");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("type"))
            {
                var typeResult = _validationService.ValidateField("type", transport.Type, validationSettings["type"]);
                if (!typeResult.IsValid) errors["type"] = typeResult.Errors;
            }

            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", transport.Name, validationSettings["name"]);
                if (!nameResult.IsValid) errors["name"] = nameResult.Errors;
            }

            if (validationSettings.ContainsKey("source"))
            {
                var sourceResult = _validationService.ValidateField("source", transport.Source, validationSettings["source"]);
                if (!sourceResult.IsValid) errors["source"] = sourceResult.Errors;
            }

            if (validationSettings.ContainsKey("destination"))
            {
                var destinationResult = _validationService.ValidateField("destination", transport.Destination, validationSettings["destination"]);
                if (!destinationResult.IsValid) errors["destination"] = destinationResult.Errors;
            }

            if (validationSettings.ContainsKey("price"))
            {
                var priceResult = _validationService.ValidateField("price", transport.Price, validationSettings["price"]);
                if (!priceResult.IsValid) errors["price"] = priceResult.Errors;
            }

            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", transport.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            transport.Id = null;
            transport.CreatedAt = DateTime.UtcNow;
            await _context.Transports.InsertOneAsync(transport);
            return Ok(new { message = "Transport created successfully", transport });
        }

        [HttpPut("transports/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateTransport(string id, [FromBody] Transport transport)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("Transport");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("type"))
            {
                var typeResult = _validationService.ValidateField("type", transport.Type, validationSettings["type"]);
                if (!typeResult.IsValid) errors["type"] = typeResult.Errors;
            }

            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", transport.Name, validationSettings["name"]);
                if (!nameResult.IsValid) errors["name"] = nameResult.Errors;
            }

            if (validationSettings.ContainsKey("source"))
            {
                var sourceResult = _validationService.ValidateField("source", transport.Source, validationSettings["source"]);
                if (!sourceResult.IsValid) errors["source"] = sourceResult.Errors;
            }

            if (validationSettings.ContainsKey("destination"))
            {
                var destinationResult = _validationService.ValidateField("destination", transport.Destination, validationSettings["destination"]);
                if (!destinationResult.IsValid) errors["destination"] = destinationResult.Errors;
            }

            if (validationSettings.ContainsKey("price"))
            {
                var priceResult = _validationService.ValidateField("price", transport.Price, validationSettings["price"]);
                if (!priceResult.IsValid) errors["price"] = priceResult.Errors;
            }

            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", transport.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            transport.Id = id;
            var result = await _context.Transports.ReplaceOneAsync(t => t.Id == id, transport);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Transport not found" });
            }
            return Ok(new { message = "Transport updated successfully" });
        }

        [HttpDelete("transports/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTransport(string id)
        {
            var result = await _context.Transports.DeleteOneAsync(t => t.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Transport not found" });
            }
            return Ok(new { message = "Transport deleted successfully" });
        }

        [HttpPatch("transports/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateTransportStatus(string id, [FromBody] StatusUpdateRequest request)
        {
            var update = Builders<Transport>.Update.Set(t => t.Status, request.Status);
            var result = await _context.Transports.UpdateOneAsync(t => t.Id == id, update);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Transport not found" });
            }
            return Ok(new { message = "Transport status updated successfully" });
        }

        // Packages CRUD
        [HttpPost("packages")]
        [Authorize]
        public async Task<IActionResult> CreatePackage([FromBody] TravelPackage package)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("TravelPackage");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", package.Name, validationSettings["name"]);
                if (!nameResult.IsValid) errors["name"] = nameResult.Errors;
            }

            if (validationSettings.ContainsKey("description"))
            {
                var descriptionResult = _validationService.ValidateField("description", package.Description, validationSettings["description"]);
                if (!descriptionResult.IsValid) errors["description"] = descriptionResult.Errors;
            }

            if (validationSettings.ContainsKey("duration"))
            {
                var durationResult = _validationService.ValidateField("duration", package.Duration, validationSettings["duration"]);
                if (!durationResult.IsValid) errors["duration"] = durationResult.Errors;
            }

            if (validationSettings.ContainsKey("price"))
            {
                var priceResult = _validationService.ValidateField("price", package.Price, validationSettings["price"]);
                if (!priceResult.IsValid) errors["price"] = priceResult.Errors;
            }

            if (validationSettings.ContainsKey("imageUrl"))
            {
                var imageUrlResult = _validationService.ValidateField("imageUrl", package.ImageUrl, validationSettings["imageUrl"]);
                if (!imageUrlResult.IsValid) errors["imageUrl"] = imageUrlResult.Errors;
            }

            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", package.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            package.Id = null;
            package.CreatedAt = DateTime.UtcNow;
            await _context.TravelPackages.InsertOneAsync(package);
            return Ok(new { message = "Travel package created successfully", package });
        }

        [HttpPut("packages/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdatePackage(string id, [FromBody] TravelPackage package)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("TravelPackage");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", package.Name, validationSettings["name"]);
                if (!nameResult.IsValid) errors["name"] = nameResult.Errors;
            }

            if (validationSettings.ContainsKey("description"))
            {
                var descriptionResult = _validationService.ValidateField("description", package.Description, validationSettings["description"]);
                if (!descriptionResult.IsValid) errors["description"] = descriptionResult.Errors;
            }

            if (validationSettings.ContainsKey("duration"))
            {
                var durationResult = _validationService.ValidateField("duration", package.Duration, validationSettings["duration"]);
                if (!durationResult.IsValid) errors["duration"] = durationResult.Errors;
            }

            if (validationSettings.ContainsKey("price"))
            {
                var priceResult = _validationService.ValidateField("price", package.Price, validationSettings["price"]);
                if (!priceResult.IsValid) errors["price"] = priceResult.Errors;
            }

            if (validationSettings.ContainsKey("imageUrl"))
            {
                var imageUrlResult = _validationService.ValidateField("imageUrl", package.ImageUrl, validationSettings["imageUrl"]);
                if (!imageUrlResult.IsValid) errors["imageUrl"] = imageUrlResult.Errors;
            }

            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", package.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            package.Id = id;
            var result = await _context.TravelPackages.ReplaceOneAsync(p => p.Id == id, package);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Travel package not found" });
            }
            return Ok(new { message = "Travel package updated successfully" });
        }

        [HttpDelete("packages/{id}")]
        [Authorize]
        public async Task<IActionResult> DeletePackage(string id)
        {
            var result = await _context.TravelPackages.DeleteOneAsync(p => p.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Travel package not found" });
            }
            return Ok(new { message = "Travel package deleted successfully" });
        }

        [HttpPatch("packages/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdatePackageStatus(string id, [FromBody] StatusUpdateRequest request)
        {
            var update = Builders<TravelPackage>.Update.Set(p => p.Status, request.Status);
            var result = await _context.TravelPackages.UpdateOneAsync(p => p.Id == id, update);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Travel package not found" });
            }
            return Ok(new { message = "Travel package status updated successfully" });
        }

        // Movies CRUD
        [HttpPost("movies")]
        [Authorize]
        public async Task<IActionResult> CreateMovie([FromBody] Movie movie)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("Movie");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("title"))
            {
                var titleResult = _validationService.ValidateField("title", movie.Title, validationSettings["title"]);
                if (!titleResult.IsValid) errors["title"] = titleResult.Errors;
            }

            if (validationSettings.ContainsKey("genre"))
            {
                var genreResult = _validationService.ValidateField("genre", movie.Genre, validationSettings["genre"]);
                if (!genreResult.IsValid) errors["genre"] = genreResult.Errors;
            }

            if (validationSettings.ContainsKey("language"))
            {
                var languageResult = _validationService.ValidateField("language", movie.Language, validationSettings["language"]);
                if (!languageResult.IsValid) errors["language"] = languageResult.Errors;
            }

            if (validationSettings.ContainsKey("duration"))
            {
                var durationResult = _validationService.ValidateField("duration", movie.Duration, validationSettings["duration"]);
                if (!durationResult.IsValid) errors["duration"] = durationResult.Errors;
            }

            if (validationSettings.ContainsKey("rating"))
            {
                var ratingResult = _validationService.ValidateField("rating", movie.Rating, validationSettings["rating"]);
                if (!ratingResult.IsValid) errors["rating"] = ratingResult.Errors;
            }

            if (validationSettings.ContainsKey("imageUrl"))
            {
                var imageUrlResult = _validationService.ValidateField("imageUrl", movie.ImageUrl, validationSettings["imageUrl"]);
                if (!imageUrlResult.IsValid) errors["imageUrl"] = imageUrlResult.Errors;
            }

            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", movie.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            movie.Id = null;
            movie.CreatedAt = DateTime.UtcNow;
            await _context.Movies.InsertOneAsync(movie);
            return Ok(new { message = "Movie created successfully", movie });
        }

        [HttpPut("movies/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateMovie(string id, [FromBody] Movie movie)
        {
            // Get validation settings from MongoDB
            var validationSettings = await _validationService.GetValidationSettingsAsync("Movie");

            // Validate using MongoDB settings
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("title"))
            {
                var titleResult = _validationService.ValidateField("title", movie.Title, validationSettings["title"]);
                if (!titleResult.IsValid) errors["title"] = titleResult.Errors;
            }

            if (validationSettings.ContainsKey("genre"))
            {
                var genreResult = _validationService.ValidateField("genre", movie.Genre, validationSettings["genre"]);
                if (!genreResult.IsValid) errors["genre"] = genreResult.Errors;
            }

            if (validationSettings.ContainsKey("language"))
            {
                var languageResult = _validationService.ValidateField("language", movie.Language, validationSettings["language"]);
                if (!languageResult.IsValid) errors["language"] = languageResult.Errors;
            }

            if (validationSettings.ContainsKey("duration"))
            {
                var durationResult = _validationService.ValidateField("duration", movie.Duration, validationSettings["duration"]);
                if (!durationResult.IsValid) errors["duration"] = durationResult.Errors;
            }

            if (validationSettings.ContainsKey("rating"))
            {
                var ratingResult = _validationService.ValidateField("rating", movie.Rating, validationSettings["rating"]);
                if (!ratingResult.IsValid) errors["rating"] = ratingResult.Errors;
            }

            if (validationSettings.ContainsKey("imageUrl"))
            {
                var imageUrlResult = _validationService.ValidateField("imageUrl", movie.ImageUrl, validationSettings["imageUrl"]);
                if (!imageUrlResult.IsValid) errors["imageUrl"] = imageUrlResult.Errors;
            }

            if (validationSettings.ContainsKey("status"))
            {
                var statusResult = _validationService.ValidateField("status", movie.Status, validationSettings["status"]);
                if (!statusResult.IsValid) errors["status"] = statusResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            movie.Id = id;
            var result = await _context.Movies.ReplaceOneAsync(m => m.Id == id, movie);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Movie not found" });
            }
            return Ok(new { message = "Movie updated successfully" });
        }

        [HttpDelete("movies/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteMovie(string id)
        {
            var result = await _context.Movies.DeleteOneAsync(m => m.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Movie not found" });
            }
            return Ok(new { message = "Movie deleted successfully" });
        }

        [HttpPatch("movies/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateMovieStatus(string id, [FromBody] StatusUpdateRequest request)
        {
            var update = Builders<Movie>.Update.Set(m => m.Status, request.Status);
            var result = await _context.Movies.UpdateOneAsync(m => m.Id == id, update);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Movie not found" });
            }
            return Ok(new { message = "Movie status updated successfully" });
        }

        // Ad Categories
        [HttpGet("ad-categories")]
        [Authorize]
        public async Task<IActionResult> GetAdCategories()
        {
            var categories = await _context.AdCategories.Find(_ => true).ToListAsync();
            return Ok(categories);
        }

        [HttpPost("ad-categories")]
        [Authorize]
        public async Task<IActionResult> CreateAdCategory([FromBody] AdCategory category)
        {
            // Validate category using validation service
            var validationSettings = await _validationService.GetValidationSettingsAsync("AdCategory");
            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", category.Name, validationSettings["name"]);
                if (!nameResult.IsValid)
                {
                    return BadRequest(new { message = "Validation failed", errors = new { name = nameResult.Errors } });
                }
            }

            category.Id = null;
            category.CreatedAt = DateTime.UtcNow;
            await _context.AdCategories.InsertOneAsync(category);
            return Ok(new { message = "Category created successfully", category });
        }

        [HttpPut("ad-categories/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAdCategory(string id, [FromBody] AdCategory category)
        {
            // Validate category using validation service
            var validationSettings = await _validationService.GetValidationSettingsAsync("AdCategory");
            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", category.Name, validationSettings["name"]);
                if (!nameResult.IsValid)
                {
                    return BadRequest(new { message = "Validation failed", errors = new { name = nameResult.Errors } });
                }
            }

            category.Id = id;
            var result = await _context.AdCategories.ReplaceOneAsync(c => c.Id == id, category);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Category not found" });
            }
            return Ok(new { message = "Category updated successfully" });
        }

        [HttpDelete("ad-categories/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAdCategory(string id)
        {
            var result = await _context.AdCategories.DeleteOneAsync(c => c.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Category not found" });
            }
            return Ok(new { message = "Category deleted successfully" });
        }

        [HttpPost("seed-ad-categories")]
        [Authorize]
        public async Task<IActionResult> SeedAdCategories()
        {
            var existingCount = await _context.AdCategories.CountDocumentsAsync(_ => true);
            if (existingCount > 0)
            {
                return Ok(new { message = "Ad categories already exist" });
            }

            var defaultCategories = new[]
            {
                new AdCategory { Name = "Electronics", Emoji = "📱", Subcategories = new List<string> { "Mobile Phones", "Laptops", "Tablets", "Cameras", "Accessories" }, Status = "Active" },
                new AdCategory { Name = "Vehicles", Emoji = "🚗", Subcategories = new List<string> { "Cars", "Motorcycles", "Scooters", "Bicycles", "Spare Parts" }, Status = "Active" },
                new AdCategory { Name = "Properties", Emoji = "🏠", Subcategories = new List<string> { "Apartments", "Houses", "Land", "Commercial", "PG/Hostels" }, Status = "Active" },
                new AdCategory { Name = "Jobs", Emoji = "💼", Subcategories = new List<string> { "IT/Software", "Sales", "Marketing", "Education", "Healthcare" }, Status = "Active" },
                new AdCategory { Name = "Services", Emoji = "🔧", Subcategories = new List<string> { "Home Services", "Education", "Health & Fitness", "Events", "Professional" }, Status = "Active" },
                new AdCategory { Name = "Fashion", Emoji = "👕", Subcategories = new List<string> { "Men", "Women", "Kids", "Accessories", "Footwear" }, Status = "Active" },
                new AdCategory { Name = "Home & Living", Emoji = "🛋️", Subcategories = new List<string> { "Furniture", "Decor", "Kitchen", "Garden", "Appliances" }, Status = "Active" },
                new AdCategory { Name = "Pets", Emoji = "🐕", Subcategories = new List<string> { "Dogs", "Cats", "Birds", "Fish", "Pet Supplies" }, Status = "Active" },
                new AdCategory { Name = "Books & Hobbies", Emoji = "📚", Subcategories = new List<string> { "Books", "Musical Instruments", "Sports Equipment", "Games", "Collectibles" }, Status = "Active" },
                new AdCategory { Name = "Electronics & Appliances", Emoji = "📺", Subcategories = new List<string> { "TVs", "Refrigerators", "Washing Machines", "ACs", "Kitchen Appliances" }, Status = "Active" }
            };

            await _context.AdCategories.InsertManyAsync(defaultCategories);
            return Ok(new { message = $"Seeded {defaultCategories.Length} ad categories" });
        }

        [HttpGet("states")]
        [Authorize]
        public async Task<IActionResult> GetStates()
        {
            var states = await _context.States.Find(s => s.IsActive).SortBy(s => s.DisplaySequence).ToListAsync();
            return Ok(states);
        }

        [HttpPost("states")]
        [Authorize]
        public async Task<IActionResult> CreateState([FromBody] State state)
        {
            var validationSettings = await _validationService.GetValidationSettingsAsync("State");
            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", state.Name, validationSettings["name"]);
                if (!nameResult.IsValid)
                {
                    return BadRequest(new { message = "Validation failed", errors = new { name = nameResult.Errors } });
                }
            }

            state.Id = null;
            state.CreatedAt = DateTime.UtcNow;
            await _context.States.InsertOneAsync(state);
            return Ok(new { message = "State created successfully", state });
        }

        [HttpPut("states/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateState(string id, [FromBody] State state)
        {
            var validationSettings = await _validationService.GetValidationSettingsAsync("State");
            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", state.Name, validationSettings["name"]);
                if (!nameResult.IsValid)
                {
                    return BadRequest(new { message = "Validation failed", errors = new { name = nameResult.Errors } });
                }
            }

            state.Id = id;
            var result = await _context.States.ReplaceOneAsync(s => s.Id == id, state);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "State not found" });
            }
            return Ok(new { message = "State updated successfully" });
        }

        [HttpDelete("states/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteState(string id)
        {
            var result = await _context.States.DeleteOneAsync(s => s.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "State not found" });
            }
            return Ok(new { message = "State deleted successfully" });
        }

        [HttpGet("cities")]
        [Authorize]
        public async Task<IActionResult> GetCities([FromQuery] string? stateCode = null)
        {
            var filter = stateCode != null 
                ? Builders<City>.Filter.And(
                    Builders<City>.Filter.Eq(c => c.StateCode, stateCode),
                    Builders<City>.Filter.Eq(c => c.IsActive, true))
                : Builders<City>.Filter.Eq(c => c.IsActive, true);
            
            var cities = await _context.Cities.Find(filter).SortBy(c => c.DisplaySequence).ToListAsync();
            return Ok(cities);
        }

        [HttpPost("cities")]
        [Authorize]
        public async Task<IActionResult> CreateCity([FromBody] City city)
        {
            var validationSettings = await _validationService.GetValidationSettingsAsync("City");
            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", city.Name, validationSettings["name"]);
                if (!nameResult.IsValid)
                {
                    return BadRequest(new { message = "Validation failed", errors = new { name = nameResult.Errors } });
                }
            }

            city.Id = null;
            city.CreatedAt = DateTime.UtcNow;
            await _context.Cities.InsertOneAsync(city);
            return Ok(new { message = "City created successfully", city });
        }

        [HttpPut("cities/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateCity(string id, [FromBody] City city)
        {
            var validationSettings = await _validationService.GetValidationSettingsAsync("City");
            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", city.Name, validationSettings["name"]);
                if (!nameResult.IsValid)
                {
                    return BadRequest(new { message = "Validation failed", errors = new { name = nameResult.Errors } });
                }
            }

            city.Id = id;
            var result = await _context.Cities.ReplaceOneAsync(c => c.Id == id, city);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "City not found" });
            }
            return Ok(new { message = "City updated successfully" });
        }

        [HttpDelete("cities/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteCity(string id)
        {
            var result = await _context.Cities.DeleteOneAsync(c => c.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "City not found" });
            }
            return Ok(new { message = "City deleted successfully" });
        }

        [HttpGet("ad-conditions")]
        [Authorize]
        public async Task<IActionResult> GetAdConditions()
        {
            var conditions = await _context.AdConditions.Find(c => c.IsActive).SortBy(c => c.DisplaySequence).ToListAsync();
            return Ok(conditions);
        }

        [HttpPost("ad-conditions")]
        [Authorize]
        public async Task<IActionResult> CreateAdCondition([FromBody] AdCondition condition)
        {
            var validationSettings = await _validationService.GetValidationSettingsAsync("AdCondition");
            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", condition.Name, validationSettings["name"]);
                if (!nameResult.IsValid)
                {
                    return BadRequest(new { message = "Validation failed", errors = new { name = nameResult.Errors } });
                }
            }

            condition.Id = null;
            condition.CreatedAt = DateTime.UtcNow;
            await _context.AdConditions.InsertOneAsync(condition);
            return Ok(new { message = "Condition created successfully", condition });
        }

        [HttpPut("ad-conditions/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAdCondition(string id, [FromBody] AdCondition condition)
        {
            var validationSettings = await _validationService.GetValidationSettingsAsync("AdCondition");
            if (validationSettings.ContainsKey("name"))
            {
                var nameResult = _validationService.ValidateField("name", condition.Name, validationSettings["name"]);
                if (!nameResult.IsValid)
                {
                    return BadRequest(new { message = "Validation failed", errors = new { name = nameResult.Errors } });
                }
            }

            condition.Id = id;
            var result = await _context.AdConditions.ReplaceOneAsync(c => c.Id == id, condition);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Condition not found" });
            }
            return Ok(new { message = "Condition updated successfully" });
        }

        [HttpDelete("ad-conditions/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAdCondition(string id)
        {
            var result = await _context.AdConditions.DeleteOneAsync(c => c.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Condition not found" });
            }
            return Ok(new { message = "Condition deleted successfully" });
        }

        [HttpPost("seed-location-data")]
        [Authorize]
        public async Task<IActionResult> SeedLocationData()
        {
            var seedData = new LocationSeedData(_context);
            await seedData.SeedAsync();
            return Ok(new { message = "Location data seeded successfully" });
        }

        // User Activate/Deactivate
        [HttpPatch("users/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateUserStatus(string id, [FromBody] UserStatusUpdateRequest request)
        {
            var update = Builders<User>.Update.Set(u => u.IsActive, request.IsActive);
            var result = await _context.Users.UpdateOneAsync(u => u.Id == id, update);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "User not found" });
            }
            return Ok(new { message = "User status updated successfully" });
        }

        // Validation Settings Management
        [HttpGet("validation-settings/{entityType}")]
        [Authorize]
        public async Task<IActionResult> GetValidationSettings(string entityType)
        {
            var settings = await _context.ValidationSettings
                .Find(v => v.EntityType == entityType && v.IsActive)
                .ToListAsync();
            return Ok(settings);
        }

        [HttpPost("validation-settings")]
        [Authorize]
        public async Task<IActionResult> CreateValidationSetting([FromBody] ValidationSetting setting)
        {
            setting.Id = null;
            setting.CreatedAt = DateTime.UtcNow;
            setting.UpdatedAt = DateTime.UtcNow;
            await _context.ValidationSettings.InsertOneAsync(setting);
            _validationService.InvalidateCache(setting.EntityType);
            return Ok(new { message = "Validation setting created successfully", setting });
        }

        [HttpPut("validation-settings/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateValidationSetting(string id, [FromBody] ValidationSetting setting)
        {
            setting.Id = id;
            setting.UpdatedAt = DateTime.UtcNow;
            var result = await _context.ValidationSettings.ReplaceOneAsync(v => v.Id == id, setting);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Validation setting not found" });
            }
            _validationService.InvalidateCache(setting.EntityType);
            return Ok(new { message = "Validation setting updated successfully", setting });
        }
    }

    public class StatusUpdateRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    public class UserStatusUpdateRequest
    {
        public bool IsActive { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
