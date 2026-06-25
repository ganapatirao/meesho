using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace BusinessPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdvertisingController : ControllerBase
    {
        private readonly MongoDbContext _context;
        private readonly ValidationService _validationService;

        public AdvertisingController(MongoDbContext context, ValidationService validationService)
        {
            _context = context;
            _validationService = validationService;
        }

        [HttpGet("ads")]
        public async Task<IActionResult> GetAds()
        {
            var ads = await _context.Advertisements.Find(_ => true).ToListAsync();
            return Ok(ads);
        }

        [HttpGet("ads/{id}")]
        public async Task<IActionResult> GetAd(string id)
        {
            var ad = await _context.Advertisements.Find(a => a.Id == id).FirstOrDefaultAsync();
            if (ad == null)
            {
                return NotFound(new { message = "Advertisement not found" });
            }
            return Ok(ad);
        }

        [HttpGet("ads/user/{userId}")]
        public async Task<IActionResult> GetUserAds(string userId)
        {
            var ads = await _context.Advertisements.Find(a => a.SellerId == userId).ToListAsync();
            return Ok(ads);
        }

        [HttpPost("ads")]
        [Authorize]
        public async Task<IActionResult> CreateAd([FromBody] Advertisement ad)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

            // Dynamic validation using ValidationService
            var validationSettings = await _validationService.GetValidationSettingsAsync("Advertisement");
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("title"))
            {
                var result = _validationService.ValidateField("title", ad.Title, validationSettings["title"]);
                if (!result.IsValid) errors["title"] = result.Errors;
            }
            if (validationSettings.ContainsKey("description"))
            {
                var result = _validationService.ValidateField("description", ad.Description, validationSettings["description"]);
                if (!result.IsValid) errors["description"] = result.Errors;
            }
            if (validationSettings.ContainsKey("price"))
            {
                var priceResult = _validationService.ValidateField("price", ad.Price.ToString(), validationSettings["price"]);
                if (!priceResult.IsValid) errors["price"] = priceResult.Errors;
            }
            if (validationSettings.ContainsKey("categoryName"))
            {
                var result = _validationService.ValidateField("categoryName", ad.CategoryName, validationSettings["categoryName"]);
                if (!result.IsValid) errors["categoryName"] = result.Errors;
            }
            if (validationSettings.ContainsKey("location"))
            {
                var result = _validationService.ValidateField("location", ad.Location, validationSettings["location"]);
                if (!result.IsValid) errors["location"] = result.Errors;
            }
            if (validationSettings.ContainsKey("city"))
            {
                var result = _validationService.ValidateField("city", ad.City, validationSettings["city"]);
                if (!result.IsValid) errors["city"] = result.Errors;
            }
            if (validationSettings.ContainsKey("condition"))
            {
                var result = _validationService.ValidateField("condition", ad.Condition, validationSettings["condition"]);
                if (!result.IsValid) errors["condition"] = result.Errors;
            }
            if (validationSettings.ContainsKey("sellerPhone"))
            {
                var result = _validationService.ValidateField("sellerPhone", ad.SellerPhone, validationSettings["sellerPhone"]);
                if (!result.IsValid) errors["phone"] = result.Errors;
            }
            if (validationSettings.ContainsKey("sellerEmail"))
            {
                var emailResult = _validationService.ValidateField("sellerEmail", ad.SellerEmail, validationSettings["sellerEmail"]);
                if (!emailResult.IsValid) errors["email"] = emailResult.Errors;
            }
            if (validationSettings.ContainsKey("imageUrl"))
            {
                var imageResult = _validationService.ValidateField("imageUrl", ad.ImageUrl, validationSettings["imageUrl"]);
                if (!imageResult.IsValid) errors["imageUrl"] = imageResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            // Additional validation for image URLs - allow data URLs
            if (!string.IsNullOrEmpty(ad.ImageUrl) && !ad.ImageUrl.StartsWith("data:") && !Uri.TryCreate(ad.ImageUrl, UriKind.Absolute, out _))
            {
                return BadRequest(new { message = "Invalid image URL format" });
            }

            if (ad.ImageUrls != null)
            {
                foreach (var url in ad.ImageUrls)
                {
                    if (!string.IsNullOrEmpty(url) && !url.StartsWith("data:") && !Uri.TryCreate(url, UriKind.Absolute, out _))
                    {
                        return BadRequest(new { message = "Invalid image URL format in additional images" });
                    }
                }
            }

            ad.Id = null;
            ad.CreatedAt = DateTime.UtcNow;
            ad.UpdatedAt = DateTime.UtcNow;
            await _context.Advertisements.InsertOneAsync(ad);
            return Ok(new { message = "Advertisement created successfully", ad });
        }

        [HttpPut("ads/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAd(string id, [FromBody] Advertisement ad)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Validation failed", errors = ModelState });
            }

            // Dynamic validation using ValidationService
            var validationSettings = await _validationService.GetValidationSettingsAsync("Advertisement");
            var errors = new Dictionary<string, List<string>>();

            if (validationSettings.ContainsKey("title"))
            {
                var titleResult = _validationService.ValidateField("title", ad.Title, validationSettings["title"]);
                if (!titleResult.IsValid) errors["title"] = titleResult.Errors;
            }
            if (validationSettings.ContainsKey("description"))
            {
                var descResult = _validationService.ValidateField("description", ad.Description, validationSettings["description"]);
                if (!descResult.IsValid) errors["description"] = descResult.Errors;
            }
            if (validationSettings.ContainsKey("price"))
            {
                var priceResult = _validationService.ValidateField("price", ad.Price.ToString(), validationSettings["price"]);
                if (!priceResult.IsValid) errors["price"] = priceResult.Errors;
            }
            if (validationSettings.ContainsKey("categoryName"))
            {
                var catResult = _validationService.ValidateField("categoryName", ad.CategoryName, validationSettings["categoryName"]);
                if (!catResult.IsValid) errors["categoryName"] = catResult.Errors;
            }
            if (validationSettings.ContainsKey("location"))
            {
                var locResult = _validationService.ValidateField("location", ad.Location, validationSettings["location"]);
                if (!locResult.IsValid) errors["location"] = locResult.Errors;
            }
            if (validationSettings.ContainsKey("city"))
            {
                var cityResult = _validationService.ValidateField("city", ad.City, validationSettings["city"]);
                if (!cityResult.IsValid) errors["city"] = cityResult.Errors;
            }
            if (validationSettings.ContainsKey("condition"))
            {
                var condResult = _validationService.ValidateField("condition", ad.Condition, validationSettings["condition"]);
                if (!condResult.IsValid) errors["condition"] = condResult.Errors;
            }
            if (validationSettings.ContainsKey("sellerPhone"))
            {
                var phoneResult = _validationService.ValidateField("sellerPhone", ad.SellerPhone, validationSettings["sellerPhone"]);
                if (!phoneResult.IsValid) errors["phone"] = phoneResult.Errors;
            }
            if (validationSettings.ContainsKey("sellerEmail"))
            {
                var emailResult = _validationService.ValidateField("sellerEmail", ad.SellerEmail, validationSettings["sellerEmail"]);
                if (!emailResult.IsValid) errors["email"] = emailResult.Errors;
            }
            if (validationSettings.ContainsKey("imageUrl"))
            {
                var imageResult = _validationService.ValidateField("imageUrl", ad.ImageUrl, validationSettings["imageUrl"]);
                if (!imageResult.IsValid) errors["imageUrl"] = imageResult.Errors;
            }

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Validation failed", errors });
            }

            // Additional validation for image URLs - allow data URLs
            if (!string.IsNullOrEmpty(ad.ImageUrl) && !ad.ImageUrl.StartsWith("data:") && !Uri.TryCreate(ad.ImageUrl, UriKind.Absolute, out _))
            {
                return BadRequest(new { message = "Invalid image URL format" });
            }

            if (ad.ImageUrls != null)
            {
                foreach (var url in ad.ImageUrls)
                {
                    if (!string.IsNullOrEmpty(url) && !url.StartsWith("data:") && !Uri.TryCreate(url, UriKind.Absolute, out _))
                    {
                        return BadRequest(new { message = "Invalid image URL format in additional images" });
                    }
                }
            }

            ad.Id = id;
            ad.UpdatedAt = DateTime.UtcNow;
            var result = await _context.Advertisements.ReplaceOneAsync(a => a.Id == id, ad);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Advertisement not found" });
            }
            return Ok(new { message = "Advertisement updated successfully" });
        }

        [HttpPut("ads/{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateAdStatus(string id, [FromBody] StatusUpdate update)
        {
            var updateDef = Builders<Advertisement>.Update.Set(a => a.Status, update.Status);
            var result = await _context.Advertisements.UpdateOneAsync(a => a.Id == id, updateDef);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Advertisement not found" });
            }
            return Ok(new { message = "Advertisement status updated successfully" });
        }

        [HttpDelete("ads/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAd(string id)
        {
            var result = await _context.Advertisements.DeleteOneAsync(a => a.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Advertisement not found" });
            }
            return Ok(new { message = "Advertisement deleted successfully" });
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.AdCategories.Find(_ => true).ToListAsync();
            return Ok(categories);
        }

        [HttpPost("categories")]
        [Authorize]
        public async Task<IActionResult> CreateCategory([FromBody] AdCategory category)
        {
            category.Id = null;
            category.CreatedAt = DateTime.UtcNow;
            await _context.AdCategories.InsertOneAsync(category);
            return Ok(new { message = "Category created successfully", category });
        }

        [HttpGet("responses/{adId}")]
        public async Task<IActionResult> GetAdResponses(string adId)
        {
            var responses = await _context.AdResponses.Find(r => r.AdId == adId).ToListAsync();
            return Ok(responses);
        }

        [HttpPost("responses")]
        [Authorize]
        public async Task<IActionResult> CreateResponse([FromBody] AdResponse response)
        {
            response.Id = null;
            response.CreatedAt = DateTime.UtcNow;
            await _context.AdResponses.InsertOneAsync(response);
            return Ok(new { message = "Message sent successfully", response });
        }

        [HttpGet("responses/user/{userId}")]
        public async Task<IActionResult> GetUserResponses(string userId)
        {
            var responses = await _context.AdResponses.Find(r => r.ResponderId == userId).ToListAsync();
            return Ok(responses);
        }

        [HttpGet("agents")]
        public async Task<IActionResult> GetAgents()
        {
            var agents = await _context.Agents.Find(_ => true).ToListAsync();
            return Ok(agents);
        }

        [HttpGet("agents/{id}")]
        public async Task<IActionResult> GetAgent(string id)
        {
            var agent = await _context.Agents.Find(a => a.Id == id).FirstOrDefaultAsync();
            if (agent == null)
            {
                return NotFound(new { message = "Agent not found" });
            }
            return Ok(agent);
        }

        [HttpGet("agents/user/{userId}")]
        public async Task<IActionResult> GetAgentByUserId(string userId)
        {
            var agent = await _context.Agents.Find(a => a.UserId == userId).FirstOrDefaultAsync();
            if (agent == null)
            {
                return NotFound(new { message = "Agent not found" });
            }
            return Ok(agent);
        }

        [HttpPost("agents")]
        [Authorize]
        public async Task<IActionResult> CreateAgent([FromBody] Agent agent)
        {
            agent.Id = null;
            agent.CreatedAt = DateTime.UtcNow;
            await _context.Agents.InsertOneAsync(agent);
            return Ok(new { message = "Agent created successfully", agent });
        }

        [HttpPut("agents/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAgent(string id, [FromBody] Agent agent)
        {
            agent.Id = id;
            var result = await _context.Agents.ReplaceOneAsync(a => a.Id == id, agent);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Agent not found" });
            }
            return Ok(new { message = "Agent updated successfully" });
        }

        [HttpDelete("agents/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAgent(string id)
        {
            var result = await _context.Agents.DeleteOneAsync(a => a.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Agent not found" });
            }
            return Ok(new { message = "Agent deleted successfully" });
        }

        [HttpPut("ads/{id}/views")]
        public async Task<IActionResult> IncrementAdViews(string id)
        {
            var updateDef = Builders<Advertisement>.Update.Inc(a => a.Views, 1);
            var result = await _context.Advertisements.UpdateOneAsync(a => a.Id == id, updateDef);
            if (result.MatchedCount == 0)
            {
                return NotFound(new { message = "Advertisement not found" });
            }
            return Ok(new { message = "Views incremented successfully" });
        }

        [HttpGet("states")]
        public async Task<IActionResult> GetStates()
        {
            var states = await _context.States.Find(s => s.IsActive).SortBy(s => s.DisplaySequence).ToListAsync();
            return Ok(states);
        }

        [HttpGet("cities")]
        public async Task<IActionResult> GetCities([FromQuery] string? stateCode = null)
        {
            var filter = stateCode != null 
                ? Builders<City>.Filter.And(
                    Builders<City>.Filter.Eq(c => c.StateCode, stateCode),
                    Builders<City>.Filter.Eq(c => c.IsActive, true))
                : Builders<City>.Filter.Eq(c => c.IsActive, true);
            
            var cities = await _context.Cities.Find(filter).SortBy(c => c.DisplaySequence).ToListAsync();
            return Ok(cities);
        }

        [HttpGet("conditions")]
        public async Task<IActionResult> GetAdConditions()
        {
            var conditions = await _context.AdConditions.Find(c => c.IsActive).SortBy(c => c.DisplaySequence).ToListAsync();
            return Ok(conditions);
        }
    }

    public class StatusUpdate
    {
        public string Status { get; set; } = string.Empty;
    }
}
