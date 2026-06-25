# Admin Ads CRUD Operations Specification

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

This specification defines the CRUD operations for Advertisements in the Admin Dashboard, including comprehensive field validations for Add, Edit, Activate/Deactivate, and Delete operations. All validation settings are stored in and pulled from MongoDB for dynamic configuration, allowing runtime changes without code deployment.

### Key Features
- Dynamic validation rules stored in MongoDB
- Client-side and server-side validation
- Real-time field validation on focusout
- Enhanced image handling with add/remove functionality
- Character counters and detailed error messages

---

## Operations

1. **Add Advertisement** - Create a new advertisement with validation
2. **Edit Advertisement** - Update existing advertisement with validation
3. **Activate/Deactivate Advertisement** - Toggle advertisement status
4. **Delete Advertisement** - Remove an advertisement from the system

---

## Data Models & Schema

### Advertisement Collection Schema

The Advertisement collection stores all advertisement data with the following structure:

- **_id**: ObjectId (unique identifier)
- **title**: String (advertisement title)
- **description**: String (advertisement description)
- **price**: Decimal (advertisement price)
- **categoryId**: String (reference to ad category)
- **categoryName**: String (category name)
- **subcategory**: String (subcategory name)
- **location**: String (location)
- **city**: String (city)
- **condition**: String (New/Like New/Good/Fair)
- **sellerId**: String (reference to seller)
- **sellerName**: String (seller name)
- **sellerPhone**: String (seller phone)
- **phoneDisplayStatus**: String (Visible/Hidden)
- **sellerEmail**: String (seller email)
- **imageUrl**: String (primary image data URL)
- **imageUrls**: Array of String (secondary image data URLs)
- **negotiable**: Boolean (price negotiable flag)
- **isFeatured**: Boolean (featured advertisement flag)
- **isUrgent**: Boolean (urgent advertisement flag)
- **views**: Integer (view count)
- **status**: String (Active/Inactive/Pending)
- **postedDate**: ISODate (posting date)
- **createdAt**: ISODate (creation timestamp)
- **updatedAt**: ISODate (last update timestamp)

### ValidationSettings Collection Schema

All field validation rules are stored in MongoDB in a `ValidationSettings` collection:

- **_id**: ObjectId (unique identifier)
- **entityType**: String (e.g., "Advertisement", "Product", "Job")
- **fieldName**: String (e.g., "title", "description", "price")
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

### Advertisement CRUD Endpoints

#### Add Advertisement
- **Endpoint:** `POST /api/admin/ads`
- **Authentication:** Required (Admin role)
- **Request Body:** Advertisement object with all fields
- **Response:**
  - Success: 200 OK with created advertisement data
  - Error: 400 Bad Request with validation errors

#### Edit Advertisement
- **Endpoint:** `PUT /api/admin/ads/{id}`
- **Authentication:** Required (Admin role)
- **Request Body:** Advertisement object with updated fields
- **Response:**
  - Success: 200 OK with success message
  - Error: 400 Bad Request with validation errors
  - Error: 404 Not Found if advertisement doesn't exist

#### Delete Advertisement
- **Endpoint:** `DELETE /api/admin/ads/{id}`
- **Authentication:** Required (Admin role)
- **Response:**
  - Success: 200 OK with success message
  - Error: 404 Not Found if advertisement doesn't exist

#### Update Advertisement Status
- **Endpoint:** `PATCH /api/admin/ads/{id}/status`
- **Authentication:** Required (Admin role)
- **Request Body:** `{ "status": "Active" | "Inactive" }`
- **Response:**
  - Success: 200 OK with success message
  - Error: 404 Not Found if advertisement doesn't exist

#### Get All Advertisements
- **Endpoint:** `GET /api/admin/ads`
- **Authentication:** Required (Admin role)
- **Response:** 200 OK with array of advertisements

---

## Field Validation Rules

### Advertisement Field Validations

