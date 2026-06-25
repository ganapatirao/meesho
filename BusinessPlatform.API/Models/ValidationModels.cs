using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BusinessPlatform.API.Models
{
    public class ValidationSetting
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("entityType")]
        public string EntityType { get; set; } = string.Empty;

        [BsonElement("fieldName")]
        public string FieldName { get; set; } = string.Empty;

        [BsonElement("validationRules")]
        public ValidationRules ValidationRules { get; set; } = new();

        [BsonElement("errorMessages")]
        public ErrorMessages ErrorMessages { get; set; } = new();

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ValidationRules
    {
        public bool Required { get; set; }
        public int? MinLength { get; set; }
        public int? MaxLength { get; set; }
        public string? RegexPattern { get; set; }
        public decimal? MinValue { get; set; }
        public decimal? MaxValue { get; set; }
        public List<string>? AllowedValues { get; set; }
    }

    public class ErrorMessages
    {
        public string? Required { get; set; }
        public string? MinLength { get; set; }
        public string? Pattern { get; set; }
        public string? MaxLength { get; set; }
        public string? MinValue { get; set; }
        public string? MaxValue { get; set; }
        public string? InvalidValue { get; set; }
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}
