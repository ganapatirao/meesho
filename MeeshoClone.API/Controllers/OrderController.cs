using MeeshoClone.API.Data;
using MeeshoClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace MeeshoClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly MongoDbContext _context;

    public OrderController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult> CreateOrder([FromBody] Order order)
    {
        order.Id = null;
        order.OrderDate = DateTime.UtcNow;
        order.EstimatedDeliveryDate = DateTime.UtcNow.AddDays(7);
        
        // Add initial status history
        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = "Pending",
            Timestamp = DateTime.UtcNow,
            Note = "Order placed successfully"
        });

        await _context.Orders.InsertOneAsync(order);

        // Update user stats
        var user = await _context.Users.Find(u => u.Id == order.UserId).FirstOrDefaultAsync();
        if (user != null)
        {
            user.OrderCount++;
            user.TotalSpent += order.FinalAmount;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);
        }

        return Ok(new { success = true, order });
    }

    [HttpGet]
    public async Task<ActionResult> GetAllOrders()
    {
        var orders = await _context.Orders.Find(_ => true).ToListAsync();
        return Ok(new { success = true, orders });
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult> GetOrdersByUser(string userId)
    {
        var orders = await _context.Orders.Find(o => o.UserId == userId).ToListAsync();
        return Ok(new { success = true, orders });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetOrderById(string id)
    {
        var order = await _context.Orders.Find(o => o.Id == id).FirstOrDefaultAsync();
        if (order == null)
        {
            return NotFound(new { success = false, error = "Order not found" });
        }
        return Ok(new { success = true, order });
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdateOrderStatus(string id, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders.Find(o => o.Id == id).FirstOrDefaultAsync();
        if (order == null)
        {
            return NotFound(new { success = false, error = "Order not found" });
        }

        order.Status = request.Status;
        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = request.Status,
            Timestamp = DateTime.UtcNow,
            Note = request.Note ?? $"Status updated to {request.Status}"
        });

        if (request.Status == "Delivered")
        {
            order.DeliveryDate = DateTime.UtcNow;
        }

        await _context.Orders.ReplaceOneAsync(o => o.Id == id, order);

        return Ok(new { success = true, order });
    }

    [HttpPut("{id}/payment")]
    public async Task<ActionResult> UpdatePaymentStatus(string id, [FromBody] UpdatePaymentStatusRequest request)
    {
        var order = await _context.Orders.Find(o => o.Id == id).FirstOrDefaultAsync();
        if (order == null)
        {
            return NotFound(new { success = false, error = "Order not found" });
        }

        order.PaymentStatus = request.PaymentStatus;
        order.PaymentMethod = request.PaymentMethod;

        await _context.Orders.ReplaceOneAsync(o => o.Id == id, order);

        return Ok(new { success = true, order });
    }
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
}

public class UpdatePaymentStatusRequest
{
    public string PaymentStatus { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
}
