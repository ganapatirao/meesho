using BusinessPlatform.API.Models;
using BusinessPlatform.API.Services;
using MongoDB.Driver;
using System.Linq;

namespace BusinessPlatform.API.Seed
{
    public class ValidationSeedData
    {
        public static List<ValidationSetting> GetCheckoutValidationSettings()
        {
            return new[]
            {
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "name",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 2,
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Name is required",
                        MinLength = "Name must be at least 2 characters",
                        MaxLength = "Name must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "phone",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = "^\\+?[\\d\\s-]{10,}$",
                        MaxLength = 15
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Phone number is required",
                        Pattern = "Phone number must be at least 10 digits",
                        MaxLength = "Phone number must not exceed 15 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "email",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Email is required",
                        Pattern = "Invalid email address",
                        MaxLength = "Email must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "address",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 10,
                        MaxLength = 500
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Address is required",
                        MinLength = "Address must be at least 10 characters",
                        MaxLength = "Address must not exceed 500 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "city",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 50
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "City is required",
                        MaxLength = "City must not exceed 50 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "pincode",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = "^\\d{6}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Pincode is required",
                        Pattern = "Pincode must be exactly 6 digits"
                    }
                }
            }.ToList();
        }

        public static List<ValidationSetting> GetAdvertisementValidationSettings()
        {
            return new[]
            {
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "title",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Title is required",
                        MaxLength = "Title must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "description",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 2000
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Description is required",
                        MaxLength = "Description must not exceed 2000 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "price",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinValue = 0.01m,
                        MaxValue = 99999999m
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Price is required",
                        MinValue = "Price must be greater than 0",
                        MaxValue = "Price must not exceed 99999999"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "categoryName",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 50
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Category name is required",
                        MaxLength = "Category name must not exceed 50 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "subcategory",
                    ValidationRules = new ValidationRules
                    {
                        MaxLength = 50
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        MaxLength = "Subcategory must not exceed 50 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "location",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Location is required",
                        MaxLength = "Location must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "city",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 50
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "City is required",
                        MaxLength = "City must not exceed 50 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "condition",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 50
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Condition is required",
                        MaxLength = "Condition must not exceed 50 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "sellerName",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Seller name is required",
                        MaxLength = "Seller name must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "sellerPhone",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 15,
                        RegexPattern = "^\\+?[\\d\\s-]{10,}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Seller phone is required",
                        MaxLength = "Phone number must not exceed 15 characters",
                        Pattern = "Phone number must be at least 10 digits"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "sellerEmail",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 100,
                        RegexPattern = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Seller email is required",
                        MaxLength = "Email must not exceed 100 characters",
                        Pattern = "Invalid email address"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "imageUrl",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Image URL is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "status",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        AllowedValues = new List<string> { "Active", "Inactive", "Pending" }
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Status is required",
                        InvalidValue = "Status must be Active, Inactive, or Pending"
                    }
                }
            }.ToList();
        }

        public static List<ValidationSetting> GetAdCategoryValidationSettings()
        {
            return new[]
            {
                new ValidationSetting
                {
                    EntityType = "AdCategory",
                    FieldName = "name",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 2,
                        MaxLength = 50,
                        RegexPattern = "^[a-zA-Z0-9\\s&-]+$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Category name is required",
                        MinLength = "Category name must be at least 2 characters",
                        MaxLength = "Category name must not exceed 50 characters",
                        Pattern = "Category name can only contain letters, numbers, spaces, ampersands, and hyphens"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "AdCategory",
                    FieldName = "emoji",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 10
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Emoji is required",
                        MaxLength = "Emoji must not exceed 10 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "AdCategory",
                    FieldName = "status",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        AllowedValues = new List<string> { "Active", "Inactive" }
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Status is required",
                        InvalidValue = "Status must be Active or Inactive"
                    }
                }
            }.ToList();
        }

        public static List<ValidationSetting> GetStateValidationSettings()
        {
            return new[]
            {
                new ValidationSetting
                {
                    EntityType = "State",
                    FieldName = "name",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 2,
                        MaxLength = 50,
                        RegexPattern = "^[a-zA-Z\\s]+$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "State name is required",
                        MinLength = "State name must be at least 2 characters",
                        MaxLength = "State name must not exceed 50 characters",
                        Pattern = "State name can only contain letters and spaces"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "State",
                    FieldName = "code",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 2,
                        MaxLength = 10,
                        RegexPattern = "^[A-Z]{2,}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "State code is required",
                        MinLength = "State code must be at least 2 characters",
                        MaxLength = "State code must not exceed 10 characters",
                        Pattern = "State code must be uppercase letters only"
                    }
                }
            }.ToList();
        }

        public static List<ValidationSetting> GetCityValidationSettings()
        {
            return new[]
            {
                new ValidationSetting
                {
                    EntityType = "City",
                    FieldName = "name",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 2,
                        MaxLength = 50,
                        RegexPattern = "^[a-zA-Z\\s]+$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "City name is required",
                        MinLength = "City name must be at least 2 characters",
                        MaxLength = "City name must not exceed 50 characters",
                        Pattern = "City name can only contain letters and spaces"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "City",
                    FieldName = "stateCode",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 10,
                        RegexPattern = "^[A-Z]{2,}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "State code is required",
                        MaxLength = "State code must not exceed 10 characters",
                        Pattern = "State code must be uppercase letters only"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "City",
                    FieldName = "stateName",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 50
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "State name is required",
                        MaxLength = "State name must not exceed 50 characters"
                    }
                }
            }.ToList();
        }

        public static List<ValidationSetting> GetAdConditionValidationSettings()
        {
            return new[]
            {
                new ValidationSetting
                {
                    EntityType = "AdCondition",
                    FieldName = "name",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 2,
                        MaxLength = 50,
                        RegexPattern = "^[a-zA-Z\\s]+$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Condition name is required",
                        MinLength = "Condition name must be at least 2 characters",
                        MaxLength = "Condition name must not exceed 50 characters",
                        Pattern = "Condition name can only contain letters and spaces"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "AdCondition",
                    FieldName = "description",
                    ValidationRules = new ValidationRules
                    {
                        MaxLength = 200
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        MaxLength = "Description must not exceed 200 characters"
                    }
                }
            }.ToList();
        }

        private readonly MongoDbContext _context;

        public ValidationSeedData(MongoDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            await _context.ValidationSettings.DeleteManyAsync(_ => true);

            var productValidationSettings = new[]
            {
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "name",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Name is required",
                        MaxLength = "Name must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "description",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 2000
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Description is required",
                        MaxLength = "Description must not exceed 2000 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "price",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = "^\\d{1,7}$",
                        MinValue = 0.01m,
                        MaxValue = 9999999m
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Price is required",
                        Pattern = "Price must be numeric only and not exceed 7 digits",
                        MinValue = "Price must be greater than 0",
                        MaxValue = "Price must not exceed 9999999"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "stock",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = "^\\d{1,7}$",
                        MinValue = 0m,
                        MaxValue = 9999999m
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Stock is required",
                        Pattern = "Stock must be numeric only and not exceed 7 digits",
                        MinValue = "Stock must be 0 or greater",
                        MaxValue = "Stock must not exceed 9999999"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "seller",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 50,
                        RegexPattern = "^[a-zA-Z\\s\\-']+$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Seller is required",
                        Pattern = "Seller can only contain letters, spaces, hyphens, and apostrophes",
                        MaxLength = "Seller must not exceed 50 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "imageUrl",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Primary image is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "imageUrls",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "At least one secondary image is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "rating",
                    ValidationRules = new ValidationRules
                    {
                        RegexPattern = "^\\d+(\\.\\d{1,2})?$",
                        MinValue = 0m,
                        MaxValue = 5m
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Pattern = "Rating must be numeric",
                        MinValue = "Rating must be 0 or greater",
                        MaxValue = "Rating must not exceed 5"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "pros",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "At least one pro is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "cons",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "At least one con is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "categoryName",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Category is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "status",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        AllowedValues = new List<string> { "Active", "Inactive" }
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Status is required",
                        InvalidValue = "Status must be either Active or Inactive"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Product",
                    FieldName = "displaySequence",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = "^\\d+$",
                        MinValue = 0m,
                        MaxValue = 2147483647m
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Display sequence is required",
                        Pattern = "Display sequence must be numeric only",
                        MinValue = "Display sequence must be 0 or greater",
                        MaxValue = "Display sequence must not exceed maximum integer value"
                    }
                }
            };

            await _context.ValidationSettings.InsertManyAsync(productValidationSettings);

            var advertisementValidationSettings = new[]
            {
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "title",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Title is required",
                        MaxLength = "Title must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "description",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 2000
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Description is required",
                        MaxLength = "Description must not exceed 2000 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "price",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinValue = 0.01m
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Price is required",
                        MinValue = "Price must be greater than 0"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "categoryName",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 50
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Category name is required",
                        MaxLength = "Category name must not exceed 50 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "location",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Location is required",
                        MaxLength = "Location must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "city",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 50
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "City is required",
                        MaxLength = "City must not exceed 50 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "condition",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        AllowedValues = new List<string> { "New", "Like New", "Good", "Fair" }
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Condition is required",
                        InvalidValue = "Condition must be New, Like New, Good, or Fair"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "sellerName",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Seller name is required",
                        MaxLength = "Seller name must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "sellerPhone",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 15,
                        RegexPattern = "^\\+?[\\d\\s-]{10,}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Seller phone is required",
                        MaxLength = "Phone number must not exceed 15 characters",
                        Pattern = "Phone number must be at least 10 digits"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "sellerEmail",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 100,
                        RegexPattern = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Seller email is required",
                        MaxLength = "Email must not exceed 100 characters",
                        Pattern = "Invalid email address"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "imageUrl",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Image URL is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Advertisement",
                    FieldName = "status",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        AllowedValues = new List<string> { "Active", "Inactive", "Pending" }
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Status is required",
                        InvalidValue = "Status must be Active, Inactive, or Pending"
                    }
                }
            };

            await _context.ValidationSettings.InsertManyAsync(advertisementValidationSettings);

            var jobValidationSettings = new[]
            {
                new ValidationSetting
                {
                    EntityType = "Job",
                    FieldName = "title",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 5,
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Job title is required",
                        MinLength = "Job title must be at least 5 characters",
                        MaxLength = "Job title must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Job",
                    FieldName = "company",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 2,
                        MaxLength = 100
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Company name is required",
                        MinLength = "Company name must be at least 2 characters",
                        MaxLength = "Company name must not exceed 100 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Job",
                    FieldName = "location",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 50
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Location is required",
                        MaxLength = "Location must not exceed 50 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Job",
                    FieldName = "salary",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 30
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Salary range is required",
                        MaxLength = "Salary range must not exceed 30 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Job",
                    FieldName = "type",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 30
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Job type is required",
                        MaxLength = "Job type must not exceed 30 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Job",
                    FieldName = "description",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 50,
                        MaxLength = 5000
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Job description is required",
                        MinLength = "Description must be at least 50 characters",
                        MaxLength = "Description must not exceed 5000 characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Job",
                    FieldName = "skills",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 1
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Skills are required",
                        MinLength = "At least one skill is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Job",
                    FieldName = "status",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MaxLength = 20
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Status is required",
                        MaxLength = "Status must not exceed 20 characters"
                    }
                }
            };

            await _context.ValidationSettings.InsertManyAsync(jobValidationSettings);

            var transportValidationSettings = new[]
            {
                new ValidationSetting
                {
                    EntityType = "Transport",
                    FieldName = "type",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Transport type is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Transport",
                    FieldName = "name",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Transport name is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Transport",
                    FieldName = "source",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Source is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Transport",
                    FieldName = "destination",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Destination is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Transport",
                    FieldName = "price",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinValue = 0.01m
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Price is required",
                        MinValue = "Price must be greater than 0"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Transport",
                    FieldName = "status",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Status is required"
                    }
                }
            };

            await _context.ValidationSettings.InsertManyAsync(transportValidationSettings);

            var packageValidationSettings = new[]
            {
                new ValidationSetting
                {
                    EntityType = "TravelPackage",
                    FieldName = "name",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Package name is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "TravelPackage",
                    FieldName = "description",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Description is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "TravelPackage",
                    FieldName = "duration",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Duration is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "TravelPackage",
                    FieldName = "price",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinValue = 0.01m
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Price is required",
                        MinValue = "Price must be greater than 0"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "TravelPackage",
                    FieldName = "imageUrl",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Image URL is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "TravelPackage",
                    FieldName = "status",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Status is required"
                    }
                }
            };

            await _context.ValidationSettings.InsertManyAsync(packageValidationSettings);

            var movieValidationSettings = new[]
            {
                new ValidationSetting
                {
                    EntityType = "Movie",
                    FieldName = "title",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Movie title is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Movie",
                    FieldName = "genre",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Genre is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Movie",
                    FieldName = "language",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Language is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Movie",
                    FieldName = "duration",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinValue = 1m
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Duration is required",
                        MinValue = "Duration must be at least 1 minute"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Movie",
                    FieldName = "rating",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinValue = 0m,
                        MaxValue = 10m
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Rating is required",
                        MinValue = "Rating must be 0 or greater",
                        MaxValue = "Rating must not exceed 10"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Movie",
                    FieldName = "imageUrl",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Image URL is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "Movie",
                    FieldName = "status",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Status is required"
                    }
                }
            };

            await _context.ValidationSettings.InsertManyAsync(movieValidationSettings);
        }
    }
}
