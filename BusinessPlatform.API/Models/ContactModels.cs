using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace BusinessPlatform.API.Models
{
    public class Contact
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("email")]
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [BsonElement("phone")]
        [Required]
        [Phone]
        public string Phone { get; set; } = string.Empty;

        [BsonElement("address")]
        public string Address { get; set; } = string.Empty;

        [BsonElement("supportHours")]
        public string SupportHours { get; set; } = "24/7";

        [BsonElement("whatsapp")]
        public string WhatsApp { get; set; } = string.Empty;

        [BsonElement("facebook")]
        public string Facebook { get; set; } = string.Empty;

        [BsonElement("twitter")]
        public string Twitter { get; set; } = string.Empty;

        [BsonElement("instagram")]
        public string Instagram { get; set; } = string.Empty;

        [BsonElement("linkedin")]
        public string LinkedIn { get; set; } = string.Empty;

        [BsonElement("status")]
        public string Status { get; set; } = "Active";

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
