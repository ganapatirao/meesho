using BusinessPlatform.API.Data;
using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using BusinessPlatform.API.Seed;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using ValidationSeed = BusinessPlatform.API.Seed.ValidationSeedData;

namespace BusinessPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ValidationController : ControllerBase
    {
        private readonly ValidationService _validationService;
        private readonly MongoDbContext _context;

        public ValidationController(ValidationService validationService, MongoDbContext context)
        {
            _validationService = validationService;
            _context = context;
        }

        [HttpGet("settings/{entityType}")]
        public async Task<ActionResult<Dictionary<string, ValidationSetting>>> GetValidationSettings(string entityType)
        {
            try
            {
                var settings = await _validationService.GetValidationSettingsAsync(entityType);
                return Ok(settings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("validate")]
        public ActionResult<ValidationResult> ValidateField([FromBody] ValidationRequest request)
        {
            try
            {
                var settings = _validationService.GetValidationSettingsAsync(request.EntityType).Result;
                if (!settings.ContainsKey(request.FieldName))
                {
                    return BadRequest(new { error = "Field not found in validation settings" });
                }

                var result = _validationService.ValidateField(request.FieldName, request.Value, settings[request.FieldName]);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("seed")]
        public async Task<ActionResult> SeedValidationData([FromBody] string entityType = "all")
        {
            try
            {
                if (entityType == "all" || entityType == "checkout")
                {
                    var checkoutSettings = ValidationSeed.GetCheckoutValidationSettings();
                    var existingCheckoutCount = await _context.ValidationSettings.CountDocumentsAsync(Builders<ValidationSetting>.Filter.Eq(v => v.EntityType, "checkout"));
                    
                    if (existingCheckoutCount == 0)
                    {
                        await _context.ValidationSettings.InsertManyAsync(checkoutSettings);
                    }
                }
                
                if (entityType == "all" || entityType == "advertisement")
                {
                    var adSettings = ValidationSeed.GetAdvertisementValidationSettings();
                    var existingAdCount = await _context.ValidationSettings.CountDocumentsAsync(Builders<ValidationSetting>.Filter.Eq(v => v.EntityType, "Advertisement"));
                    
                    if (existingAdCount == 0)
                    {
                        await _context.ValidationSettings.InsertManyAsync(adSettings);
                    }
                }
                
                if (entityType == "all" || entityType == "adcategory")
                {
                    var adCategorySettings = ValidationSeed.GetAdCategoryValidationSettings();
                    var existingAdCategoryCount = await _context.ValidationSettings.CountDocumentsAsync(Builders<ValidationSetting>.Filter.Eq(v => v.EntityType, "AdCategory"));
                    
                    if (existingAdCategoryCount == 0)
                    {
                        await _context.ValidationSettings.InsertManyAsync(adCategorySettings);
                    }
                }
                
                if (entityType == "all" || entityType == "state")
                {
                    var stateSettings = ValidationSeed.GetStateValidationSettings();
                    var existingStateCount = await _context.ValidationSettings.CountDocumentsAsync(Builders<ValidationSetting>.Filter.Eq(v => v.EntityType, "State"));
                    
                    if (existingStateCount == 0)
                    {
                        await _context.ValidationSettings.InsertManyAsync(stateSettings);
                    }
                }
                
                if (entityType == "all" || entityType == "city")
                {
                    var citySettings = ValidationSeed.GetCityValidationSettings();
                    var existingCityCount = await _context.ValidationSettings.CountDocumentsAsync(Builders<ValidationSetting>.Filter.Eq(v => v.EntityType, "City"));
                    
                    if (existingCityCount == 0)
                    {
                        await _context.ValidationSettings.InsertManyAsync(citySettings);
                    }
                }
                
                if (entityType == "all" || entityType == "adcondition")
                {
                    var adConditionSettings = ValidationSeed.GetAdConditionValidationSettings();
                    var existingAdConditionCount = await _context.ValidationSettings.CountDocumentsAsync(Builders<ValidationSetting>.Filter.Eq(v => v.EntityType, "AdCondition"));
                    
                    if (existingAdConditionCount == 0)
                    {
                        await _context.ValidationSettings.InsertManyAsync(adConditionSettings);
                    }
                }
                
                return Ok(new { message = $"Validation settings seeded successfully for {entityType}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("invalidate-cache/{entityType?}")]
        public ActionResult InvalidateCache(string entityType = null)
        {
            try
            {
                _validationService.InvalidateCache(entityType);
                return Ok(new { message = "Cache invalidated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class ValidationRequest
    {
        public string EntityType { get; set; } = string.Empty;
        public string FieldName { get; set; } = string.Empty;
        public object? Value { get; set; }
    }
}