| Field | Required | Min Length | Max Length | Regex Pattern | Min Value | Max Value | Allowed Values |
|-------|----------|------------|------------|---------------|-----------|-----------|----------------|
| title | Yes | - | 100 | - | - | - | - |
| description | Yes | - | 2000 | - | - | - | - |
| price | Yes | - | - | - | 0.01 | - | - |
| categoryName | Yes | - | 50 | - | - | - | - |
| location | Yes | - | 100 | - | - | - | - |
| city | Yes | - | 50 | - | - | - | - |
| condition | Yes | - | - | - | - | - | New, Like New, Good, Fair |
| sellerName | Yes | - | 100 | - | - | - | - |
| sellerPhone | Yes | - | 15 | ^\+?[\d\s-]{10,}$ | - | - | - |
| sellerEmail | Yes | - | 100 | ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$ | - | - | - |
| imageUrl | Yes | - | - | - | - | - | - |
| status | Yes | - | - | - | - | - | Active, Inactive, Pending |

---

## Backend Implementation

### Validation Service Integration

The backend uses the `ValidationService` to fetch and apply validation rules from MongoDB:

```csharp
// Get validation settings from MongoDB
var validationSettings = await _validationService.GetValidationSettingsAsync("Advertisement");

// Validate each field
if (validationSettings.ContainsKey("title"))
{
    var titleResult = _validationService.ValidateField("title", ad.Title, validationSettings["title"]);
    if (!titleResult.IsValid) errors["title"] = titleResult.Errors;
}
```

### Controller Methods

#### CreateAd
- Fetches validation settings from MongoDB for "Advertisement" entity
- Validates all fields using the validation service
- Returns 400 with detailed error messages if validation fails
- Additional validation for image URL format (allows data URLs)
- Inserts advertisement into MongoDB on success

#### UpdateAd
- Fetches validation settings from MongoDB for "Advertisement" entity
- Validates all fields using the validation service
- Returns 400 with detailed error messages if validation fails
- Additional validation for image URL format (allows data URLs)
- Updates advertisement in MongoDB on success

#### DeleteAd
- Deletes advertisement by ID
- Returns 404 if advertisement not found

#### UpdateAdStatus
- Updates advertisement status (Active/Inactive)
- Returns 404 if advertisement not found

---

## Frontend Implementation

### Validation Settings Loading

The frontend loads validation settings from the backend on component mount:

```javascript
useEffect(() => {
  const loadValidationSettings = async () => {
    try {
      const response = await adminApi.getValidationSettings('Advertisement');
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
  const title = e.target.title.value;
  const titleResult = validateField('title', title);
  if (!titleResult.isValid) errors.title = titleResult.errors[0];
  
  // ... validate other fields
  
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    return;
  }
  
  // Submit to backend
  await adminApi.createAd(formData);
};
```

---

## Testing Checklist

### Add Advertisement
- [ ] Verify all required fields show validation errors when empty
- [ ] Verify max length validation for text fields
- [ ] Verify regex pattern validation for phone and email
- [ ] Verify allowed values validation for condition
- [ ] Verify min value validation for price
- [ ] Verify image URL format validation
- [ ] Verify successful creation with valid data
- [ ] Verify error messages are clear and helpful

### Edit Advertisement
- [ ] Verify validation works on edit
- [ ] Verify existing data loads correctly
- [ ] Verify update preserves unchanged fields
- [ ] Verify successful update with valid data

### Delete Advertisement
- [ ] Verify deletion removes advertisement
- [ ] Verify 404 for non-existent advertisement
- [ ] Verify confirmation dialog shows

### Update Status
- [ ] Verify status toggles between Active/Inactive
- [ ] Verify 404 for non-existent advertisement
- [ ] Verify status change reflects in UI

### Dynamic Validation
- [ ] Verify validation settings load from MongoDB
- [ ] Verify changes to validation settings in MongoDB reflect in frontend
- [ ] Verify cache invalidation works
