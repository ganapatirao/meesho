using BusinessPlatform.API.Models;
using MongoDB.Driver;
using System.Text.RegularExpressions;

namespace BusinessPlatform.API.Services
{
    public class ValidationService
    {
        private readonly MongoDbContext _context;
        private readonly Dictionary<string, Dictionary<string, ValidationSetting>> _settingsCache;
        private readonly SemaphoreSlim _cacheLock = new(1, 1);

        public ValidationService(MongoDbContext context)
        {
            _context = context;
            _settingsCache = new();
        }

        public async Task<Dictionary<string, ValidationSetting>> GetValidationSettingsAsync(string entityType)
        {
            if (_settingsCache.ContainsKey(entityType))
            {
                return _settingsCache[entityType];
            }

            await _cacheLock.WaitAsync();
            try
            {
                if (_settingsCache.ContainsKey(entityType))
                {
                    return _settingsCache[entityType];
                }

                var settings = await _context.ValidationSettings
                    .Find(v => v.EntityType == entityType && v.IsActive)
                    .ToListAsync();
                
                var settingsDict = settings.ToDictionary(s => s.FieldName);
                _settingsCache[entityType] = settingsDict;
                
                return settingsDict;
            }
            finally
            {
                _cacheLock.Release();
            }
        }

        public ValidationResult ValidateField(string fieldName, object value, ValidationSetting setting)
        {
            var errors = new List<string>();
            var stringValue = value?.ToString() ?? "";

            // Required validation
            if (setting.ValidationRules.Required && string.IsNullOrWhiteSpace(stringValue))
            {
                errors.Add(setting.ErrorMessages.Required ?? $"{fieldName} is required");
            }

            // Min length validation
            if (setting.ValidationRules.MinLength.HasValue && stringValue.Length < setting.ValidationRules.MinLength.Value)
            {
                errors.Add(setting.ErrorMessages.MinLength ?? $"{fieldName} must be at least {setting.ValidationRules.MinLength.Value} characters");
            }

            // Max length validation
            if (setting.ValidationRules.MaxLength.HasValue && stringValue.Length > setting.ValidationRules.MaxLength.Value)
            {
                errors.Add(setting.ErrorMessages.MaxLength ?? $"{fieldName} must not exceed {setting.ValidationRules.MaxLength.Value} characters");
            }

            // Regex pattern validation
            if (!string.IsNullOrWhiteSpace(setting.ValidationRules.RegexPattern) && !string.IsNullOrWhiteSpace(stringValue))
            {
                if (!Regex.IsMatch(stringValue, setting.ValidationRules.RegexPattern))
                {
                    errors.Add(setting.ErrorMessages.Pattern ?? $"{fieldName} contains invalid characters");
                }
            }

            // Min/Max value validation for numeric fields
            if (value is IConvertible)
            {
                if (setting.ValidationRules.MinValue.HasValue)
                {
                    var decimalValue = Convert.ToDecimal(value);
                    if (decimalValue < setting.ValidationRules.MinValue.Value)
                    {
                        errors.Add(setting.ErrorMessages.MinValue ?? $"{fieldName} must be at least {setting.ValidationRules.MinValue.Value}");
                    }
                }

                if (setting.ValidationRules.MaxValue.HasValue)
                {
                    var decimalValue = Convert.ToDecimal(value);
                    if (decimalValue > setting.ValidationRules.MaxValue.Value)
                    {
                        errors.Add(setting.ErrorMessages.MaxValue ?? $"{fieldName} must not exceed {setting.ValidationRules.MaxValue.Value}");
                    }
                }
            }

            return new ValidationResult { IsValid = errors.Count == 0, Errors = errors };
        }

        public void InvalidateCache(string entityType = null)
        {
            if (string.IsNullOrEmpty(entityType))
            {
                _settingsCache.Clear();
            }
            else
            {
                _settingsCache.Remove(entityType);
            }
        }
    }
}
