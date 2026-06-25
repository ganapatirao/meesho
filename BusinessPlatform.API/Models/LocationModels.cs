using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BusinessPlatform.API.Models
{
    public class State
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        [Required(ErrorMessage = "State name is required")]
        [StringLength(50, ErrorMessage = "State name must be less than 50 characters")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("code")]
        [Required(ErrorMessage = "State code is required")]
        [StringLength(10, ErrorMessage = "State code must be less than 10 characters")]
        public string Code { get; set; } = string.Empty;

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("displaySequence")]
        public int DisplaySequence { get; set; } = 0;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class City
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        [Required(ErrorMessage = "City name is required")]
        [StringLength(50, ErrorMessage = "City name must be less than 50 characters")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("stateCode")]
        [Required(ErrorMessage = "State code is required")]
        [StringLength(10, ErrorMessage = "State code must be less than 10 characters")]
        public string StateCode { get; set; } = string.Empty;

        [BsonElement("stateName")]
        [Required(ErrorMessage = "State name is required")]
        [StringLength(50, ErrorMessage = "State name must be less than 50 characters")]
        public string StateName { get; set; } = string.Empty;

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("displaySequence")]
        public int DisplaySequence { get; set; } = 0;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AdCondition
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        [Required(ErrorMessage = "Condition name is required")]
        [StringLength(50, ErrorMessage = "Condition name must be less than 50 characters")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("description")]
        [StringLength(200, ErrorMessage = "Description must be less than 200 characters")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("displaySequence")]
        public int DisplaySequence { get; set; } = 0;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
