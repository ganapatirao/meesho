using BusinessPlatform.API.Seed;
using BusinessPlatform.API.Services;
using MongoDB.Driver;

namespace BusinessPlatform.API
{
    public class SeedData
    {
        private readonly MongoDbContext _context;

        public SeedData(MongoDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            // Seed data in order of dependencies
            var userSeed = new UserSeedData(_context);
            await userSeed.SeedAsync();

            var locationSeed = new LocationSeedData(_context);
            await locationSeed.SeedAsync();

            var shoppingSeed = new ShoppingSeedData(_context);
            await shoppingSeed.SeedAsync();

            var advertisingSeed = new AdvertisingSeedData(_context);
            await advertisingSeed.SeedAsync();

            var recruitmentSeed = new RecruitmentSeedData(_context);
            await recruitmentSeed.SeedAsync();

            var bookingSeed = new BookingSeedData(_context);
            await bookingSeed.SeedAsync();

            var validationSeed = new ValidationSeedData(_context);
            await validationSeed.SeedAsync();

            var contactSeed = new ContactSeedData(_context);
            await contactSeed.SeedAsync();
        }
    }
}
