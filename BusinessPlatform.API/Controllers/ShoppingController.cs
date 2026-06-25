using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace BusinessPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShoppingController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public ShoppingController(MongoDbContext context)
        {
            _context = context;
        }

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

        [HttpGet("products/{id}")]
        public async Task<IActionResult> GetProduct(string id)
        {
            var product = await _context.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }
            return Ok(product);
        }

        [HttpPost("products")]
        [Authorize]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            product.Id = null;
            product.CreatedAt = DateTime.UtcNow;
            await _context.Products.InsertOneAsync(product);
            return Ok(new { message = "Product created successfully", product });
        }

        [HttpPut("products/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct(string id, [FromBody] Product product)
        {
            product.Id = id;
            var result = await _context.Products.ReplaceOneAsync(p => p.Id == id, product);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Product not found" });
            }
            return Ok(new { message = "Product updated successfully" });
        }

        [HttpPut("products/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateProductStatus(string id, [FromBody] StatusUpdate update)
        {
            var updateDef = Builders<Product>.Update.Set(p => p.Status, update.Status);
            var result = await _context.Products.UpdateOneAsync(p => p.Id == id, updateDef);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Product not found" });
            }
            return Ok(new { message = "Product status updated successfully" });
        }

        [HttpDelete("products/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var result = await _context.Products.DeleteOneAsync(p => p.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Product not found" });
            }
            return Ok(new { message = "Product deleted successfully" });
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories([FromQuery] bool includeAll = false)
        {
            var categories = await _context.Categories.Find(_ => true).ToListAsync();
            var sortedCategories = categories.OrderBy(c => c.DisplaySequence).ToList();

            if (includeAll)
            {
                // Return all categories for admin
                return Ok(sortedCategories);
            }

            var products = await _context.Products.Find(_ => true).ToListAsync();

            // Filter categories that have at least one active product
            var categoriesWithActiveProducts = sortedCategories
                .Where(c => products.Any(p => p.CategoryName == c.Name && p.Status == "Active"))
                .ToList();

            return Ok(categoriesWithActiveProducts);
        }

        [HttpGet("subcategories")]
        public async Task<IActionResult> GetSubcategories([FromQuery] string categoryId = null)
        {
            if (!string.IsNullOrEmpty(categoryId))
            {
                var subcategories = await _context.Subcategories.Find(s => s.CategoryId == categoryId).ToListAsync();
                var sortedSubcategories = subcategories.OrderBy(s => s.DisplaySequence).ToList();
                return Ok(sortedSubcategories);
            }

            var allSubcategories = await _context.Subcategories.Find(_ => true).ToListAsync();
            var sortedAllSubcategories = allSubcategories.OrderBy(s => s.DisplaySequence).ToList();
            return Ok(sortedAllSubcategories);
        }

        [HttpPost("categories")]
        [Authorize]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            category.Id = null;
            category.CreatedAt = DateTime.UtcNow;
            await _context.Categories.InsertOneAsync(category);
            return Ok(new { message = "Category created successfully", category });
        }

        [HttpPost("orders")]
        public async Task<IActionResult> CreateOrder([FromBody] ShoppingOrder order)
        {
            order.Id = null;
            order.CreatedAt = DateTime.UtcNow;

            Console.WriteLine("=== Order Creation Price Calculation Debug ===");
            Console.WriteLine($"Order items count: {order.Items.Count}");

            // Validate and calculate total based on current product prices
            decimal calculatedTotal = 0;
            foreach (var item in order.Items)
            {
                Console.WriteLine($"--- Processing item: {item.ProductName} ---");
                Console.WriteLine($"Product ID: {item.ProductId}");
                Console.WriteLine($"Quantity: {item.Quantity}");
                Console.WriteLine($"Color variant: {item.ColorVariantName}");
                Console.WriteLine($"Size option: {item.SizeOptionName}");
                Console.WriteLine($"Item price from cart: {item.Price}");

                var product = await _context.Products.Find(p => p.Id == item.ProductId).FirstOrDefaultAsync();
                if (product == null)
                {
                    return BadRequest(new { message = $"Product {item.ProductName} not found" });
                }

                Console.WriteLine($"Product base price: {product.Price}");
                Console.WriteLine($"Product offer %: {product.OfferPercentage}");

                decimal itemPrice = product.Price;

                // Handle color variant price adjustment (case-insensitive)
                ProductColorVariant? colorVariant = null;
                if (!string.IsNullOrWhiteSpace(item.ColorVariantName))
                {
                    colorVariant = product.ColorVariants?.FirstOrDefault(cv => 
                        cv.Name.Equals(item.ColorVariantName, StringComparison.OrdinalIgnoreCase));
                    if (colorVariant == null && product.ColorVariants != null && product.ColorVariants.Count > 0)
                    {
                        Console.WriteLine($"Security: Invalid color variant '{item.ColorVariantName}' for product {item.ProductName}");
                        return BadRequest(new { message = $"Invalid color variant for {item.ProductName}" });
                    }
                    Console.WriteLine($"Color variant found: {colorVariant.Name}, adjustment: {colorVariant.PriceAdjustment}");
                }

                // Handle size option price adjustment (case-insensitive)
                ProductSizeOption? sizeOption = null;
                if (!string.IsNullOrWhiteSpace(item.SizeOptionName))
                {
                    if (colorVariant != null && colorVariant.SizeOptions != null)
                    {
                        // Use size options from color variant (case-insensitive)
                        sizeOption = colorVariant.SizeOptions.FirstOrDefault(so => 
                            so.Name.Equals(item.SizeOptionName, StringComparison.OrdinalIgnoreCase));
                        Console.WriteLine($"Size option found in color variant: {sizeOption != null}");
                    }
                    
                    if (sizeOption == null)
                    {
                        // Use size options from product (case-insensitive)
                        sizeOption = product.SizeOptions?.FirstOrDefault(so => 
                            so.Name.Equals(item.SizeOptionName, StringComparison.OrdinalIgnoreCase));
                        Console.WriteLine($"Size option found in product: {sizeOption != null}");
                    }

                    if (sizeOption == null)
                    {
                        var hasSizeOptions = (colorVariant?.SizeOptions != null && colorVariant.SizeOptions.Count > 0) ||
                                            (product.SizeOptions != null && product.SizeOptions.Count > 0);
                        if (hasSizeOptions)
                        {
                            Console.WriteLine($"Security: Invalid size option '{item.SizeOptionName}' for product {item.ProductName}");
                            return BadRequest(new { message = $"Invalid size option for {item.ProductName}" });
                        }
                    }
                    if (sizeOption != null)
                    {
                        Console.WriteLine($"Size option: {sizeOption.Name}, adjustment: {sizeOption.PriceAdjustment}");
                    }
                }

                // Step 1: Apply adjustments to base price (matching AddToCart logic)
                if (colorVariant != null)
                {
                    itemPrice += colorVariant.PriceAdjustment;
                    Console.WriteLine($"After color adjustment: {itemPrice} (added: {colorVariant.PriceAdjustment})");
                }

                if (sizeOption != null)
                {
                    itemPrice += sizeOption.PriceAdjustment;
                    Console.WriteLine($"After size adjustment: {itemPrice} (added: {sizeOption.PriceAdjustment})");
                }

                // Step 2: Apply offer percentage to base price, then re-add adjustments (matching AddToCart logic)
                if (product.OfferPercentage > 0)
                {
                    itemPrice = product.Price - (product.Price * product.OfferPercentage / 100);
                    Console.WriteLine($"After offer applied to base: {itemPrice} (base: {product.Price}, offer: {product.OfferPercentage}%)");

                    // Re-add color adjustment
                    if (colorVariant != null)
                    {
                        itemPrice += colorVariant.PriceAdjustment;
                        Console.WriteLine($"After re-adding color adjustment: {itemPrice} (added: {colorVariant.PriceAdjustment})");
                    }

                    // Re-add size adjustment
                    if (sizeOption != null)
                    {
                        itemPrice += sizeOption.PriceAdjustment;
                        Console.WriteLine($"After re-adding size adjustment: {itemPrice} (added: {sizeOption.PriceAdjustment})");
                    }
                }
                else
                {
                    Console.WriteLine("No offer - using price with adjustments from Step 1");
                }

                // Apply ceiling rounding to item price to avoid floating-point precision issues
                itemPrice = Math.Ceiling(itemPrice);
                Console.WriteLine($"Final calculated item price (after ceiling): {itemPrice}");

                // Validate item price
                if (item.Price != itemPrice)
                {
                    Console.WriteLine($"Security: Price mismatch for {item.ProductName}! Expected: {itemPrice}, Received: {item.Price}");
                    return BadRequest(new { message = $"Price validation failed for {item.ProductName}. Expected: {itemPrice}, Received: {item.Price}. Please try again." });
                }

                calculatedTotal += itemPrice * item.Quantity;
                Console.WriteLine($"Item total: {itemPrice * item.Quantity}");
            }

            // Calculate shipping and tax with ceiling rounding
            decimal shipping = calculatedTotal > 0 ? 99 : 0;
            decimal tax = Math.Ceiling(calculatedTotal * 0.18m);
            decimal finalTotal = Math.Ceiling(calculatedTotal + shipping + tax);

            Console.WriteLine($"Subtotal: {calculatedTotal}");
            Console.WriteLine($"Shipping: {shipping}");
            Console.WriteLine($"Tax: {tax}");
            Console.WriteLine($"Final total (after ceiling): {finalTotal}");
            Console.WriteLine($"Order total from frontend: {order.Total}");
            Console.WriteLine("=== End Order Creation Debug ===");

            // Validate total
            if (order.Total != finalTotal)
            {
                return BadRequest(new { message = $"Total validation failed. Expected: {finalTotal}, Received: {order.Total}. Please try again." });
            }

            await _context.ShoppingOrders.InsertOneAsync(order);

            // Clear cart
            await _context.ShoppingCartItems.DeleteManyAsync(c => c.UserId == order.UserId);

            return Ok(new { message = "Order created successfully", order });
        }

        [HttpGet("orders")]
        [Authorize]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _context.ShoppingOrders.Find(_ => true).ToListAsync();
            return Ok(orders);
        }

        [HttpGet("orders/user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserOrders(string userId)
        {
            var orders = await _context.ShoppingOrders.Find(o => o.UserId == userId).ToListAsync();
            return Ok(orders);
        }

        [HttpPut("orders/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] StatusUpdate update)
        {
            var updateDef = Builders<ShoppingOrder>.Update.Set(o => o.Status, update.Status);
            var result = await _context.ShoppingOrders.UpdateOneAsync(o => o.Id == id, updateDef);
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

        [HttpGet("cart/{userId}")]
        public async Task<IActionResult> GetCart(string userId)
        {
            var cartItems = await _context.ShoppingCartItems.Find(c => c.UserId == userId).ToListAsync();
            return Ok(cartItems);
        }

        [HttpPost("cart")]
        public async Task<IActionResult> AddToCart([FromBody] ShoppingCartItem item)
        {
            item.Id = null;
            item.CreatedAt = DateTime.UtcNow;

            // Fetch product to validate and calculate price
            var product = await _context.Products.Find(p => p.Id == item.ProductId).FirstOrDefaultAsync();
            if (product == null)
            {
                return BadRequest(new { message = "Product not found" });
            }

            // Validate and calculate price based on color variant and size option
            decimal calculatedPrice = product.Price;

            Console.WriteLine("=== Backend Price Calculation Debug ===");
            Console.WriteLine($"Product base price: {product.Price}");
            Console.WriteLine($"Product offer %: {product.OfferPercentage}");
            Console.WriteLine($"Color variant name: {item.ColorVariantName}");
            Console.WriteLine($"Size option name: {item.SizeOptionName}");
            Console.WriteLine($"Quantity: {item.Quantity}");

            // Security validation: Ensure color variant actually belongs to this product
            if (!string.IsNullOrEmpty(item.ColorVariantName))
            {
                var colorVariant = product.ColorVariants?.FirstOrDefault(cv => cv.Name == item.ColorVariantName);
                if (colorVariant == null)
                {
                    Console.WriteLine($"Security: Invalid color variant '{item.ColorVariantName}' for product {item.ProductId}");
                    return BadRequest(new { message = "Invalid color variant" });
                }

                // Check color variant stock
                if (colorVariant.Stock < item.Quantity)
                {
                    return BadRequest(new { message = "Insufficient stock for selected color" });
                }

                calculatedPrice += colorVariant.PriceAdjustment;
                Console.WriteLine($"After color adjustment: {calculatedPrice} (added: {colorVariant.PriceAdjustment})");

                // If size option is also selected, validate it belongs to this color or product
                if (!string.IsNullOrEmpty(item.SizeOptionName))
                {
                    Console.WriteLine($"Looking for size option: '{item.SizeOptionName}'");
                    Console.WriteLine($"Color variant size options: {string.Join(", ", colorVariant.SizeOptions?.Select(so => so.Name) ?? Array.Empty<string>())}");
                    Console.WriteLine($"Product size options: {string.Join(", ", product.SizeOptions?.Select(so => so.Name) ?? Array.Empty<string>())}");
                    
                    // First try to find size option in color variant's size options (case-insensitive)
                    var sizeOption = colorVariant.SizeOptions?.FirstOrDefault(so => 
                        so.Name.Equals(item.SizeOptionName, StringComparison.OrdinalIgnoreCase));
                    bool sizeFromColor = sizeOption != null;
                    
                    Console.WriteLine($"Size option found in color variant: {sizeFromColor}");
                    
                    // If not found in color variant, fall back to product size options (case-insensitive)
                    if (sizeOption == null)
                    {
                        sizeOption = product.SizeOptions?.FirstOrDefault(so => 
                            so.Name.Equals(item.SizeOptionName, StringComparison.OrdinalIgnoreCase));
                        Console.WriteLine($"Size option found in product: {sizeOption != null}");
                    }
                    
                    if (sizeOption == null)
                    {
                        Console.WriteLine($"Security: Invalid size option '{item.SizeOptionName}' for color '{item.ColorVariantName}' on product {item.ProductId}");
                        return BadRequest(new { message = "Invalid size option" });
                    }

                    // Check stock (use color variant stock if size is from color, otherwise use size stock)
                    if (sizeFromColor && sizeOption.Stock < item.Quantity)
                    {
                        return BadRequest(new { message = "Insufficient stock for selected size" });
                    }

                    calculatedPrice += sizeOption.PriceAdjustment;
                    Console.WriteLine($"After size adjustment: {calculatedPrice} (added: {sizeOption.PriceAdjustment}, source: {(sizeFromColor ? "color variant" : "product")})");
                }
            }
            else if (!string.IsNullOrEmpty(item.SizeOptionName))
            {
                // No color variant selected, but size option selected - validate it belongs to product
                Console.WriteLine($"Looking for size option in product: '{item.SizeOptionName}'");
                Console.WriteLine($"Product size options: {string.Join(", ", product.SizeOptions?.Select(so => so.Name) ?? Array.Empty<string>())}");
                
                var sizeOption = product.SizeOptions?.FirstOrDefault(so => 
                    so.Name.Equals(item.SizeOptionName, StringComparison.OrdinalIgnoreCase));
                if (sizeOption == null)
                {
                    Console.WriteLine($"Security: Invalid size option '{item.SizeOptionName}' for product {item.ProductId}");
                    return BadRequest(new { message = "Invalid size option" });
                }

                // Check stock
                if (sizeOption.Stock < item.Quantity)
                {
                    return BadRequest(new { message = "Insufficient stock for selected size" });
                }

                calculatedPrice += sizeOption.PriceAdjustment;
                Console.WriteLine($"After size adjustment (from product): {calculatedPrice} (added: {sizeOption.PriceAdjustment})");
            }
            else
            {
                // No color variant or size option selected - use base price with offer
                // Check base stock
                if (product.Stock < item.Quantity)
                {
                    return BadRequest(new { message = "Insufficient stock" });
                }
                Console.WriteLine("No adjustments applied - using base price");
            }

            // Apply offer percentage to base price, then re-add adjustments
            if (product.OfferPercentage > 0)
            {
                calculatedPrice = product.Price - (product.Price * product.OfferPercentage / 100);
                Console.WriteLine($"After offer applied to base: {calculatedPrice} (base: {product.Price}, offer: {product.OfferPercentage}%)");
                
                // Re-add adjustments after applying offer
                if (!string.IsNullOrEmpty(item.ColorVariantName))
                {
                    var colorVariant = product.ColorVariants?.FirstOrDefault(cv => cv.Name == item.ColorVariantName);
                    if (colorVariant != null)
                    {
                        calculatedPrice += colorVariant.PriceAdjustment;
                        Console.WriteLine($"After re-adding color adjustment: {calculatedPrice} (added: {colorVariant.PriceAdjustment})");

                        if (!string.IsNullOrEmpty(item.SizeOptionName))
                        {
                            // First try to find size option in color variant's size options (case-insensitive)
                            var sizeOption = colorVariant.SizeOptions?.FirstOrDefault(so => 
                                so.Name.Equals(item.SizeOptionName, StringComparison.OrdinalIgnoreCase));
                            bool sizeFromColor = sizeOption != null;
                            
                            // If not found in color variant, fall back to product size options (case-insensitive)
                            if (sizeOption == null)
                            {
                                sizeOption = product.SizeOptions?.FirstOrDefault(so => 
                                    so.Name.Equals(item.SizeOptionName, StringComparison.OrdinalIgnoreCase));
                            }
                            
                            if (sizeOption != null)
                            {
                                calculatedPrice += sizeOption.PriceAdjustment;
                                Console.WriteLine($"After re-adding size adjustment: {calculatedPrice} (added: {sizeOption.PriceAdjustment}, source: {(sizeFromColor ? "color variant" : "product")})");
                            }
                        }
                    }
                }
                else if (!string.IsNullOrEmpty(item.SizeOptionName))
                {
                    var sizeOption = product.SizeOptions?.FirstOrDefault(so => 
                        so.Name.Equals(item.SizeOptionName, StringComparison.OrdinalIgnoreCase));
                    if (sizeOption != null)
                    {
                        calculatedPrice += sizeOption.PriceAdjustment;
                        Console.WriteLine($"After re-adding size adjustment (from product): {calculatedPrice} (added: {sizeOption.PriceAdjustment})");
                    }
                }
            }
            else
            {
                // No offer - adjustments already applied in Step 1
                Console.WriteLine("No offer - using price with adjustments from Step 1");
            }

            // Apply ceiling rounding to avoid floating-point precision issues
            calculatedPrice = Math.Ceiling(calculatedPrice);
            Console.WriteLine($"Final calculated price (after ceiling): {calculatedPrice}");
            Console.WriteLine($"Frontend sent price: {item.Price}");
            Console.WriteLine($"Price match: {item.Price == calculatedPrice}");

            // Security validation: Ensure price matches calculated price (prevent tampering)
            if (item.Price != calculatedPrice)
            {
                Console.WriteLine($"Security: Price mismatch! Expected: {calculatedPrice}, Received: {item.Price}");
                return BadRequest(new { message = "Price validation failed. Please try again." });
            }
            
            Console.WriteLine("=== End Backend Debug ===");

            // Check for existing cart item with same product and size option
            var existing = await _context.ShoppingCartItems
                .Find(c => c.UserId == item.UserId && c.ProductId == item.ProductId && c.SizeOptionName == item.SizeOptionName)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                var updateDef = Builders<ShoppingCartItem>.Update.Inc(c => c.Quantity, item.Quantity);
                await _context.ShoppingCartItems.UpdateOneAsync(c => c.Id == existing.Id, updateDef);
            }
            else
            {
                await _context.ShoppingCartItems.InsertOneAsync(item);
            }

            return Ok(new { message = "Item added to cart successfully", price = calculatedPrice });
        }

        [HttpDelete("cart/{id}")]
        public async Task<IActionResult> RemoveFromCart(string id)
        {
            var result = await _context.ShoppingCartItems.DeleteOneAsync(c => c.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Cart item not found" });
            }
            return Ok(new { message = "Item removed from cart successfully" });
        }

        [HttpDelete("cart/user/{userId}")]
        public async Task<IActionResult> ClearCart(string userId)
        {
            await _context.ShoppingCartItems.DeleteManyAsync(c => c.UserId == userId);
            return Ok(new { message = "Cart cleared successfully" });
        }

        [HttpGet("states")]
        public async Task<IActionResult> GetStates()
        {
            var states = await _context.States.Find(_ => true).ToListAsync();
            return Ok(states);
        }

        [HttpGet("districts/{stateCode}")]
        public async Task<IActionResult> GetDistricts(string stateCode)
        {
            var districts = await _context.Districts.Find(d => d.StateCode == stateCode).ToListAsync();
            return Ok(districts);
        }

        [HttpGet("config")]
        public IActionResult GetConfig()
        {
            return Ok(new
            {
                shippingCost = 99,
                taxRate = 0.18
            });
        }
    }
}
