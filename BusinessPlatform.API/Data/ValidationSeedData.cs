using BusinessPlatform.API.Models;

namespace BusinessPlatform.API.Data
{
    public static class ValidationSeedData
    {
        public static List<ValidationSetting> GetCheckoutValidationSettings()
        {
            return new List<ValidationSetting>
            {
                // Shipping Information
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "shipping.fullName",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 2,
                        MaxLength = 100,
                        RegexPattern = @"^[a-zA-Z\s\.']+$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Full name is required",
                        MinLength = "Full name must be at least 2 characters",
                        MaxLength = "Full name must not exceed 100 characters",
                        Pattern = "Full name can only contain letters, spaces, dots, and apostrophes"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "shipping.email",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Email is required",
                        Pattern = "Invalid email format"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "shipping.phone",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = @"^[6-9]\d{9}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Phone is required",
                        Pattern = "Invalid Indian phone number (must start with 6, 7, 8, or 9 and be 10 digits)"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "shipping.address",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 10,
                        MaxLength = 200,
                        RegexPattern = @"^[a-zA-Z0-9\s\-\.,#\/]+$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Address is required",
                        MinLength = "Address must be at least 10 characters",
                        MaxLength = "Address must not exceed 200 characters",
                        Pattern = "Address contains invalid characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "shipping.state",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "State is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "shipping.city",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "District is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "shipping.zipCode",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = @"^\d{6}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "PIN code is required",
                        Pattern = "Invalid Indian PIN code (must be 6 digits)"
                    }
                },
                // Billing Information
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "billing.fullName",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 2,
                        MaxLength = 100,
                        RegexPattern = @"^[a-zA-Z\s\.']+$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Full name is required",
                        MinLength = "Full name must be at least 2 characters",
                        MaxLength = "Full name must not exceed 100 characters",
                        Pattern = "Full name can only contain letters, spaces, dots, and apostrophes"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "billing.email",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Email is required",
                        Pattern = "Invalid email format"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "billing.phone",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = @"^[6-9]\d{9}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Phone is required",
                        Pattern = "Invalid Indian phone number (must start with 6, 7, 8, or 9 and be 10 digits)"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "billing.address",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 10,
                        MaxLength = 200,
                        RegexPattern = @"^[a-zA-Z0-9\s\-\.,#\/]+$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Address is required",
                        MinLength = "Address must be at least 10 characters",
                        MaxLength = "Address must not exceed 200 characters",
                        Pattern = "Address contains invalid characters"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "billing.state",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "State is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "billing.city",
                    ValidationRules = new ValidationRules
                    {
                        Required = true
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "District is required"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "billing.zipCode",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = @"^\d{6}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "PIN code is required",
                        Pattern = "Invalid Indian PIN code (must be 6 digits)"
                    }
                },
                // Payment Information
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "payment.cardNumber",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = @"^\d{16}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Card number is required",
                        Pattern = "Invalid card number (must be 16 digits)"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "payment.cardName",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        MinLength = 2,
                        MaxLength = 50,
                        RegexPattern = @"^[a-zA-Z\s]+$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Cardholder name is required",
                        MinLength = "Cardholder name must be at least 2 characters",
                        MaxLength = "Cardholder name must not exceed 50 characters",
                        Pattern = "Cardholder name can only contain letters and spaces"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "payment.expiryDate",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = @"^(0[1-9]|1[0-2])\/\d{2}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "Expiry date is required",
                        Pattern = "Invalid expiry date (MM/YY)"
                    }
                },
                new ValidationSetting
                {
                    EntityType = "checkout",
                    FieldName = "payment.cvv",
                    ValidationRules = new ValidationRules
                    {
                        Required = true,
                        RegexPattern = @"^\d{3,4}$"
                    },
                    ErrorMessages = new ErrorMessages
                    {
                        Required = "CVV is required",
                        Pattern = "Invalid CVV (must be 3 or 4 digits)"
                    }
                }
            };
        }
    }
}
