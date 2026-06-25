using MeeshoClone.API.Data;
using MeeshoClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace MeeshoClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SiteConfigurationController : ControllerBase
{
    private readonly MongoDbContext _context;

    public SiteConfigurationController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetSiteConfiguration()
    {
        var config = await _context.SiteConfigurations.Find(_ => true).FirstOrDefaultAsync();
        if (config == null)
        {
            // Return default configuration if none exists
            var defaultConfig = new SiteConfiguration();
            return Ok(new { success = true, configuration = defaultConfig });
        }
        return Ok(new { success = true, configuration = config });
    }

    [HttpPost]
    public async Task<ActionResult> UpdateSiteConfiguration([FromBody] SiteConfiguration configuration)
    {
        var existingConfig = await _context.SiteConfigurations.Find(_ => true).FirstOrDefaultAsync();
        
        if (existingConfig == null)
        {
            configuration.Id = null;
            configuration.CreatedAt = DateTime.UtcNow;
            configuration.UpdatedAt = DateTime.UtcNow;
            await _context.SiteConfigurations.InsertOneAsync(configuration);
            return Ok(new { success = true, configuration });
        }
        else
        {
            configuration.Id = existingConfig.Id;
            configuration.CreatedAt = existingConfig.CreatedAt;
            configuration.UpdatedAt = DateTime.UtcNow;
            await _context.SiteConfigurations.ReplaceOneAsync(c => c.Id == existingConfig.Id, configuration);
            return Ok(new { success = true, configuration });
        }
    }

    [HttpPut("header")]
    public async Task<ActionResult> UpdateHeaderConfiguration([FromBody] HeaderConfiguration header)
    {
        var config = await _context.SiteConfigurations.Find(_ => true).FirstOrDefaultAsync();
        if (config == null)
        {
            var newConfig = new SiteConfiguration { Header = header };
            newConfig.Id = null;
            newConfig.CreatedAt = DateTime.UtcNow;
            newConfig.UpdatedAt = DateTime.UtcNow;
            await _context.SiteConfigurations.InsertOneAsync(newConfig);
            return Ok(new { success = true, configuration = newConfig });
        }
        else
        {
            config.Header = header;
            config.UpdatedAt = DateTime.UtcNow;
            await _context.SiteConfigurations.ReplaceOneAsync(c => c.Id == config.Id, config);
            return Ok(new { success = true, configuration = config });
        }
    }

    [HttpPut("footer")]
    public async Task<ActionResult> UpdateFooterConfiguration([FromBody] FooterConfiguration footer)
    {
        var config = await _context.SiteConfigurations.Find(_ => true).FirstOrDefaultAsync();
        if (config == null)
        {
            var newConfig = new SiteConfiguration { Footer = footer };
            newConfig.Id = null;
            newConfig.CreatedAt = DateTime.UtcNow;
            newConfig.UpdatedAt = DateTime.UtcNow;
            await _context.SiteConfigurations.InsertOneAsync(newConfig);
            return Ok(new { success = true, configuration = newConfig });
        }
        else
        {
            config.Footer = footer;
            config.UpdatedAt = DateTime.UtcNow;
            await _context.SiteConfigurations.ReplaceOneAsync(c => c.Id == config.Id, config);
            return Ok(new { success = true, configuration = config });
        }
    }

    [HttpPut("theme")]
    public async Task<ActionResult> UpdateThemeConfiguration([FromBody] ThemeConfiguration theme)
    {
        var config = await _context.SiteConfigurations.Find(_ => true).FirstOrDefaultAsync();
        if (config == null)
        {
            var newConfig = new SiteConfiguration { Theme = theme };
            newConfig.Id = null;
            newConfig.CreatedAt = DateTime.UtcNow;
            newConfig.UpdatedAt = DateTime.UtcNow;
            await _context.SiteConfigurations.InsertOneAsync(newConfig);
            return Ok(new { success = true, configuration = newConfig });
        }
        else
        {
            config.Theme = theme;
            config.UpdatedAt = DateTime.UtcNow;
            await _context.SiteConfigurations.ReplaceOneAsync(c => c.Id == config.Id, config);
            return Ok(new { success = true, configuration = config });
        }
    }
}
