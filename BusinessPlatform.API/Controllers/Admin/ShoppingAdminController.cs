using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;

namespace BusinessPlatform.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/shopping")]
    [Authorize]
    public class ShoppingAdminController : ControllerBase
    {
        private readonly MongoDbContext _context;
        private readonly ValidationService _validationService;

        public ShoppingAdminController(MongoDbContext context, ValidationService validationService)
        {
            _context = context;
            _validationService = validationService;
        }

        // Categories CRUD
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories.Find(_ => true).ToListAsync();
            var sortedCategories = categories.OrderBy(c => c.DisplaySequence).ToList();
            return Ok(sortedCategories);
        }

        [HttpGet("categories/next-sequence")]
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
        public async Task<IActionResult> UpdateCategory(string id, [FromBody] Category category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

            var existingCategory = await _context.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (existingCategory == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            string oldCategoryName = existingCategory.Name;
            string newCategoryName = category.Name;

            category.Id = id;
            var result = await _context.Categories.ReplaceOneAsync(c => c.Id == id, category);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Category not found" });
            }

            // If category name changed, update all products with the old category name
            if (oldCategoryName != newCategoryName)
            {
                var update = Builders<Product>.Update.Set(p => p.CategoryName, newCategoryName);
                await _context.Products.UpdateManyAsync(p => p.CategoryName == oldCategoryName, update);
            }

            return Ok(new { message = "Category updated successfully" });
        }

        [HttpDelete("categories/{id}")]
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

        // Subcategories CRUD
        [HttpGet("subcategories")]
        public async Task<IActionResult> GetSubcategories()
        {
            var subcategories = await _context.Subcategories.Find(_ => true).ToListAsync();
            var sortedSubcategories = subcategories.OrderBy(s => s.DisplaySequence).ToList();
            return Ok(sortedSubcategories);
        }

        [HttpGet("subcategories/category/{categoryId}")]
        public async Task<IActionResult> GetSubcategoriesByCategory(string categoryId)
        {
            var subcategories = await _context.Subcategories.Find(s => s.CategoryId == categoryId).ToListAsync();
            var sortedSubcategories = subcategories.OrderBy(s => s.DisplaySequence).ToList();
            return Ok(sortedSubcategories);
        }

        [HttpGet("subcategories/next-sequence/{categoryId}")]
        public async Task<IActionResult> GetNextSubcategorySequence(string categoryId)
        {
            var lastSubcategory = await _context.Subcategories
                .Find(s => s.CategoryId == categoryId)
                .SortByDescending(s => s.DisplaySequence)
                .FirstOrDefaultAsync();

            var nextSequence = (lastSubcategory?.DisplaySequence ?? 0) + 1;
            return Ok(new { nextSequence });
        }

        [HttpPost("subcategories")]
        public async Task<IActionResult> CreateSubcategory([FromBody] Subcategory subcategory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

            subcategory.Id = null;
            subcategory.CreatedAt = DateTime.UtcNow;
            await _context.Subcategories.InsertOneAsync(subcategory);
            return Ok(new { message = "Subcategory created successfully", subcategory });
        }

        [HttpPut("subcategories/{id}")]
        public async Task<IActionResult> UpdateSubcategory(string id, [FromBody] Subcategory subcategory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

            var existingSubcategory = await _context.Subcategories.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (existingSubcategory == null)
            {
                return NotFound(new { message = "Subcategory not found" });
            }

            string oldSubcategoryName = existingSubcategory.Name;
            string newSubcategoryName = subcategory.Name;

            subcategory.Id = id;
            var result = await _context.Subcategories.ReplaceOneAsync(s => s.Id == id, subcategory);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Subcategory not found" });
            }

            // If subcategory name changed, update all products with the old subcategory name
            if (oldSubcategoryName != newSubcategoryName)
            {
                var update = Builders<Product>.Update.Set(p => p.SubcategoryName, newSubcategoryName);
                await _context.Products.UpdateManyAsync(p => p.SubcategoryName == oldSubcategoryName, update);
            }

            return Ok(new { message = "Subcategory updated successfully" });
        }

        [HttpDelete("subcategories/{id}")]
        public async Task<IActionResult> DeleteSubcategory(string id)
        {
            var subcategory = await _context.Subcategories.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (subcategory == null)
            {
                return NotFound(new { message = "Subcategory not found" });
            }

            // Delete all products with this subcategory name
            await _context.Products.DeleteManyAsync(p => p.SubcategoryName == subcategory.Name);

            // Delete the subcategory
            var result = await _context.Subcategories.DeleteOneAsync(s => s.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Subcategory not found" });
            }
            return Ok(new { message = "Subcategory and all its products deleted successfully" });
        }

        // Products CRUD
        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products.Find(_ => true).ToListAsync();
            var categories = await _context.Categories.Find(_ => true).ToListAsync();
            
            var sortedProducts = products
                .Join(categories, 
                    p => p.CategoryName, 
                    c => c.Name, 
                    (p, c) => new { Product = p, Category = c })
                .OrderBy(x => x.Category.DisplaySequence)
                .ThenBy(x => x.Product.DisplaySequence)
                .Select(x => x.Product)
                .ToList();
            
            return Ok(sortedProducts);
        }

        [HttpGet("products/next-sequence/{categoryName}")]
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
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            var validationSettings = await _validationService.GetValidationSettingsAsync("Product");
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
            
            if (validationSettings.ContainsKey("displaySequence"))
            {
                var displaySequenceResult = _validationService.ValidateField("displaySequence", product.DisplaySequence, validationSettings["displaySequence"]);
                if (!displaySequenceResult.IsValid) errors["displaySequence"] = displaySequenceResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

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

            var existingCategory = await _context.Categories.Find(c => c.Name == product.CategoryName).FirstOrDefaultAsync();
            if (existingCategory == null)
            {
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
        public async Task<IActionResult> UpdateProduct(string id, [FromBody] Product product)
        {
            var validationSettings = await _validationService.GetValidationSettingsAsync("Product");
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
            
            if (validationSettings.ContainsKey("displaySequence"))
            {
                var displaySequenceResult = _validationService.ValidateField("displaySequence", product.DisplaySequence, validationSettings["displaySequence"]);
                if (!displaySequenceResult.IsValid) errors["displaySequence"] = displaySequenceResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

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
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var result = await _context.Products.DeleteOneAsync(p => p.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Product not found" });
            }
            return Ok(new { message = "Product deleted successfully" });
        }

        [HttpPatch("products/{id}/status")]
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

        // Orders CRUD
        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _context.ShoppingOrders.Find(_ => true).ToListAsync();
            return Ok(orders);
        }

        [HttpPut("orders/{id}/status")]
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
        public async Task<IActionResult> DeleteOrder(string id)
        {
            var result = await _context.ShoppingOrders.DeleteOneAsync(o => o.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Order not found" });
            }
            return Ok(new { message = "Order deleted successfully" });
        }
    }
}
