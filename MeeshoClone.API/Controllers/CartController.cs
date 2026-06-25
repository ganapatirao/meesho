using MeeshoClone.API.Data;
using MeeshoClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace MeeshoClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly MongoDbContext _context;

    public CartController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult> GetUserCart(string userId)
    {
        var cart = await _context.Carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();
        if (cart == null)
        {
            return Ok(new { success = true, cart = new Cart { UserId = userId, Items = new List<CartItem>(), TotalAmount = 0 } });
        }
        return Ok(new { success = true, cart });
    }

    [HttpPost]
    public async Task<ActionResult> AddToCart([FromBody] Cart cart)
    {
        var existingCart = await _context.Carts.Find(c => c.UserId == cart.UserId).FirstOrDefaultAsync();
        
        if (existingCart == null)
        {
            cart.Id = null;
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.Carts.InsertOneAsync(cart);
            return Ok(new { success = true, cart });
        }
        else
        {
            // Merge items
            foreach (var newItem in cart.Items)
            {
                var existingItem = existingCart.Items.FirstOrDefault(i => i.ProductId == newItem.ProductId);
                if (existingItem != null)
                {
                    existingItem.Quantity += newItem.Quantity;
                }
                else
                {
                    existingCart.Items.Add(newItem);
                }
            }
            
            // Recalculate total
            existingCart.TotalAmount = existingCart.Items.Sum(i => i.Price * i.Quantity);
            existingCart.UpdatedAt = DateTime.UtcNow;
            await _context.Carts.ReplaceOneAsync(c => c.Id == existingCart.Id, existingCart);
            return Ok(new { success = true, cart = existingCart });
        }
    }

    [HttpPut("{cartId}")]
    public async Task<ActionResult> UpdateCart(string cartId, [FromBody] Cart cart)
    {
        var existingCart = await _context.Carts.Find(c => c.Id == cartId).FirstOrDefaultAsync();
        if (existingCart == null)
        {
            return NotFound(new { success = false, error = "Cart not found" });
        }

        cart.Id = cartId;
        cart.UserId = existingCart.UserId;
        cart.UpdatedAt = DateTime.UtcNow;
        cart.TotalAmount = cart.Items.Sum(i => i.Price * i.Quantity);
        
        await _context.Carts.ReplaceOneAsync(c => c.Id == cartId, cart);
        return Ok(new { success = true, cart });
    }

    [HttpDelete("{cartId}/item/{itemId}")]
    public async Task<ActionResult> RemoveFromCart(string cartId, string itemId)
    {
        var cart = await _context.Carts.Find(c => c.Id == cartId).FirstOrDefaultAsync();
        if (cart == null)
        {
            return NotFound(new { success = false, error = "Cart not found" });
        }

        var item = cart.Items.FirstOrDefault(i => i.ProductId == itemId);
        if (item != null)
        {
            cart.Items.Remove(item);
            cart.TotalAmount = cart.Items.Sum(i => i.Price * i.Quantity);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.Carts.ReplaceOneAsync(c => c.Id == cartId, cart);
        }

        return Ok(new { success = true, cart });
    }

    [HttpDelete("{cartId}")]
    public async Task<ActionResult> ClearCart(string cartId)
    {
        var result = await _context.Carts.DeleteOneAsync(c => c.Id == cartId);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { success = false, error = "Cart not found" });
        }
        return Ok(new { success = true, message = "Cart cleared successfully" });
    }
}
