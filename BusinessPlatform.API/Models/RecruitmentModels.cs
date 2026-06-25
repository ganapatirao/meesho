using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace BusinessPlatform.API.Models
{
    public class Job
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("title")]
        [Required(ErrorMessage = "Job title is required")]
        [StringLength(100, MinimumLength = 5, ErrorMessage = "Job title must be between 5 and 100 characters")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("company")]
        [Required(ErrorMessage = "Company name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Company name must be between 2 and 100 characters")]
        public string Company { get; set; } = string.Empty;

        [BsonElement("location")]
        [Required(ErrorMessage = "Location is required")]
        [StringLength(50, ErrorMessage = "Location must not exceed 50 characters")]
        public string Location { get; set; } = string.Empty;

        [BsonElement("salary")]
        [Required(ErrorMessage = "Salary range is required")]
        [StringLength(30, ErrorMessage = "Salary range must not exceed 30 characters")]
        public string Salary { get; set; } = string.Empty;

        [BsonElement("type")]
        [Required(ErrorMessage = "Job type is required")]
        [StringLength(30, ErrorMessage = "Job type must not exceed 30 characters")]
        public string Type { get; set; } = string.Empty;

        [BsonElement("experience")]
        [StringLength(30, ErrorMessage = "Experience must not exceed 30 characters")]
        public string Experience { get; set; } = string.Empty;

        [BsonElement("description")]
        [Required(ErrorMessage = "Job description is required")]
        [StringLength(5000, MinimumLength = 50, ErrorMessage = "Description must be between 50 and 5000 characters")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("requirements")]
        [StringLength(2000, ErrorMessage = "Requirements must not exceed 2000 characters")]
        public string Requirements { get; set; } = string.Empty;

        [BsonElement("skills")]
        [Required(ErrorMessage = "Skills are required")]
        [MinLength(1, ErrorMessage = "At least one skill is required")]
        public List<string> Skills { get; set; } = new List<string>();

        [BsonElement("status")]
        [StringLength(20, ErrorMessage = "Status must not exceed 20 characters")]
        public string Status { get; set; } = "Active";

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class JobApplication
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("jobId")]
        public string? JobId { get; set; }

        [BsonElement("jobTitle")]
        public string JobTitle { get; set; } = string.Empty;

        [BsonElement("applicantId")]
        public string? ApplicantId { get; set; }

        [BsonElement("applicantName")]
        public string ApplicantName { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("phone")]
        public string Phone { get; set; } = string.Empty;

        [BsonElement("resume")]
        public string Resume { get; set; } = string.Empty;

        [BsonElement("coverLetter")]
        public string CoverLetter { get; set; } = string.Empty;

        [BsonElement("status")]
        public string Status { get; set; } = "Pending";

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Candidate
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("phone")]
        public string Phone { get; set; } = string.Empty;

        [BsonElement("experience")]
        public string Experience { get; set; } = string.Empty;

        [BsonElement("skills")]
        public List<string> Skills { get; set; } = new List<string>();

        [BsonElement("resume")]
        public string Resume { get; set; } = string.Empty;

        [BsonElement("status")]
        public string Status { get; set; } = "Active";

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
