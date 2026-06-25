using MeeshoClone.API.Models;
using MongoDB.Driver;

namespace MeeshoClone.API.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDB") ?? "mongodb://localhost:27017";
        var client = new MongoClient(connectionString);
        _database = client.GetDatabase("MeeshoClone");
    }

    // User Collections
    public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
    public IMongoCollection<Vendor> Vendors => _database.GetCollection<Vendor>("Vendors");
    
    // Product Collections
    public IMongoCollection<Product> Products => _database.GetCollection<Product>("Products");
    public IMongoCollection<Company> Companies => _database.GetCollection<Company>("Companies");
    public IMongoCollection<Category> Categories => _database.GetCollection<Category>("Categories");
    
    // Order Collections
    public IMongoCollection<Order> Orders => _database.GetCollection<Order>("Orders");
    public IMongoCollection<Cart> Carts => _database.GetCollection<Cart>("Carts");
    
    // Review Collections
    public IMongoCollection<Review> Reviews => _database.GetCollection<Review>("Reviews");
    
    // Configuration Collections
    public IMongoCollection<SiteConfiguration> SiteConfigurations => _database.GetCollection<SiteConfiguration>("SiteConfigurations");
}
