using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace HappyShoppingClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly MongoDbContext _context;

    public PaymentController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost("checkout")]
    public async Task<ActionResult> ProcessCheckout([FromBody] CheckoutRequest request)
    {
        // Validate request
        var validationErrors = ValidateCheckoutRequest(request);
        if (validationErrors.Any())
        {
            return BadRequest(new { success = false, errors = validationErrors });
        }

        // Get user's cart
        var cart = await _context.Carts.Find(c => c.UserId == request.UserId).FirstOrDefaultAsync();
        if (cart == null || cart.Items.Count == 0)
        {
            return BadRequest(new { success = false, error = "Cart is empty" });
        }

        // Create order
        var order = new Order
        {
            Id = Guid.NewGuid().ToString(),
            UserId = request.UserId,
            Items = cart.Items.Select(item => new OrderItem
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                ImageUrl = item.ProductImage,
                VariantId = item.VariantId,
                Color = item.Color,
                Size = item.Size,
                Quantity = item.Quantity,
                Price = item.Price,
                Discount = item.OriginalPrice - item.Price
            }).ToList(),
            TotalAmount = cart.Subtotal,
            DiscountAmount = cart.DiscountAmount,
            FinalAmount = cart.TotalAmount,
            ShippingAddress = request.ShippingAddress,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = "Pending",
            Status = "Pending"
        };

        await _context.Orders.InsertOneAsync(order);

        // Create payment record
        var payment = new Payment
        {
            Id = Guid.NewGuid().ToString(),
            OrderId = order.Id,
            UserId = request.UserId,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = "Pending",
            Amount = order.FinalAmount,
            Details = request.PaymentDetails
        };

        if (request.PaymentMethod == "COD" || request.PaymentMethod == "WhatsApp")
        {
            payment.PaymentStatus = "Pending";
            payment.TransactionId = "COD-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
        }
        else
        {
            payment.PaymentStatus = "Processing";
            payment.TransactionId = "TXN-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
        }

        await _context.Payments.InsertOneAsync(payment);

        // Clear cart
        await _context.Carts.DeleteOneAsync(c => c.UserId == request.UserId);

        return Ok(new CheckoutResponse
        {
            Success = true,
            OrderId = order.Id,
            PaymentId = payment.Id,
            Message = "Order placed successfully",
            TotalAmount = order.FinalAmount
        });
    }

    [HttpGet("order/{orderId}")]
    public async Task<ActionResult> GetPaymentByOrder(string orderId)
    {
        var payment = await _context.Payments.Find(p => p.OrderId == orderId).FirstOrDefaultAsync();
        if (payment == null)
        {
            return NotFound(new { success = false, error = "Payment not found" });
        }
        return Ok(new { success = true, payment });
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult> GetPaymentsByUser(string userId)
    {
        var payments = await _context.Payments.Find(p => p.UserId == userId)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(new { success = true, payments });
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdatePaymentStatus(string id, [FromBody] UpdatePaymentStatusRequest request)
    {
        var payment = await _context.Payments.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (payment == null)
        {
            return NotFound(new { success = false, error = "Payment not found" });
        }

        payment.PaymentStatus = request.PaymentStatus;
        if (request.PaymentStatus == "Completed")
        {
            payment.CompletedAt = DateTime.UtcNow;
        }
        if (request.PaymentStatus == "Failed")
        {
            payment.FailureReason = request.FailureReason ?? "Payment failed";
        }

        await _context.Payments.ReplaceOneAsync(p => p.Id == id, payment);

        // Update order payment status
        var order = await _context.Orders.Find(o => o.Id == payment.OrderId).FirstOrDefaultAsync();
        if (order != null)
        {
            order.PaymentStatus = request.PaymentStatus;
            if (request.PaymentStatus == "Completed")
            {
                order.Status = "Confirmed";
            }
            await _context.Orders.ReplaceOneAsync(o => o.Id == order.Id, order);
        }

        return Ok(new { success = true, payment });
    }

    [HttpPost("{id}/refund")]
    public async Task<ActionResult> RefundPayment(string id, [FromBody] RefundRequest request)
    {
        var payment = await _context.Payments.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (payment == null)
        {
            return NotFound(new { success = false, error = "Payment not found" });
        }

        if (payment.PaymentStatus != "Completed")
        {
            return BadRequest(new { success = false, error = "Can only refund completed payments" });
        }

        payment.PaymentStatus = "Refunded";
        await _context.Payments.ReplaceOneAsync(p => p.Id == id, payment);

        // Update order status
        var order = await _context.Orders.Find(o => o.Id == payment.OrderId).FirstOrDefaultAsync();
        if (order != null)
        {
            order.Status = "Refunded";
            await _context.Orders.ReplaceOneAsync(o => o.Id == order.Id, order);
        }

        return Ok(new { success = true, message = "Payment refunded successfully" });
    }

    public class RefundRequest
    {
        public string Reason { get; set; } = string.Empty;
        public decimal? Amount { get; set; }
    }

    private List<string> ValidateCheckoutRequest(CheckoutRequest request)
    {
        var errors = new List<string>();

        // Validate shipping address
        if (string.IsNullOrWhiteSpace(request.ShippingAddress?.FullName))
            errors.Add("Full name is required");
        else if (request.ShippingAddress.FullName.Length < 2 || request.ShippingAddress.FullName.Length > 100)
            errors.Add("Full name must be between 2 and 100 characters");

        if (string.IsNullOrWhiteSpace(request.ShippingAddress?.PhoneNumber))
            errors.Add("Phone number is required");
        else if (!Regex.IsMatch(request.ShippingAddress.PhoneNumber, @"^[6-9]\d{9}$"))
            errors.Add("Invalid phone number format. Must be 10 digits starting with 6-9");

        if (string.IsNullOrWhiteSpace(request.ShippingAddress?.AddressLine1))
            errors.Add("Address line 1 is required");
        else if (request.ShippingAddress.AddressLine1.Length < 5 || request.ShippingAddress.AddressLine1.Length > 200)
            errors.Add("Address line 1 must be between 5 and 200 characters");

        if (!string.IsNullOrWhiteSpace(request.ShippingAddress?.AddressLine2) && request.ShippingAddress.AddressLine2.Length > 200)
            errors.Add("Address line 2 must not exceed 200 characters");

        if (string.IsNullOrWhiteSpace(request.ShippingAddress?.City))
            errors.Add("City is required");
        else if (request.ShippingAddress.City.Length < 2 || request.ShippingAddress.City.Length > 50)
            errors.Add("City must be between 2 and 50 characters");

        if (string.IsNullOrWhiteSpace(request.ShippingAddress?.State))
            errors.Add("State is required");
        else if (request.ShippingAddress.State.Length < 2 || request.ShippingAddress.State.Length > 50)
            errors.Add("State must be between 2 and 50 characters");

        if (string.IsNullOrWhiteSpace(request.ShippingAddress?.PinCode))
            errors.Add("PIN code is required");
        else if (!Regex.IsMatch(request.ShippingAddress.PinCode, @"^\d{6}$"))
            errors.Add("Invalid PIN code format. Must be 6 digits");

        if (string.IsNullOrWhiteSpace(request.ShippingAddress?.AddressType))
            errors.Add("Address type is required");
        else if (!new[] { "Home", "Office", "Other" }.Contains(request.ShippingAddress.AddressType))
            errors.Add("Invalid address type");

        // Validate billing address if different from shipping
        if (request.BillingAddress != null)
        {
            if (string.IsNullOrWhiteSpace(request.BillingAddress.FullName))
                errors.Add("Billing full name is required");
            else if (request.BillingAddress.FullName.Length < 2 || request.BillingAddress.FullName.Length > 100)
                errors.Add("Billing full name must be between 2 and 100 characters");

            if (string.IsNullOrWhiteSpace(request.BillingAddress.PhoneNumber))
                errors.Add("Billing phone number is required");
            else if (!Regex.IsMatch(request.BillingAddress.PhoneNumber, @"^[6-9]\d{9}$"))
                errors.Add("Invalid billing phone number format. Must be 10 digits starting with 6-9");

            if (string.IsNullOrWhiteSpace(request.BillingAddress.AddressLine1))
                errors.Add("Billing address line 1 is required");
            else if (request.BillingAddress.AddressLine1.Length < 5 || request.BillingAddress.AddressLine1.Length > 200)
                errors.Add("Billing address line 1 must be between 5 and 200 characters");

            if (string.IsNullOrWhiteSpace(request.BillingAddress.City))
                errors.Add("Billing city is required");
            else if (request.BillingAddress.City.Length < 2 || request.BillingAddress.City.Length > 50)
                errors.Add("Billing city must be between 2 and 50 characters");

            if (string.IsNullOrWhiteSpace(request.BillingAddress.PinCode))
                errors.Add("Billing PIN code is required");
            else if (!Regex.IsMatch(request.BillingAddress.PinCode, @"^\d{6}$"))
                errors.Add("Invalid billing PIN code format. Must be 6 digits");
        }

        // Validate payment method
        if (string.IsNullOrWhiteSpace(request.PaymentMethod))
            errors.Add("Payment method is required");
        else if (!new[] { "COD", "WhatsApp", "PhonePe", "CreditCard", "NetBanking" }.Contains(request.PaymentMethod))
            errors.Add("Invalid payment method");

        // Validate payment details based on payment method
        if (request.PaymentMethod == "PhonePe")
        {
            if (string.IsNullOrWhiteSpace(request.PaymentDetails?.UpiId))
                errors.Add("UPI ID is required for PhonePe payment");
            else if (!Regex.IsMatch(request.PaymentDetails.UpiId, @"^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$"))
                errors.Add("Invalid UPI ID format");
        }

        if (request.PaymentMethod == "CreditCard")
        {
            if (string.IsNullOrWhiteSpace(request.PaymentDetails?.CardNumber))
                errors.Add("Card number is required");
            else if (!Regex.IsMatch(request.PaymentDetails.CardNumber.Replace(" ", ""), @"^\d{16}$"))
                errors.Add("Invalid card number format. Must be 16 digits");

            if (string.IsNullOrWhiteSpace(request.PaymentDetails.CardHolderName))
                errors.Add("Card holder name is required");
            else if (request.PaymentDetails.CardHolderName.Length < 2 || request.PaymentDetails.CardHolderName.Length > 100)
                errors.Add("Card holder name must be between 2 and 100 characters");

            if (string.IsNullOrWhiteSpace(request.PaymentDetails.CardExpiry))
                errors.Add("Card expiry date is required");
            else if (!Regex.IsMatch(request.PaymentDetails.CardExpiry, @"^(0[1-9]|1[0-2])\/\d{2}$"))
                errors.Add("Invalid card expiry format. Must be MM/YY");
        }

        if (request.PaymentMethod == "NetBanking")
        {
            if (string.IsNullOrWhiteSpace(request.PaymentDetails?.BankName))
                errors.Add("Bank name is required for net banking");
        }

        return errors;
    }
}
