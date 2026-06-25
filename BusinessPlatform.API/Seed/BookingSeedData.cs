using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using MongoDB.Driver;

namespace BusinessPlatform.API.Seed
{
    public class BookingSeedData
    {
        private readonly MongoDbContext _context;

        public BookingSeedData(MongoDbContext context)
        {
            _context = context;
        }

        private string GenerateSvgDataUrl(string color, string text = "")
        {
            var svg = $"<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='{color}'/><text x='200' y='150' font-family='Arial' font-size='24' fill='white' text-anchor='middle'>{text}</text></svg>";
            var bytes = System.Text.Encoding.UTF8.GetBytes(svg);
            var base64 = Convert.ToBase64String(bytes);
            return $"data:image/svg+xml;base64,{base64}";
        }

        public async Task SeedAsync()
        {
            await _context.Transports.DeleteManyAsync(_ => true);
            await _context.TravelPackages.DeleteManyAsync(_ => true);
            await _context.Movies.DeleteManyAsync(_ => true);
            await _context.MovieShowtimes.DeleteManyAsync(_ => true);
            await _context.Bookings.DeleteManyAsync(_ => true);

            // Get users for booking references
            var users = await _context.Users.Find(_ => true).ToListAsync();
            var user1 = users.FirstOrDefault(u => u.Username == "johnsmith");
            var user2 = users.FirstOrDefault(u => u.Username == "janedoe");
            var user3 = users.FirstOrDefault(u => u.Username == "bobwilson");

            // Seed Transports
            var transports = new[]
            {
                new Transport { Type = "Train", Name = "Express Rail 202", Source = "New York", Destination = "Washington DC", Price = 89.99m, Duration = "3h 30m", Operator = "Amtrak" },
                new Transport { Type = "Bus", Name = "Luxury Coach Express", Source = "Boston", Destination = "New York", Price = 45.99m, Duration = "4h 15m", Operator = "Greyhound" },
                new Transport { Type = "Car", Name = "Premium Sedan Service", Source = "Los Angeles", Destination = "San Diego", Price = 199.99m, Duration = "2h 30m", Operator = "Uber Black" },
                new Transport { Type = "Bike", Name = "Motorcycle Tour", Source = "San Francisco", Destination = "Monterey", Price = 79.99m, Duration = "2h 45m", Operator = "Harley Tours" }
            };
            await _context.Transports.InsertManyAsync(transports);

            // Seed Travel Packages
            var packages = new[]
            {
                new TravelPackage { Name = "European Adventure", Description = "Experience the best of Europe with visits to Paris, Rome, and Barcelona.", Duration = "10 days", Price = 2999.99m, Destinations = new List<string> { "Paris", "Rome", "Barcelona" }, ImageUrl = GenerateSvgDataUrl("#3B82F6", "Europe") },
                new TravelPackage { Name = "Tropical Paradise Getaway", Description = "Relax in the beautiful Maldives with pristine beaches and luxury resorts.", Duration = "7 days", Price = 4499.99m, Destinations = new List<string> { "Maldives" }, ImageUrl = GenerateSvgDataUrl("#06B6D4", "Maldives") },
                new TravelPackage { Name = "Asian Cultural Experience", Description = "Discover the rich culture of Japan with visits to Tokyo, Kyoto, and Osaka.", Duration = "14 days", Price = 3499.99m, Destinations = new List<string> { "Tokyo", "Kyoto", "Osaka" }, ImageUrl = GenerateSvgDataUrl("#EF4444", "Japan") }
            };
            await _context.TravelPackages.InsertManyAsync(packages);

            // Seed Movies
            var movies = new[]
            {
                new Movie { Title = "The Quantum Paradox", Genre = "Sci-Fi", Language = "English", Duration = 148, Rating = 8.5, ImageUrl = GenerateSvgDataUrl("#8B5CF6", "Sci-Fi") },
                new Movie { Title = "Midnight in Paris", Genre = "Romance", Language = "French", Duration = 124, Rating = 7.8, ImageUrl = GenerateSvgDataUrl("#EC4899", "Romance") },
                new Movie { Title = "The Last Samurai Returns", Genre = "Action", Language = "Japanese", Duration = 156, Rating = 9.1, ImageUrl = GenerateSvgDataUrl("#EF4444", "Action") },
                new Movie { Title = "Comedy Night", Genre = "Comedy", Language = "English", Duration = 112, Rating = 7.2, ImageUrl = GenerateSvgDataUrl("#F59E0B", "Comedy") }
            };
            await _context.Movies.InsertManyAsync(movies);

            // Seed Movie Showtimes
            var showtimes = new[]
            {
                new MovieShowtime { MovieId = movies[0].Id, MovieTitle = movies[0].Title, Theater = "Cineplex Downtown", ShowDate = DateTime.Today.AddDays(1), ShowTime = "14:00", ScreenType = "IMAX", Price = 15.99m },
                new MovieShowtime { MovieId = movies[0].Id, MovieTitle = movies[0].Title, Theater = "Cineplex Downtown", ShowDate = DateTime.Today.AddDays(1), ShowTime = "18:00", ScreenType = "Standard", Price = 12.99m },
                new MovieShowtime { MovieId = movies[1].Id, MovieTitle = movies[1].Title, Theater = "Metro Cinema", ShowDate = DateTime.Today.AddDays(1), ShowTime = "16:00", ScreenType = "Standard", Price = 11.99m },
                new MovieShowtime { MovieId = movies[2].Id, MovieTitle = movies[2].Title, Theater = "Grand Theater", ShowDate = DateTime.Today.AddDays(1), ShowTime = "20:00", ScreenType = "IMAX", Price = 16.99m },
                new MovieShowtime { MovieId = movies[3].Id, MovieTitle = movies[3].Title, Theater = "Cineplex Downtown", ShowDate = DateTime.Today.AddDays(1), ShowTime = "19:00", ScreenType = "Standard", Price = 10.99m }
            };
            await _context.MovieShowtimes.InsertManyAsync(showtimes);

            // Seed Bookings
            var bookings = new[]
            {
                new Booking { UserId = user1?.Id, UserName = user1?.FullName, Type = "Transport", ItemId = transports[0].Id, ItemName = transports[0].Name, Quantity = 2, TotalPrice = 179.98m, BookingDate = DateTime.Today.AddDays(5), Status = "Confirmed" },
                new Booking { UserId = user2?.Id, UserName = user2?.FullName, Type = "Package", ItemId = packages[0].Id, ItemName = packages[0].Name, Quantity = 2, TotalPrice = 5999.98m, BookingDate = DateTime.Today.AddDays(30), Status = "Confirmed" },
                new Booking { UserId = user3?.Id, UserName = user3?.FullName, Type = "Movie", ItemId = showtimes[0].Id, ItemName = showtimes[0].MovieTitle, Quantity = 3, TotalPrice = 47.97m, BookingDate = DateTime.Today.AddDays(1), Status = "Completed" }
            };
            await _context.Bookings.InsertManyAsync(bookings);
        }
    }
}
