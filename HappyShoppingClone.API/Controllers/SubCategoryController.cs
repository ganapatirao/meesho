using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace HappyShoppingClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubCategoryController : ControllerBase
{
    private readonly MongoDbContext _context;

    public SubCategoryController(MongoDbContext context)
    {
        _context = context;
    }

    private bool IsValidBase64Image(string base64String)
    {
        if (string.IsNullOrWhiteSpace(base64String))
            return true;
        try
        {
            if (!base64String.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
                return false;
            var parts = base64String.Split(',');
            if (parts.Length < 2)
                return false;
            var base64Data = parts[1];
            var bytes = Convert.FromBase64String(base64Data);
            return bytes.Length > 10;
        }
        catch { return false; }
    }

    [HttpGet("validation-rules")]
    public ActionResult GetValidationRules()
    {
        var rules = new SubCategoryValidationRules
        {
            Name = new SubCategoryValidationRules.FieldRule
            {
                Required = true,
                MinLength = 2,
                MaxLength = 50,
                Regex = @"^[a-z0-9-]+$",
                ErrorMessage = "SubCategory name is required, must be 2-50 characters, lowercase letters, numbers, and hyphens only"
            },
            DisplayName = new SubCategoryValidationRules.FieldRule
            {
                Required = true,
                MinLength = 2,
                MaxLength = 100,
                ErrorMessage = "Display name is required, must be 2-100 characters"
            },
            CategoryId = new SubCategoryValidationRules.FieldRule
            {
                Required = true,
                ErrorMessage = "Category is required"
            },
            Icon = new SubCategoryValidationRules.FieldRule
            {
                Required = false,
                MaxLength = 2,
                ErrorMessage = "Icon cannot exceed 2 characters"
            },
            Image = new SubCategoryValidationRules.FieldRule
            {
                Required = false,
                ErrorMessage = "Image must be a valid base64 encoded image"
            },
            Description = new SubCategoryValidationRules.FieldRule
            {
                Required = false,
                MaxLength = 500,
                ErrorMessage = "Description cannot exceed 500 characters"
            },
            DisplayOrder = new SubCategoryValidationRules.FieldRule
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
        var subCategories = await _context.SubCategories.Find(_ => true).ToListAsync();
        int maxDisplayOrder = subCategories.Any() ? subCategories.Max(sc => sc.DisplayOrder) : -1;
        var nextDisplayOrder = maxDisplayOrder + 1;
        return Ok(new { success = true, maxDisplayOrder = nextDisplayOrder });
    }

    [HttpPost]
    public async Task<ActionResult> CreateSubCategory([FromBody] SubCategory subCategory)
    {
        // Validate model
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(subCategory, serviceProvider: null, items: null);
        bool isValid = Validator.TryValidateObject(subCategory, validationContext, validationResults, validateAllProperties: true);
        
        if (!isValid)
        {
            var errors = validationResults.Select(vr => vr.ErrorMessage).ToList();
            return BadRequest(new { success = false, errors });
        }

        // Validate base64 image
        if (!IsValidBase64Image(subCategory.Image))
        {
            return BadRequest(new { success = false, errors = new[] { "Invalid image format. Please upload a valid image." } });
        }

        // Validate image/icon exclusivity - only one can be set
        if (!string.IsNullOrWhiteSpace(subCategory.Image) && !string.IsNullOrWhiteSpace(subCategory.Icon))
        {
            return BadRequest(new { success = false, errors = new[] { "Only one of Image or Icon can be set, not both" } });
        }

        // Validate that at least one of image or icon is set
        if (string.IsNullOrWhiteSpace(subCategory.Image) && string.IsNullOrWhiteSpace(subCategory.Icon))
        {
            return BadRequest(new { success = false, errors = new[] { "Either Image or Icon is required" } });
        }

        subCategory.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        subCategory.CreatedAt = DateTime.UtcNow;
        subCategory.UpdatedAt = DateTime.UtcNow;
        await _context.SubCategories.InsertOneAsync(subCategory);
        return Ok(new { success = true, subCategory });
    }

    [HttpGet]
    public async Task<ActionResult> GetAllSubCategories()
    {
        var subCategories = await _context.SubCategories.Find(_ => true).ToListAsync();
        return Ok(new { success = true, subCategories });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetSubCategoryById(string id)
    {
        var subCategory = await _context.SubCategories.Find(sc => sc.Id == id).FirstOrDefaultAsync();
        if (subCategory == null)
        {
            return NotFound(new { success = false, error = "SubCategory not found" });
        }
        return Ok(new { success = true, subCategory });
    }

    [HttpGet("category/{categoryId}")]
    public async Task<ActionResult> GetSubCategoriesByCategory(string categoryId)
    {
        var subCategories = await _context.SubCategories.Find(sc => sc.CategoryId == categoryId).ToListAsync();
        return Ok(new { success = true, subCategories });
    }

    [HttpGet("featured")]
    public async Task<ActionResult> GetFeaturedSubCategories()
    {
        var subCategories = await _context.SubCategories.Find(sc => sc.IsFeatured == true).ToListAsync();
        return Ok(new { success = true, subCategories });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateSubCategory(string id, [FromBody] SubCategory subCategory)
    {
        var existingSubCategory = await _context.SubCategories.Find(sc => sc.Id == id).FirstOrDefaultAsync();
        if (existingSubCategory == null)
        {
            return NotFound(new { success = false, error = "SubCategory not found" });
        }

        // Validate model
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(subCategory, serviceProvider: null, items: null);
        bool isValid = Validator.TryValidateObject(subCategory, validationContext, validationResults, validateAllProperties: true);
        
        if (!isValid)
        {
            var errors = validationResults.Select(vr => vr.ErrorMessage).ToList();
            return BadRequest(new { success = false, errors });
        }

        // Merge incoming values with existing values for validation
        // Empty string means "clear this field", null means "keep existing"
        var imageToUse = subCategory.Image == "" ? "" : (subCategory.Image ?? existingSubCategory.Image);
        var iconToUse = subCategory.Icon == "" ? "" : (subCategory.Icon ?? existingSubCategory.Icon);

        // Validate base64 image only if image is being provided/changed
        if (!string.IsNullOrWhiteSpace(subCategory.Image) && subCategory.Image != existingSubCategory.Image)
        {
            if (!IsValidBase64Image(subCategory.Image))
            {
                return BadRequest(new { success = false, errors = new[] { "Invalid image format. Please upload a valid image." } });
            }
        }

        // Validate image/icon exclusivity - only check on incoming values
        // If user is explicitly setting one and clearing the other, allow it
        var hasIncomingImage = !string.IsNullOrWhiteSpace(subCategory.Image);
        var hasIncomingIcon = !string.IsNullOrWhiteSpace(subCategory.Icon);
        var isClearingImage = subCategory.Image == "";
        var isClearingIcon = subCategory.Icon == "";
        
        // Only validate exclusivity if user is trying to set both
        if (hasIncomingImage && hasIncomingIcon)
        {
            return BadRequest(new { success = false, errors = new[] { "Only one of Image or Icon can be set, not both" } });
        }

        // Validate that at least one of image or icon is set (on final merged values)
        if (string.IsNullOrWhiteSpace(imageToUse) && string.IsNullOrWhiteSpace(iconToUse))
        {
            return BadRequest(new { success = false, errors = new[] { "Either Image or Icon is required" } });
        }

        subCategory.Id = id;
        subCategory.UpdatedAt = DateTime.UtcNow;
        subCategory.CreatedAt = existingSubCategory.CreatedAt;
        
        // Preserve existing image/icon if not being updated (null means not provided, empty means clear)
        if (subCategory.Image == null)
        {
            subCategory.Image = existingSubCategory.Image;
        }
        if (subCategory.Icon == null)
        {
            subCategory.Icon = existingSubCategory.Icon;
        }

        await _context.SubCategories.ReplaceOneAsync(sc => sc.Id == id, subCategory);
        return Ok(new { success = true, subCategory });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteSubCategory(string id)
    {
        // Get the subcategory to check its name
        var subCategory = await _context.SubCategories.Find(sc => sc.Id == id).FirstOrDefaultAsync();
        if (subCategory == null)
        {
            return NotFound(new { success = false, error = "SubCategory not found" });
        }

        // Check if subcategory has products mapped to it by ID
        var products = await _context.Products.Find(p => p.SubCategoryId == subCategory.Id).ToListAsync();
        if (products.Any())
        {
            return BadRequest(new { success = false, error = "Cannot delete subcategory because it has products. Please delete the products first." });
        }

        var result = await _context.SubCategories.DeleteOneAsync(sc => sc.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { success = false, error = "SubCategory not found" });
        }
        return Ok(new { success = true, message = "SubCategory deleted successfully" });
    }
}
