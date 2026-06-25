using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using MongoDB.Driver;

namespace BusinessPlatform.API.Seed
{
    public class LocationSeedData
    {
        private readonly MongoDbContext _context;

        public LocationSeedData(MongoDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            await _context.States.DeleteManyAsync(_ => true);
            await _context.Cities.DeleteManyAsync(_ => true);
            await _context.AdConditions.DeleteManyAsync(_ => true);

            // Seed States (India)
            var states = new[]
            {
                new State { Name = "Andhra Pradesh", Code = "AP", DisplaySequence = 1 },
                new State { Name = "Arunachal Pradesh", Code = "AR", DisplaySequence = 2 },
                new State { Name = "Assam", Code = "AS", DisplaySequence = 3 },
                new State { Name = "Bihar", Code = "BR", DisplaySequence = 4 },
                new State { Name = "Chhattisgarh", Code = "CG", DisplaySequence = 5 },
                new State { Name = "Delhi", Code = "DL", DisplaySequence = 6 },
                new State { Name = "Goa", Code = "GA", DisplaySequence = 7 },
                new State { Name = "Gujarat", Code = "GJ", DisplaySequence = 8 },
                new State { Name = "Haryana", Code = "HR", DisplaySequence = 9 },
                new State { Name = "Himachal Pradesh", Code = "HP", DisplaySequence = 10 },
                new State { Name = "Jharkhand", Code = "JH", DisplaySequence = 11 },
                new State { Name = "Karnataka", Code = "KA", DisplaySequence = 12 },
                new State { Name = "Kerala", Code = "KL", DisplaySequence = 13 },
                new State { Name = "Madhya Pradesh", Code = "MP", DisplaySequence = 14 },
                new State { Name = "Maharashtra", Code = "MH", DisplaySequence = 15 },
                new State { Name = "Manipur", Code = "MN", DisplaySequence = 16 },
                new State { Name = "Meghalaya", Code = "ML", DisplaySequence = 17 },
                new State { Name = "Mizoram", Code = "MZ", DisplaySequence = 18 },
                new State { Name = "Nagaland", Code = "NL", DisplaySequence = 19 },
                new State { Name = "Odisha", Code = "OD", DisplaySequence = 20 },
                new State { Name = "Punjab", Code = "PB", DisplaySequence = 21 },
                new State { Name = "Rajasthan", Code = "RJ", DisplaySequence = 22 },
                new State { Name = "Sikkim", Code = "SK", DisplaySequence = 23 },
                new State { Name = "Tamil Nadu", Code = "TN", DisplaySequence = 24 },
                new State { Name = "Telangana", Code = "TG", DisplaySequence = 25 },
                new State { Name = "Tripura", Code = "TR", DisplaySequence = 26 },
                new State { Name = "Uttar Pradesh", Code = "UP", DisplaySequence = 27 },
                new State { Name = "Uttarakhand", Code = "UK", DisplaySequence = 28 },
                new State { Name = "West Bengal", Code = "WB", DisplaySequence = 29 }
            };
            await _context.States.InsertManyAsync(states);

            // Seed Cities (Major cities for each state)
            var cities = new[]
            {
                // Andhra Pradesh
                new City { Name = "Visakhapatnam", StateCode = "AP", StateName = "Andhra Pradesh", DisplaySequence = 1 },
                new City { Name = "Vijayawada", StateCode = "AP", StateName = "Andhra Pradesh", DisplaySequence = 2 },
                new City { Name = "Guntur", StateCode = "AP", StateName = "Andhra Pradesh", DisplaySequence = 3 },
                new City { Name = "Tirupati", StateCode = "AP", StateName = "Andhra Pradesh", DisplaySequence = 4 },
                new City { Name = "Kakinada", StateCode = "AP", StateName = "Andhra Pradesh", DisplaySequence = 5 },
                // Delhi
                new City { Name = "New Delhi", StateCode = "DL", StateName = "Delhi", DisplaySequence = 1 },
                new City { Name = "Delhi", StateCode = "DL", StateName = "Delhi", DisplaySequence = 2 },
                new City { Name = "Noida", StateCode = "DL", StateName = "Delhi", DisplaySequence = 3 },
                new City { Name = "Gurgaon", StateCode = "DL", StateName = "Delhi", DisplaySequence = 4 },
                new City { Name = "Faridabad", StateCode = "DL", StateName = "Delhi", DisplaySequence = 5 },
                // Gujarat
                new City { Name = "Ahmedabad", StateCode = "GJ", StateName = "Gujarat", DisplaySequence = 1 },
                new City { Name = "Surat", StateCode = "GJ", StateName = "Gujarat", DisplaySequence = 2 },
                new City { Name = "Vadodara", StateCode = "GJ", StateName = "Gujarat", DisplaySequence = 3 },
                new City { Name = "Rajkot", StateCode = "GJ", StateName = "Gujarat", DisplaySequence = 4 },
                new City { Name = "Bhavnagar", StateCode = "GJ", StateName = "Gujarat", DisplaySequence = 5 },
                // Karnataka
                new City { Name = "Bangalore", StateCode = "KA", StateName = "Karnataka", DisplaySequence = 1 },
                new City { Name = "Mysore", StateCode = "KA", StateName = "Karnataka", DisplaySequence = 2 },
                new City { Name = "Hubli", StateCode = "KA", StateName = "Karnataka", DisplaySequence = 3 },
                new City { Name = "Mangalore", StateCode = "KA", StateName = "Karnataka", DisplaySequence = 4 },
                new City { Name = "Belgaum", StateCode = "KA", StateName = "Karnataka", DisplaySequence = 5 },
                // Maharashtra
                new City { Name = "Mumbai", StateCode = "MH", StateName = "Maharashtra", DisplaySequence = 1 },
                new City { Name = "Pune", StateCode = "MH", StateName = "Maharashtra", DisplaySequence = 2 },
                new City { Name = "Nagpur", StateCode = "MH", StateName = "Maharashtra", DisplaySequence = 3 },
                new City { Name = "Thane", StateCode = "MH", StateName = "Maharashtra", DisplaySequence = 4 },
                new City { Name = "Nashik", StateCode = "MH", StateName = "Maharashtra", DisplaySequence = 5 },
                // Tamil Nadu
                new City { Name = "Chennai", StateCode = "TN", StateName = "Tamil Nadu", DisplaySequence = 1 },
                new City { Name = "Coimbatore", StateCode = "TN", StateName = "Tamil Nadu", DisplaySequence = 2 },
                new City { Name = "Madurai", StateCode = "TN", StateName = "Tamil Nadu", DisplaySequence = 3 },
                new City { Name = "Tiruchirappalli", StateCode = "TN", StateName = "Tamil Nadu", DisplaySequence = 4 },
                new City { Name = "Salem", StateCode = "TN", StateName = "Tamil Nadu", DisplaySequence = 5 },
                // Telangana
                new City { Name = "Hyderabad", StateCode = "TG", StateName = "Telangana", DisplaySequence = 1 },
                new City { Name = "Warangal", StateCode = "TG", StateName = "Telangana", DisplaySequence = 2 },
                new City { Name = "Nizamabad", StateCode = "TG", StateName = "Telangana", DisplaySequence = 3 },
                new City { Name = "Khammam", StateCode = "TG", StateName = "Telangana", DisplaySequence = 4 },
                new City { Name = "Karimnagar", StateCode = "TG", StateName = "Telangana", DisplaySequence = 5 },
                // Uttar Pradesh
                new City { Name = "Lucknow", StateCode = "UP", StateName = "Uttar Pradesh", DisplaySequence = 1 },
                new City { Name = "Kanpur", StateCode = "UP", StateName = "Uttar Pradesh", DisplaySequence = 2 },
                new City { Name = "Agra", StateCode = "UP", StateName = "Uttar Pradesh", DisplaySequence = 3 },
                new City { Name = "Varanasi", StateCode = "UP", StateName = "Uttar Pradesh", DisplaySequence = 4 },
                new City { Name = "Allahabad", StateCode = "UP", StateName = "Uttar Pradesh", DisplaySequence = 5 },
                // West Bengal
                new City { Name = "Kolkata", StateCode = "WB", StateName = "West Bengal", DisplaySequence = 1 },
                new City { Name = "Howrah", StateCode = "WB", StateName = "West Bengal", DisplaySequence = 2 },
                new City { Name = "Durgapur", StateCode = "WB", StateName = "West Bengal", DisplaySequence = 3 },
                new City { Name = "Asansol", StateCode = "WB", StateName = "West Bengal", DisplaySequence = 4 },
                new City { Name = "Siliguri", StateCode = "WB", StateName = "West Bengal", DisplaySequence = 5 },
                // Rajasthan
                new City { Name = "Jaipur", StateCode = "RJ", StateName = "Rajasthan", DisplaySequence = 1 },
                new City { Name = "Jodhpur", StateCode = "RJ", StateName = "Rajasthan", DisplaySequence = 2 },
                new City { Name = "Udaipur", StateCode = "RJ", StateName = "Rajasthan", DisplaySequence = 3 },
                new City { Name = "Kota", StateCode = "RJ", StateName = "Rajasthan", DisplaySequence = 4 },
                new City { Name = "Ajmer", StateCode = "RJ", StateName = "Rajasthan", DisplaySequence = 5 },
                // Punjab
                new City { Name = "Chandigarh", StateCode = "PB", StateName = "Punjab", DisplaySequence = 1 },
                new City { Name = "Amritsar", StateCode = "PB", StateName = "Punjab", DisplaySequence = 2 },
                new City { Name = "Ludhiana", StateCode = "PB", StateName = "Punjab", DisplaySequence = 3 },
                new City { Name = "Jalandhar", StateCode = "PB", StateName = "Punjab", DisplaySequence = 4 },
                new City { Name = "Patiala", StateCode = "PB", StateName = "Punjab", DisplaySequence = 5 },
                // Kerala
                new City { Name = "Thiruvananthapuram", StateCode = "KL", StateName = "Kerala", DisplaySequence = 1 },
                new City { Name = "Kochi", StateCode = "KL", StateName = "Kerala", DisplaySequence = 2 },
                new City { Name = "Kozhikode", StateCode = "KL", StateName = "Kerala", DisplaySequence = 3 },
                new City { Name = "Thrissur", StateCode = "KL", StateName = "Kerala", DisplaySequence = 4 },
                new City { Name = "Kollam", StateCode = "KL", StateName = "Kerala", DisplaySequence = 5 },
                // Haryana
                new City { Name = "Gurgaon", StateCode = "HR", StateName = "Haryana", DisplaySequence = 1 },
                new City { Name = "Faridabad", StateCode = "HR", StateName = "Haryana", DisplaySequence = 2 },
                new City { Name = "Panipat", StateCode = "HR", StateName = "Haryana", DisplaySequence = 3 },
                new City { Name = "Ambala", StateCode = "HR", StateName = "Haryana", DisplaySequence = 4 },
                new City { Name = "Karnal", StateCode = "HR", StateName = "Haryana", DisplaySequence = 5 },
                // Madhya Pradesh
                new City { Name = "Bhopal", StateCode = "MP", StateName = "Madhya Pradesh", DisplaySequence = 1 },
                new City { Name = "Indore", StateCode = "MP", StateName = "Madhya Pradesh", DisplaySequence = 2 },
                new City { Name = "Jabalpur", StateCode = "MP", StateName = "Madhya Pradesh", DisplaySequence = 3 },
                new City { Name = "Gwalior", StateCode = "MP", StateName = "Madhya Pradesh", DisplaySequence = 4 },
                new City { Name = "Ujjain", StateCode = "MP", StateName = "Madhya Pradesh", DisplaySequence = 5 },
                // Odisha
                new City { Name = "Bhubaneswar", StateCode = "OD", StateName = "Odisha", DisplaySequence = 1 },
                new City { Name = "Cuttack", StateCode = "OD", StateName = "Odisha", DisplaySequence = 2 },
                new City { Name = "Rourkela", StateCode = "OD", StateName = "Odisha", DisplaySequence = 3 },
                new City { Name = "Berhampur", StateCode = "OD", StateName = "Odisha", DisplaySequence = 4 },
                new City { Name = "Sambalpur", StateCode = "OD", StateName = "Odisha", DisplaySequence = 5 }
            };
            await _context.Cities.InsertManyAsync(cities);

            // Seed Ad Conditions
            var adConditions = new[]
            {
                new AdCondition { Name = "New", Description = "Brand new, never used", DisplaySequence = 1 },
                new AdCondition { Name = "Like New", Description = "Used once or twice, in excellent condition", DisplaySequence = 2 },
                new AdCondition { Name = "Good", Description = "Used but in good working condition", DisplaySequence = 3 },
                new AdCondition { Name = "Fair", Description = "Used with visible wear and tear", DisplaySequence = 4 },
                new AdCondition { Name = "Poor", Description = "Heavily used, may need repairs", DisplaySequence = 5 }
            };
            await _context.AdConditions.InsertManyAsync(adConditions);
        }
    }
}
