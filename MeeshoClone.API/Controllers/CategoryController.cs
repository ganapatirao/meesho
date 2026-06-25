using MeeshoClone.API.Data;
using MeeshoClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace MeeshoClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly MongoDbContext _context;

    public CategoryController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult> CreateCategory([FromBody] Category category)
    {
        category.Id = null;
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

        category.Id = id;
        category.UpdatedAt = DateTime.UtcNow;
        category.CreatedAt = existingCategory.CreatedAt;

        await _context.Categories.ReplaceOneAsync(c => c.Id == id, category);
        return Ok(new { success = true, category });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(string id)
    {
        var result = await _context.Categories.DeleteOneAsync(c => c.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { success = false, error = "Category not found" });
        }
        return Ok(new { success = true, message = "Category deleted successfully" });
    }
}
