using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;

namespace HappyShoppingClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly MongoDbContext _context;

    public CategoryController(MongoDbContext context)
    {
        _context = context;
    }

    private bool IsValidBase64Image(string base64String)
    {
        if (string.IsNullOrWhiteSpace(base64String))
            return true; // Empty is valid (optional field)

        try
        {
            // Check if it starts with data:image prefix
            if (!base64String.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
                return false;

            // Extract the base64 part after the comma
            var parts = base64String.Split(',');
            if (parts.Length < 2)
                return false;

            var base64Data = parts[1];

            // Try to convert from base64
            var bytes = Convert.FromBase64String(base64Data);

            // Check if it's a reasonable size (at least 10 bytes)
            return bytes.Length > 10;
        }
        catch
        {
            return false;
        }
    }

    [HttpGet("validation-rules")]
    public ActionResult GetValidationRules()
    {
        var rules = new CategoryValidationRules
        {
            Name = new CategoryValidationRules.FieldRule
            {
                Required = true,
                MinLength = 2,
                MaxLength = 50,
                Regex = @"^[a-z0-9-]+$",
                ErrorMessage = "Category name is required, must be 2-50 characters, lowercase letters, numbers, and hyphens only"
            },
            DisplayName = new CategoryValidationRules.FieldRule
            {
                Required = true,
                MinLength = 2,
                MaxLength = 100,
                ErrorMessage = "Display name is required, must be 2-100 characters"
            },
            Icon = new CategoryValidationRules.FieldRule
            {
                Required = false,
                MaxLength = 2,
                ErrorMessage = "Icon cannot exceed 2 characters"
            },
            Image = new CategoryValidationRules.FieldRule
            {
                Required = false,
                ErrorMessage = "Image must be a valid base64 encoded image"
            },
            Description = new CategoryValidationRules.FieldRule
            {
                Required = false,
                MaxLength = 500,
                ErrorMessage = "Description cannot exceed 500 characters"
            },
            DisplayOrder = new CategoryValidationRules.FieldRule
            {
                Required = false,
                ErrorMessage = "Display order must be a positive number"
            }
        };
        return Ok(new { success = true, rules });
    }

    [HttpGet("max-display-order")]
    public async Task<ActionResult> GetMaxDisplayOrder()
    {
        var categories = await _context.Categories.Find(_ => true).ToListAsync();
        int maxDisplayOrder = categories.Any() ? categories.Max(c => c.DisplayOrder) : -1;
        var nextDisplayOrder = maxDisplayOrder + 1;
        return Ok(new { success = true, maxDisplayOrder = nextDisplayOrder });
    }

    [HttpPost]
    public async Task<ActionResult> CreateCategory([FromBody] Category category)
    {
        // Validate model
        var validationContext = new ValidationContext(category);
        var validationResults = new List<ValidationResult>();
        bool isValid = Validator.TryValidateObject(category, validationContext, validationResults, true);

        if (!isValid)
        {
            var errors = validationResults.Select(vr => vr.ErrorMessage);
            return BadRequest(new { success = false, errors });
        }

        // Validate image/icon exclusivity - only one can be set
        if (!string.IsNullOrWhiteSpace(category.Image) && !string.IsNullOrWhiteSpace(category.Icon))
        {
            return BadRequest(new { success = false, errors = new[] { "Only one of Image or Icon can be set, not both" } });
        }

        // Validate that at least one of image or icon is set
        if (string.IsNullOrWhiteSpace(category.Image) && string.IsNullOrWhiteSpace(category.Icon))
        {
            return BadRequest(new { success = false, errors = new[] { "Either Image or Icon is required" } });
        }

        // Validate base64 image format if provided
        if (!string.IsNullOrWhiteSpace(category.Image) && !IsValidBase64Image(category.Image))
        {
            return BadRequest(new { success = false, errors = new[] { "Invalid image format. Image must be a valid base64 encoded image." } });
        }

        // Auto-set display order if not provided (0 if no categories exist, otherwise max + 1)
        if (category.DisplayOrder == 0)
        {
            var categories = await _context.Categories.Find(_ => true).ToListAsync();
            category.DisplayOrder = categories.Any() ? categories.Max(c => c.DisplayOrder) + 1 : 0;
        }

        category.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        category.CreatedAt = DateTime.UtcNow;
        category.UpdatedAt = DateTime.UtcNow;
        await _context.Categories.InsertOneAsync(category);
        return Ok(new { success = true, category });
    }

    [HttpGet]
    public async Task<ActionResult> GetAllCategories()
    {
        var categories = await _context.Categories.Find(_ => true).ToListAsync();
        return Ok(new { success = true, categories });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetCategoryById(string id)
    {
        var category = await _context.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
        if (category == null)
        {
            return NotFound(new { success = false, error = "Category not found" });
        }
        return Ok(new { success = true, category });
    }

    [HttpGet("featured")]
    public async Task<ActionResult> GetFeaturedCategories()
    {
        var categories = await _context.Categories.Find(c => c.IsFeatured == true).ToListAsync();
        return Ok(new { success = true, categories });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateCategory(string id, [FromBody] Category category)
    {
        var existingCategory = await _context.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
        if (existingCategory == null)
        {
            return NotFound(new { success = false, error = "Category not found" });
        }

        // Validate model
        var validationContext = new ValidationContext(category);
        var validationResults = new List<ValidationResult>();
        bool isValid = Validator.TryValidateObject(category, validationContext, validationResults, true);

        if (!isValid)
        {
            var errors = validationResults.Select(vr => vr.ErrorMessage);
            return BadRequest(new { success = false, errors });
        }

        // Validate image/icon exclusivity - only one can be set
        if (!string.IsNullOrWhiteSpace(category.Image) && !string.IsNullOrWhiteSpace(category.Icon))
        {
            return BadRequest(new { success = false, errors = new[] { "Only one of Image or Icon can be set, not both" } });
        }

        // Validate that at least one of image or icon is set
        if (string.IsNullOrWhiteSpace(category.Image) && string.IsNullOrWhiteSpace(category.Icon))
        {
            return BadRequest(new { success = false, errors = new[] { "Either Image or Icon is required" } });
        }

        // Validate base64 image format if provided
        if (!string.IsNullOrWhiteSpace(category.Image) && !IsValidBase64Image(category.Image))
        {
            return BadRequest(new { success = false, errors = new[] { "Invalid image format. Image must be a valid base64 encoded image." } });
        }

        category.Id = id;
        category.UpdatedAt = DateTime.UtcNow;
        category.CreatedAt = existingCategory.CreatedAt;

        await _context.Categories.ReplaceOneAsync(c => c.Id == id, category);
        return Ok(new { success = true, category });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(string id)
    {
        // Check if category has subcategories
        var subCategories = await _context.SubCategories.Find(sc => sc.CategoryId == id).ToListAsync();
        if (subCategories.Any())
        {
            return BadRequest(new { success = false, error = "Cannot delete category because it has subcategories. Please delete the subcategories first." });
        }

        var result = await _context.Categories.DeleteOneAsync(c => c.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { success = false, error = "Category not found" });
        }
        return Ok(new { success = true, message = "Category deleted successfully" });
    }
}
