using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace BusinessPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public ContactController(MongoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetContact()
        {
            var contact = await _context.Contacts.Find(c => c.Status == "Active").FirstOrDefaultAsync();
            if (contact == null)
            {
                return NotFound(new { message = "No contact information found" });
            }
            return Ok(contact);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetContactById(string id)
        {
            var contact = await _context.Contacts.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (contact == null)
            {
                return NotFound(new { message = "Contact not found" });
            }
            return Ok(contact);
        }

        [HttpPost]
        public async Task<IActionResult> CreateContact([FromBody] Contact contact)
        {
            contact.CreatedAt = DateTime.UtcNow;
            contact.UpdatedAt = DateTime.UtcNow;
            contact.Status = "Active";
            
            await _context.Contacts.InsertOneAsync(contact);
            return CreatedAtAction(nameof(GetContactById), new { id = contact.Id }, contact);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContact(string id, [FromBody] Contact contact)
        {
            var existingContact = await _context.Contacts.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (existingContact == null)
            {
                return NotFound(new { message = "Contact not found" });
            }

            contact.UpdatedAt = DateTime.UtcNow;
            contact.Id = id;

            await _context.Contacts.ReplaceOneAsync(c => c.Id == id, contact);
            return Ok(contact);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(string id)
        {
            var result = await _context.Contacts.DeleteOneAsync(c => c.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound(new { message = "Contact not found" });
            }
            return Ok(new { message = "Contact deleted successfully" });
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateContactStatus(string id, [FromBody] ContactStatusUpdateRequest request)
        {
            var result = await _context.Contacts.UpdateOneAsync(
                c => c.Id == id,
                Builders<Contact>.Update.Set(c => c.Status, request.Status)
            );

            if (result.ModifiedCount == 0)
            {
                return NotFound(new { message = "Contact not found" });
            }

            return Ok(new { message = "Contact status updated successfully" });
        }
    }

    public class ContactStatusUpdateRequest
    {
        public string Status { get; set; } = "Active";
    }
}
