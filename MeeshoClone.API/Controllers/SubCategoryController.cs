using MeeshoClone.API.Data;
using MeeshoClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace MeeshoClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubCategoryController : ControllerBase
{
    private readonly MongoDbContext _context;

    public SubCategoryController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult> CreateSubCategory([FromBody] SubCategory subCategory)
    {
        subCategory.Id = null;
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

        subCategory.Id = id;
        subCategory.UpdatedAt = DateTime.UtcNow;
        subCategory.CreatedAt = existingSubCategory.CreatedAt;

        await _context.SubCategories.ReplaceOneAsync(sc => sc.Id == id, subCategory);
        return Ok(new { success = true, subCategory });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteSubCategory(string id)
    {
        var result = await _context.SubCategories.DeleteOneAsync(sc => sc.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { success = false, error = "SubCategory not found" });
        }
        return Ok(new { success = true, message = "SubCategory deleted successfully" });
    }
}
