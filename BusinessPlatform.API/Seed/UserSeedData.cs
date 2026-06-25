using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using MongoDB.Driver;
using System.Security.Cryptography;
using System.Text;

namespace BusinessPlatform.API.Seed
{
    public class UserSeedData
    {
        private readonly MongoDbContext _context;

        public UserSeedData(MongoDbContext context)
        {
            _context = context;
        }

        private string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        public async Task SeedAsync()
        {
            await _context.Users.DeleteManyAsync(_ => true);

            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@businessplatform.com",
                Password = HashPassword("admin123"),
                FullName = "System Administrator",
                Phone = "+1-555-0100",
                Role = "Admin",
                IsActive = true
            };
            await _context.Users.InsertOneAsync(adminUser);

            var user1 = new User
            {
                Username = "johnsmith",
                Email = "john@example.com",
                Password = HashPassword("password123"),
                FullName = "John Smith",
                Phone = "+1-555-0101",
                Role = "User",
                IsActive = true
            };
            await _context.Users.InsertOneAsync(user1);

            var user2 = new User
            {
                Username = "janedoe",
                Email = "jane@example.com",
                Password = HashPassword("password123"),
                FullName = "Jane Doe",
                Phone = "+1-555-0102",
                Role = "User",
                IsActive = true
            };
            await _context.Users.InsertOneAsync(user2);

            var recruiterUser = new User
            {
                Username = "recruiter",
                Email = "recruiter@example.com",
                Password = HashPassword("password123"),
                FullName = "Recruiter Agent",
                Phone = "+1-555-0103",
                Role = "Recruiter",
                IsActive = true
            };
            await _context.Users.InsertOneAsync(recruiterUser);

            var advertiserUser = new User
            {
                Username = "advertiser",
                Email = "advertiser@example.com",
                Password = HashPassword("password123"),
                FullName = "Advertising Agent",
                Phone = "+1-555-0104",
                Role = "Advertiser",
                IsActive = true
            };
            await _context.Users.InsertOneAsync(advertiserUser);

            var bookingAgentUser = new User
            {
                Username = "bookingagent",
                Email = "booking@example.com",
                Password = HashPassword("password123"),
                FullName = "Booking Agent",
                Phone = "+1-555-0105",
                Role = "BookingAgent",
                IsActive = true
            };
            await _context.Users.InsertOneAsync(bookingAgentUser);
        }
    }
}
