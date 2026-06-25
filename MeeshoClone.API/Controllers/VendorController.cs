using MeeshoClone.API.Data;
using MeeshoClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace MeeshoClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VendorController : ControllerBase
{
    private readonly MongoDbContext _context;

    public VendorController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult> RegisterVendor([FromBody] VendorRegisterRequest request)
    {
        var existingVendor = await _context.Vendors.Find(v => v.Email.ToLower() == request.Email.ToLower()).FirstOrDefaultAsync();
        if (existingVendor != null)
        {
            return BadRequest(new { success = false, error = "Vendor already registered" });
        }

        var newVendor = new Vendor
        {
            Id = null,
            CompanyName = request.CompanyName,
            DisplayName = request.DisplayName,
            Email = request.Email.ToLower(),
            Password = HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            Logo = request.Logo,
            CoverImage = request.CoverImage,
            Description = request.Description,
            BusinessType = request.BusinessType,
            GSTNumber = request.GSTNumber,
            PANNumber = request.PANNumber,
            BusinessAddress = request.BusinessAddress,
            IsVerified = false,
            IsActive = true,
            Rating = 0,
            ReviewCount = 0,
            TotalProducts = 0,
            TotalSales = 0,
            TotalRevenue = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Vendors.InsertOneAsync(newVendor);

        return Ok(new { success = true, vendor = new { id = newVendor.Id, companyName = newVendor.CompanyName, displayName = newVendor.DisplayName, email = newVendor.Email } });
    }

    [HttpGet]
    public async Task<ActionResult> GetAllVendors()
    {
        var vendors = await _context.Vendors.Find(_ => true).ToListAsync();
        return Ok(new { success = true, vendors });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetVendorById(string id)
    {
        var vendor = await _context.Vendors.Find(v => v.Id == id).FirstOrDefaultAsync();
        if (vendor == null)
        {
            return NotFound(new { success = false, error = "Vendor not found" });
        }
        return Ok(new { success = true, vendor });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateVendor(string id, [FromBody] Vendor vendor)
    {
        vendor.Id = id;
        vendor.UpdatedAt = DateTime.UtcNow;
        var result = await _context.Vendors.ReplaceOneAsync(v => v.Id == id, vendor);
        if (result.MatchedCount == 0)
        {
            return NotFound(new { success = false, error = "Vendor not found" });
        }
        return Ok(new { success = true, vendor });
    }

    [HttpPost("{id}/verify")]
    public async Task<ActionResult> VerifyVendor(string id)
    {
        var vendor = await _context.Vendors.Find(v => v.Id == id).FirstOrDefaultAsync();
        if (vendor == null)
        {
            return NotFound(new { success = false, error = "Vendor not found" });
        }

        vendor.IsVerified = true;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _context.Vendors.ReplaceOneAsync(v => v.Id == id, vendor);

        return Ok(new { success = true, message = "Vendor verified successfully" });
    }

    private string HashPassword(string password)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}

public class VendorRegisterRequest
{
    public string CompanyName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Logo { get; set; } = string.Empty;
    public string CoverImage { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string GSTNumber { get; set; } = string.Empty;
    public string PANNumber { get; set; } = string.Empty;
    public Address BusinessAddress { get; set; } = new();
}
