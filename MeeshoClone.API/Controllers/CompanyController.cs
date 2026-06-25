using MeeshoClone.API.Data;
using MeeshoClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace MeeshoClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompanyController : ControllerBase
{
    private readonly MongoDbContext _context;

    public CompanyController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult> CreateCompany([FromBody] Company company)
    {
        company.Id = null;
        company.CreatedAt = DateTime.UtcNow;
        company.UpdatedAt = DateTime.UtcNow;
        await _context.Companies.InsertOneAsync(company);
        return Ok(new { success = true, company });
    }

    [HttpGet]
    public async Task<ActionResult> GetAllCompanies()
    {
        var companies = await _context.Companies.Find(_ => true).ToListAsync();
        return Ok(new { success = true, companies });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetCompanyById(string id)
    {
        var company = await _context.Companies.Find(c => c.Id == id).FirstOrDefaultAsync();
        if (company == null)
        {
            return NotFound(new { success = false, error = "Company not found" });
        }
        return Ok(new { success = true, company });
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult> GetCompaniesByCategory(string category)
    {
        var companies = await _context.Companies.Find(c => c.Category == category).ToListAsync();
        return Ok(new { success = true, companies });
    }

    [HttpGet("featured")]
    public async Task<ActionResult> GetFeaturedCompanies()
    {
        var companies = await _context.Companies.Find(c => c.IsFeatured == true).ToListAsync();
        return Ok(new { success = true, companies });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateCompany(string id, [FromBody] Company company)
    {
        var existingCompany = await _context.Companies.Find(c => c.Id == id).FirstOrDefaultAsync();
        if (existingCompany == null)
        {
            return NotFound(new { success = false, error = "Company not found" });
        }

        company.Id = id;
        company.UpdatedAt = DateTime.UtcNow;
        company.CreatedAt = existingCompany.CreatedAt;

        await _context.Companies.ReplaceOneAsync(c => c.Id == id, company);
        return Ok(new { success = true, company });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCompany(string id)
    {
        var result = await _context.Companies.DeleteOneAsync(c => c.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { success = false, error = "Company not found" });
        }
        return Ok(new { success = true, message = "Company deleted successfully" });
    }
}
