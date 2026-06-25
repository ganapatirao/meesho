# Admin Jobs CRUD Operations Specification

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

This specification defines the CRUD operations for Jobs in the Admin Dashboard, including comprehensive field validations for Add, Edit, and Delete operations. All validation settings are stored in and pulled from MongoDB for dynamic configuration, allowing runtime changes without code deployment.

### Key Features
- Dynamic validation rules stored in MongoDB
- Client-side and server-side validation
- Real-time field validation on focusout
- Character counters and detailed error messages

---

## Operations

1. **Add Job** - Create a new job with validation
2. **Edit Job** - Update existing job with validation
3. **Delete Job** - Remove a job from the system

---

## Data Models & Schema

### Job Collection Schema

The Job collection stores all job data with the following structure:

- **_id**: ObjectId (unique identifier)
- **title**: String (job title)
- **company**: String (company name)
- **location**: String (job location)
- **salary**: String (salary range)
- **type**: String (job type)
- **experience**: String (experience level)
- **description**: String (job description)
- **requirements**: String (job requirements)
- **skills**: Array of String (required skills)
- **status**: String (Active/Inactive)
- **createdAt**: ISODate (creation timestamp)
- **updatedAt**: ISODate (last update timestamp)

### ValidationSettings Collection Schema

All field validation rules are stored in MongoDB in a `ValidationSettings` collection:

- **_id**: ObjectId (unique identifier)
- **entityType**: String (e.g., "Job", "Product", "Advertisement")
- **fieldName**: String (e.g., "title", "company", "location")
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

### Job CRUD Endpoints

#### Add Job
- **Endpoint:** `POST /api/admin/jobs`
- **Authentication:** Required (Admin role)
- **Request Body:** Job object with all fields
- **Response:**
  - Success: 200 OK with created job data
  - Error: 400 Bad Request with validation errors

#### Edit Job
- **Endpoint:** `PUT /api/admin/jobs/{id}`
- **Authentication:** Required (Admin role)
- **Request Body:** Job object with updated fields
- **Response:**
  - Success: 200 OK with success message
  - Error: 400 Bad Request with validation errors
  - Error: 404 Not Found if job doesn't exist

#### Delete Job
- **Endpoint:** `DELETE /api/admin/jobs/{id}`
- **Authentication:** Required (Admin role)
- **Response:**
  - Success: 200 OK with success message
  - Error: 404 Not Found if job doesn't exist

#### Get All Jobs
- **Endpoint:** `GET /api/admin/jobs`
- **Authentication:** Required (Admin role)
- **Response:** 200 OK with array of jobs

---

## Field Validation Rules

### Job Field Validations

| Field | Required | Min Length | Max Length | Regex Pattern | Min Value | Max Value | Allowed Values |
|-------|----------|------------|------------|---------------|-----------|-----------|----------------|
| title | Yes | 5 | 100 | - | - | - | - |
| company | Yes | 2 | 100 | - | - | - | - |
| location | Yes | - | 50 | - | - | - | - |
| salary | Yes | - | 30 | - | - | - | - |
| type | Yes | - | 30 | - | - | - | - |
| description | Yes | 50 | 5000 | - | - | - | - |
| skills | Yes | 1 (count) | - | - | - | - | - |
| status | Yes | - | 20 | - | - | - | - |

---

## Backend Implementation

### Validation Service Integration

The backend uses the `ValidationService` to fetch and apply validation rules from MongoDB:

```csharp
// Get validation settings from MongoDB
var validationSettings = await _validationService.GetValidationSettingsAsync("Job");

// Validate each field
if (validationSettings.ContainsKey("title"))
{
    var titleResult = _validationService.ValidateField("title", job.Title, validationSettings["title"]);
    if (!titleResult.IsValid) errors["title"] = titleResult.Errors;
}
```

### Controller Methods

#### CreateJob
- Fetches validation settings from MongoDB for "Job" entity
- Validates all fields using the validation service
- Returns 400 with detailed error messages if validation fails
- Inserts job into MongoDB on success

#### UpdateJob
- Fetches validation settings from MongoDB for "Job" entity
- Validates all fields using the validation service
- Returns 400 with detailed error messages if validation fails
- Updates job in MongoDB on success

#### DeleteJob
- Deletes job by ID
- Returns 404 if job not found

---

## Frontend Implementation

### Validation Settings Loading

The frontend loads validation settings from the backend on component mount:

```javascript
useEffect(() => {
  const loadValidationSettings = async () => {
    try {
      const response = await adminApi.getValidationSettings('Job');
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
  await adminApi.createJob(formData);
};
```

---

## Testing Checklist

### Add Job
- [ ] Verify all required fields show validation errors when empty
- [ ] Verify min length validation for title (5 chars)
- [ ] Verify min length validation for company (2 chars)
- [ ] Verify min length validation for description (50 chars)
- [ ] Verify max length validation for text fields
- [ ] Verify skills array requires at least 1 skill
- [ ] Verify successful creation with valid data
- [ ] Verify error messages are clear and helpful

### Edit Job
- [ ] Verify validation works on edit
- [ ] Verify existing data loads correctly
- [ ] Verify update preserves unchanged fields
- [ ] Verify successful update with valid data

### Delete Job
- [ ] Verify deletion removes job
- [ ] Verify 404 for non-existent job
- [ ] Verify confirmation dialog shows

### Dynamic Validation
- [ ] Verify validation settings load from MongoDB
- [ ] Verify changes to validation settings in MongoDB reflect in frontend
- [ ] Verify cache invalidation works
