# Admin Movies CRUD Operations Specification

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

This specification defines the CRUD operations for Movies in the Admin Dashboard, including comprehensive field validations for Add, Edit, and Delete operations. All validation settings are stored in and pulled from MongoDB for dynamic configuration, allowing runtime changes without code deployment.

### Key Features
- Dynamic validation rules stored in MongoDB
- Client-side and server-side validation
- Real-time field validation on focusout
- Character counters and detailed error messages

---

## Operations

1. **Add Movie** - Create a new movie with validation
2. **Edit Movie** - Update existing movie with validation
3. **Delete Movie** - Remove a movie from the system

---

## Data Models & Schema

### Movie Collection Schema

The Movie collection stores all movie data with the following structure:

- **_id**: ObjectId (unique identifier)
- **title**: String (movie title)
- **genre**: String (movie genre)
- **language**: String (movie language)
- **duration**: Integer (duration in minutes)
- **rating**: Double (movie rating)
- **imageUrl**: String (image URL)
- **status**: String (Active/Inactive)
- **createdAt**: ISODate (creation timestamp)

### ValidationSettings Collection Schema

All field validation rules are stored in MongoDB in a `ValidationSettings` collection:

- **_id**: ObjectId (unique identifier)
- **entityType**: String (e.g., "Movie", "Product", "Job")
- **fieldName**: String (e.g., "title", "genre", "duration")
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

### Movie CRUD Endpoints

#### Add Movie
- **Endpoint:** `POST /api/admin/movies`
- **Authentication:** Required (Admin role)
- **Request Body:** Movie object with all fields
- **Response:**
  - Success: 200 OK with created movie data
  - Error: 400 Bad Request with validation errors

#### Edit Movie
- **Endpoint:** `PUT /api/admin/movies/{id}`
- **Authentication:** Required (Admin role)
- **Request Body:** Movie object with updated fields
- **Response:**
  - Success: 200 OK with success message
  - Error: 400 Bad Request with validation errors
  - Error: 404 Not Found if movie doesn't exist

#### Delete Movie
- **Endpoint:** `DELETE /api/admin/movies/{id}`
- **Authentication:** Required (Admin role)
- **Response:**
  - Success: 200 OK with success message
  - Error: 404 Not Found if movie doesn't exist

#### Get All Movies
- **Endpoint:** `GET /api/admin/movies`
- **Authentication:** Required (Admin role)
- **Response:** 200 OK with array of movies

---

## Field Validation Rules

### Movie Field Validations

| Field | Required | Min Length | Max Length | Regex Pattern | Min Value | Max Value | Allowed Values |
|-------|----------|------------|------------|---------------|-----------|-----------|----------------|
| title | Yes | - | - | - | - | - | - |
| genre | Yes | - | - | - | - | - | - |
| language | Yes | - | - | - | - | - | - |
| duration | Yes | - | - | - | 1 | - | - |
| rating | Yes | - | - | - | 0 | 10 | - |
| imageUrl | Yes | - | - | - | - | - | - |
| status | Yes | - | - | - | - | - | - |

---

## Backend Implementation

### Validation Service Integration

The backend uses the `ValidationService` to fetch and apply validation rules from MongoDB:

```csharp
// Get validation settings from MongoDB
var validationSettings = await _validationService.GetValidationSettingsAsync("Movie");

// Validate each field
if (validationSettings.ContainsKey("title"))
{
    var titleResult = _validationService.ValidateField("title", movie.Title, validationSettings["title"]);
    if (!titleResult.IsValid) errors["title"] = titleResult.Errors;
}
```

### Controller Methods

#### CreateMovie
- Fetches validation settings from MongoDB for "Movie" entity
- Validates all fields using the validation service
- Returns 400 with detailed error messages if validation fails
- Inserts movie into MongoDB on success

#### UpdateMovie
- Fetches validation settings from MongoDB for "Movie" entity
- Validates all fields using the validation service
- Returns 400 with detailed error messages if validation fails
- Updates movie in MongoDB on success

#### DeleteMovie
- Deletes movie by ID
- Returns 404 if movie not found

---

## Frontend Implementation

### Validation Settings Loading

The frontend loads validation settings from the backend on component mount:

```javascript
useEffect(() => {
  const loadValidationSettings = async () => {
    try {
      const response = await adminApi.getValidationSettings('Movie');
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
  await adminApi.createMovie(formData);
};
```

---

## Testing Checklist

### Add Movie
- [ ] Verify all required fields show validation errors when empty
- [ ] Verify min value validation for duration (1 minute)
- [ ] Verify min/max value validation for rating (0-10)
- [ ] Verify successful creation with valid data
- [ ] Verify error messages are clear and helpful

### Edit Movie
- [ ] Verify validation works on edit
- [ ] Verify existing data loads correctly
- [ ] Verify update preserves unchanged fields
- [ ] Verify successful update with valid data

### Delete Movie
- [ ] Verify deletion removes movie
- [ ] Verify 404 for non-existent movie
- [ ] Verify confirmation dialog shows

### Dynamic Validation
- [ ] Verify validation settings load from MongoDB
- [ ] Verify changes to validation settings in MongoDB reflect in frontend
- [ ] Verify cache invalidation works
