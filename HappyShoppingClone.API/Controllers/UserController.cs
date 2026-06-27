using Microsoft.AspNetCore.Mvc;
using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public UserController(MongoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _context.Users.Find(_ => true).ToListAsync();
                return Ok(new { success = true, users });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }
                return Ok(new { success = true, user });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User user)
        {
            try
            {
                // Check if email already exists
                var existingUserByEmail = await _context.Users.Find(u => u.Email.ToLower() == user.Email.ToLower()).FirstOrDefaultAsync();
                if (existingUserByEmail != null)
                {
                    return BadRequest(new { success = false, error = "A user with this email already exists." });
                }

                // Check if phone number already exists
                if (!string.IsNullOrEmpty(user.PhoneNumber))
                {
                    var existingUserByPhone = await _context.Users.Find(u => u.PhoneNumber == user.PhoneNumber).FirstOrDefaultAsync();
                    if (existingUserByPhone != null)
                    {
                        return BadRequest(new { success = false, error = "A user with this phone number already exists." });
                    }
                }

                user.Id = Guid.NewGuid().ToString();
                user.CreatedAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.Users.InsertOneAsync(user);
                return Ok(new { success = true, user });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] User user)
        {
            try
            {
                var existingUser = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
                if (existingUser == null)
                {
                    return NotFound(new { success = false, error = "User not found" });
                }

                // Check if email already exists for another user
                var existingUserByEmail = await _context.Users.Find(u => u.Email.ToLower() == user.Email.ToLower() && u.Id != id).FirstOrDefaultAsync();
                if (existingUserByEmail != null)
                {
                    return BadRequest(new { success = false, error = "A user with this email already exists." });
                }

                // Check if phone number already exists for another user
                if (!string.IsNullOrEmpty(user.PhoneNumber))
                {
                    var existingUserByPhone = await _context.Users.Find(u => u.PhoneNumber == user.PhoneNumber && u.Id != id).FirstOrDefaultAsync();
                    if (existingUserByPhone != null)
                    {
                        return BadRequest(new { success = false, error = "A user with this phone number already exists." });
                    }
                }

                user.Id = id;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.Users.ReplaceOneAsync(u => u.Id == id, user);
                return Ok(new { success = true, user });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] dynamic request)
        {
            try
            {
                var existingUser = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
                if (existingUser == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                var newRole = request.GetProperty("role").GetString();
                existingUser.Role = newRole;
                existingUser.UpdatedAt = DateTime.UtcNow;
                await _context.Users.ReplaceOneAsync(u => u.Id == id, existingUser);
                return Ok(new { success = true, user = existingUser });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(string id)
        {
            try
            {
                var existingUser = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
                if (existingUser == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                existingUser.IsActive = !existingUser.IsActive;
                existingUser.UpdatedAt = DateTime.UtcNow;
                await _context.Users.ReplaceOneAsync(u => u.Id == id, existingUser);
                return Ok(new { success = true, user = existingUser });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var result = await _context.Users.DeleteOneAsync(u => u.Id == id);
                if (result.DeletedCount == 0)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }
                return Ok(new { success = true, message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
