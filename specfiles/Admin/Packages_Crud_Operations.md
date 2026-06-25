# Admin Travel Packages CRUD Operations Specification

## Table of Contents
1. [Overview](#overview)
2. [Operations](#operations)
3. [Data Models & Schema](#data-models--schema)
4. [API Endpoints](#api-endpoints)
5. [Field Validation Rules](#field-validation-rules)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [Testing Checklist](#testing-checklist)

---

## Overview

This specification defines the CRUD operations for Travel Packages in the Admin Dashboard, including comprehensive field validations for Add, Edit, and Delete operations. All validation settings are stored in and pulled from MongoDB for dynamic configuration, allowing runtime changes without code deployment.

### Key Features
- Dynamic validation rules stored in MongoDB
- Client-side and server-side validation
- Real-time field validation on focusout
- Character counters and detailed error messages

---

## Operations

1. **Add Travel Package** - Create a new travel package with validation
2. **Edit Travel Package** - Update existing travel package with validation
3. **Delete Travel Package** - Remove a travel package from the system

---

## Data Models & Schema

### TravelPackage Collection Schema

The TravelPackage collection stores all travel package data with the following structure:

- **_id**: ObjectId (unique identifier)
- **name**: String (package name)
- **description**: String (package description)
- **duration**: String (duration)
- **price**: Decimal (package price)
- **destinations**: Array of String (list of destinations)
- **imageUrl**: String (image URL)
- **status**: String (Active/Inactive)
- **createdAt**: ISODate (creation timestamp)

### ValidationSettings Collection Schema

All field validation rules are stored in MongoDB in a `ValidationSettings` collection:

- **_id**: ObjectId (unique identifier)
- **entityType**: String (e.g., "TravelPackage", "Product", "Job")
- **fieldName**: String (e.g., "name", "description", "price")
- **validationRules**: Object containing:
  - **required**: Boolean (whether field is mandatory)
  - **minLength**: Integer (minimum character length)
  - **maxLength**: Integer (maximum character length)
  - **regexPattern**: String (regular expression for validation)
  - **minValue**: Decimal (minimum value for numeric fields)
  - **maxValue**: Decimal (maximum value for numeric fields)
  - **allowedValues**: Array of String (list of allowed values)
- **errorMessages**: Object containing:
  - **required**: String (error message for required validation)
  - **minLength**: String (error message for minimum length)
  - **pattern**: String (error message for regex validation)
  - **maxLength**: String (error message for length validation)
  - **minValue**: String (error message for minimum value)
  - **maxValue**: String (error message for maximum value)
  - **invalidValue**: String (error message for invalid value)
- **isActive**: Boolean (whether validation setting is active)
- **createdAt**: ISODate (creation timestamp)
- **updatedAt**: ISODate (last update timestamp)

---

## API Endpoints

### TravelPackage CRUD Endpoints

#### Add Travel Package
- **Endpoint:** `POST /api/admin/packages`
- **Authentication:** Required (Admin role)
- **Request Body:** TravelPackage object with all fields
- **Response:**
  - Success: 200 OK with created package data
  - Error: 400 Bad Request with validation errors

#### Edit Travel Package
- **Endpoint:** `PUT /api/admin/packages/{id}`
- **Authentication:** Required (Admin role)
- **Request Body:** TravelPackage object with updated fields
- **Response:**
  - Success: 200 OK with success message
  - Error: 400 Bad Request with validation errors
  - Error: 404 Not Found if package doesn't exist

#### Delete Travel Package
- **Endpoint:** `DELETE /api/admin/packages/{id}`
- **Authentication:** Required (Admin role)
- **Response:**
  - Success: 200 OK with success message
  - Error: 404 Not Found if package doesn't exist

#### Get All Travel Packages
- **Endpoint:** `GET /api/admin/packages`
- **Authentication:** Required (Admin role)
- **Response:** 200 OK with array of travel packages

---

## Field Validation Rules

### TravelPackage Field Validations

| Field | Required | Min Length | Max Length | Regex Pattern | Min Value | Max Value | Allowed Values |
|-------|----------|------------|------------|---------------|-----------|-----------|----------------|
| name | Yes | - | - | - | - | - | - |
| description | Yes | - | - | - | - | - | - |
| duration | Yes | - | - | - | - | - | - |
| price | Yes | - | - | - | 0.01 | - | - |
| imageUrl | Yes | - | - | - | - | - | - |
| status | Yes | - | - | - | - | - | - |

---

## Backend Implementation

### Validation Service Integration

The backend uses the `ValidationService` to fetch and apply validation rules from MongoDB:

```csharp
// Get validation settings from MongoDB
var validationSettings = await _validationService.GetValidationSettingsAsync("TravelPackage");

// Validate each field
if (validationSettings.ContainsKey("name"))
{
    var nameResult = _validationService.ValidateField("name", package.Name, validationSettings["name"]);
    if (!nameResult.IsValid) errors["name"] = nameResult.Errors;
}
```

### Controller Methods

#### CreatePackage
- Fetches validation settings from MongoDB for "TravelPackage" entity
- Validates all fields using the validation service
- Returns 400 with detailed error messages if validation fails
- Inserts package into MongoDB on success

#### UpdatePackage
- Fetches validation settings from MongoDB for "TravelPackage" entity
- Validates all fields using the validation service
- Returns 400 with detailed error messages if validation fails
- Updates package in MongoDB on success

#### DeletePackage
- Deletes package by ID
- Returns 404 if package not found

---

## Frontend Implementation

### Validation Settings Loading

The frontend loads validation settings from the backend on component mount:

```javascript
useEffect(() => {
  const loadValidationSettings = async () => {
    try {
      const response = await adminApi.getValidationSettings('TravelPackage');
      const settings = {};
      response.data.forEach(setting => {
        settings[setting.fieldName] = {
          validationRules: setting.validationRules,
          errorMessages: setting.errorMessages
        };
      });
      setValidationSettings(settings);
    } catch (error) {
      console.error('Error loading validation settings:', error);
    }
  };
  loadValidationSettings();
}, []);
```

### Field Validation

Each field is validated on blur using the validation settings:

```javascript
const validateField = (fieldName, value) => {
  const setting = validationSettings[fieldName];
  if (!setting) return { isValid: true, errors: [] };
  
  const errors = [];
  const rules = setting.validationRules;
  const messages = setting.errorMessages;
  
  // Required validation
  if (rules.required && !value?.trim()) {
    errors.push(messages.required || `${fieldName} is required`);
  }
  
  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(messages.minLength || `${fieldName} must be at least ${rules.minLength} characters`);
  }
  
  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(messages.maxLength || `${fieldName} must not exceed ${rules.maxLength} characters`);
  }
  
  // Regex pattern validation
  if (rules.regexPattern && !new RegExp(rules.regexPattern).test(value)) {
    errors.push(messages.pattern || `${fieldName} contains invalid characters`);
  }
  
  // Min/Max value validation
  if (rules.minValue && parseFloat(value) < rules.minValue) {
    errors.push(messages.minValue || `${fieldName} must be at least ${rules.minValue}`);
  }
  
  if (rules.maxValue && parseFloat(value) > rules.maxValue) {
    errors.push(messages.maxValue || `${fieldName} must not exceed ${rules.maxValue}`);
  }
  
  // Allowed values validation
  if (rules.allowedValues && !rules.allowedValues.includes(value)) {
    errors.push(messages.invalidValue || `${fieldName} must be one of: ${rules.allowedValues.join(', ')}`);
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### Form Submission

On form submission, all fields are validated before sending to the backend:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate all fields
  const errors = {};
  const name = e.target.name.value;
  const nameResult = validateField('name', name);
  if (!nameResult.isValid) errors.name = nameResult.errors[0];
  
  // ... validate other fields
  
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    return;
  }
  
  // Submit to backend
  await adminApi.createPackage(formData);
};
```

---

## Testing Checklist

### Add Travel Package
- [ ] Verify all required fields show validation errors when empty
- [ ] Verify min value validation for price (0.01)
- [ ] Verify successful creation with valid data
- [ ] Verify error messages are clear and helpful

### Edit Travel Package
- [ ] Verify validation works on edit
- [ ] Verify existing data loads correctly
- [ ] Verify update preserves unchanged fields
- [ ] Verify successful update with valid data

### Delete Travel Package
- [ ] Verify deletion removes package
- [ ] Verify 404 for non-existent package
- [ ] Verify confirmation dialog shows

### Dynamic Validation
- [ ] Verify validation settings load from MongoDB
- [ ] Verify changes to validation settings in MongoDB reflect in frontend
- [ ] Verify cache invalidation works
