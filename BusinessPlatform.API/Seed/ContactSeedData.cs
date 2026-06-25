using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using MongoDB.Driver;

namespace BusinessPlatform.API.Seed
{
    public class ContactSeedData
    {
        private readonly MongoDbContext _context;

        public ContactSeedData(MongoDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            await _context.Contacts.DeleteManyAsync(_ => true);

            var contacts = new[]
            {
                new Contact
                {
                    Email = "support@oneapp.com",
                    Phone = "+91 9876543210",
                    Address = "123 Business Park, Tech City, Karnataka, India - 560001",
                    SupportHours = "24/7",
                    WhatsApp = "+91 9876543210",
                    Facebook = "https://facebook.com/oneapp",
                    Twitter = "https://twitter.com/oneapp",
                    Instagram = "https://instagram.com/oneapp",
                    LinkedIn = "https://linkedin.com/company/oneapp",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            await _context.Contacts.InsertManyAsync(contacts);
        }
    }
}
