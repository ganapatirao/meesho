# Admin Products CRUD Operations Specification

## Table of Contents
1. [Overview](#overview)
2. [Operations](#operations)
3. [Data Models & Schema](#data-models--schema)
4. [API Endpoints](#api-endpoints)
5. [Field Validation Rules](#field-validation-rules)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [Testing Checklist](#testing-checklist)
9. [Current State Analysis](#current-state-analysis)
10. [Implementation Priority](#implementation-priority)

---

## Overview

This specification defines the CRUD operations for Products in the Admin Dashboard, including comprehensive field validations for Add, Edit, Activate/Deactivate, and Delete operations. All validation settings are stored in and pulled from MongoDB for dynamic configuration, allowing runtime changes without code deployment.

### Key Features
- Dynamic validation rules stored in MongoDB
- Client-side and server-side validation
- Real-time field validation on focusout
- Enhanced image handling with add/remove functionality
- Character counters and detailed error messages

---

## Operations

1. **Add Product** - Create a new product with validation
2. **Edit Product** - Update existing product with validation
3. **Activate/Deactivate Product** - Toggle product status
4. **Delete Product** - Remove a product from the system

---

## Data Models & Schema

### Product Collection Schema

The Product collection stores all product data with the following structure:

- **_id**: ObjectId (unique identifier)
- **name**: String (product name)
- **description**: String (product description)
- **price**: Decimal (product price)
- **stock**: Integer (available stock)
- **seller**: String (seller name)
- **imageUrl**: String (primary image data URL)
- **imageUrls**: Array of String (secondary image data URLs)
- **rating**: Double (average rating, auto-calculated)
- **reviewCount**: Integer (number of reviews)
- **categoryId**: String (reference to category)
- **categoryName**: String (category name)
- **displaySequence**: Integer (display order for shopping page, configurable by admin)
- **status**: String (Active/Inactive)
- **pros**: Array of String (product pros)
- **cons**: Array of String (product cons)
- **reviews**: Array of ProductReview (user reviews)
- **createdAt**: ISODate (creation timestamp)

### ValidationSettings Collection Schema

All field validation rules are stored in MongoDB in a `ValidationSettings` collection:

- **_id**: ObjectId (unique identifier)
- **entityType**: String (e.g., "Product", "User", "Order")
- **fieldName**: String (e.g., "name", "description", "price")
- **validationRules**: Object containing:
  - **required**: Boolean (whether field is mandatory)
  - **maxLength**: Integer (maximum character length)
  - **regexPattern**: String (regular expression for validation)
  - **minValue**: Decimal (minimum value for numeric fields)
  - **maxValue**: Decimal (maximum value for numeric fields)
  - **allowedValues**: Array of String (list of allowed values)
- **errorMessages**: Object containing:
  - **required**: String (error message for required validation)
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

### Product CRUD Endpoints

#### Add Product
- **Endpoint:** `POST /api/admin/products`
- **Authentication:** Required (Admin role)
- **Request Body:** Product object with all fields
- **Response:**
  - Success: 200 OK with created product data
  - Error: 400 Bad Request with validation errors

#### Edit Product
- **Endpoint:** `PUT /api/admin/products/{id}`
- **Authentication:** Required (Admin role)
- **Request Body:** Product object with updated fields
- **Response:**
  - Success: 200 OK with updated product data
  - Error: 400 Bad Request with validation errors or 404 Not Found

#### Activate/Deactivate Product
- **Endpoint:** `PATCH /api/admin/products/{id}/status`
- **Authentication:** Required (Admin role)
- **Request Body:** Object with status field (Active/Inactive)
- **Response:**
  - Success: 200 OK
  - Error: 404 Not Found

#### Delete Product
- **Endpoint:** `DELETE /api/admin/products/{id}`
- **Authentication:** Required (Admin role)
- **Response:**
  - Success: 200 OK
  - Error: 404 Not Found
- **Category Behavior:**
  - Deleting a product does NOT delete the category from the Category table
  - Categories remain in the system even if all products in that category are deleted
  - Admin must manually delete categories through the Categories tab if needed

### Validation Settings Management Endpoints

#### Get All Validation Settings
- **Endpoint:** `GET /api/admin/validation-settings/{entityType}`
- **Authentication:** Required (Admin role)
- **Response:** Array of validation settings for the specified entity type

#### Update Validation Setting
- **Endpoint:** `PUT /api/admin/validation-settings/{id}`
- **Authentication:** Required (Admin role)
- **Request Body:** Validation setting object
- **Response:** Updated validation setting

#### Create Validation Setting
- **Endpoint:** `POST /api/admin/validation-settings`
- **Authentication:** Required (Admin role)
- **Request Body:** Validation setting object
- **Response:** Created validation setting

---

## Field Validation Rules

### General Rules
- **All fields are mandatory** (except Rating which is readonly)
- **Validation must occur on both client-side and server-side**
- **Client-side validation should trigger on:**
  - Field focusout (blur)
  - Form submission
- **Error messages must be displayed based on regex validation**
- **Validation rules are pulled from MongoDB dynamically**

### Field Specifications

| Field | Type | MongoDB Field | Max Length | Regex Pattern | Required |
|-------|------|---------------|------------|---------------|----------|
| Name | String | `name` | 100 | - | Yes |
| Description | String | `description` | 2000 | - | Yes |
| Price | Decimal | `price` | 7 digits | `^\d{1,7}$` | Yes |
| Stock | Integer | `stock` | 7 digits | `^\d{1,7}$` | Yes |
| Seller | String | `seller` | 50 | `^[a-zA-Z\s\-']+$` | Yes |
| Primary Image | File (data URL) | `imageUrl` | - | - | Yes |
| Secondary Images | Files (data URLs) | `imageUrls` | - | - | Yes (min 1) |
| Rating | Double (readonly) | `rating` | - | `^\d+(\.\d{1,2})?$` | No |
| Pros | Array<String> | `pros` | 500 per item | - | Yes (min 1) |
| Cons | Array<String> | `cons` | 500 per item | - | Yes (min 1) |
| Category | String | `categoryName` | - | - | Yes |
| Display Sequence | Integer | `displaySequence` | - | `^\d+$` | Yes |
| Status | String | `status` | - | `^(Active\|Inactive)$` | Yes |

### Detailed Field Rules

#### 1. Name
- **Allowed Characters:** Any characters (alphabets, numbers, special characters)
- **Validation Rules:**
  - Must not be empty
  - Must not exceed 100 characters
- **Error Messages:**
  - "Name is required"
  - "Name must not exceed 100 characters"

#### 2. Description
- **Allowed Characters:** Any characters (alphabets, numbers, special characters)
- **Validation Rules:**
  - Must not be empty
  - Must not exceed 2000 characters
- **Error Messages:**
  - "Description is required"
  - "Description must not exceed 2000 characters"

#### 3. Price
- **Allowed Characters:** Digits only
- **Validation Rules:**
  - Must not be empty
  - Must be numeric only
  - Must not exceed 7 digits
  - Must be greater than 0
- **Error Messages:**
  - "Price is required"
  - "Price must be numeric only"
  - "Price must not exceed 7 digits"
  - "Price must be greater than 0"

#### 4. Stock
- **Allowed Characters:** Digits only
- **Validation Rules:**
  - Must not be empty
  - Must be numeric only
  - Must not exceed 7 digits
  - Must be 0 or greater
- **Error Messages:**
  - "Stock is required"
  - "Stock must be numeric only"
  - "Stock must not exceed 7 digits"
  - "Stock must be 0 or greater"

#### 5. Seller
- **Allowed Characters:** Alphabets, spaces, hyphens, apostrophes
- **Validation Rules:**
  - Must not be empty
  - Must match regex pattern
  - Must not exceed 50 characters
- **Error Messages:**
  - "Seller is required"
  - "Seller can only contain letters, spaces, hyphens, and apostrophes"
  - "Seller must not exceed 50 characters"

#### 6. Primary Image
- **Allowed Formats:** Data URLs for images
- **Validation Rules:**
  - Must not be empty
  - Must be a valid image file
  - Must be converted to data URL
- **Error Messages:**
  - "Primary image is required"
  - "Invalid image format"

#### 7. Secondary Images
- **Allowed Formats:** Data URLs for images
- **Validation Rules:**
  - Must not be empty (at least one image required)
  - Must be valid image files
  - Must be converted to data URLs
- **UI Requirements:**
  - Show existing images along with new images
  - Display remove button for each image
  - Display add button to add more images
- **Error Messages:**
  - "At least one secondary image is required"
  - "Invalid image format"

#### 8. Rating
- **Type:** Readonly (auto-calculated from user reviews)
- **Validation Rules:**
  - Field is readonly (cannot be edited by admin)
  - Must be numeric
  - Range: 0-5
- **Error Messages:** (Not applicable - readonly field)

#### 9. Pros
- **Allowed Characters:** Any characters (alphabets, numbers, special characters)
- **Validation Rules:**
  - Must not be empty (at least one pro required)
  - Must not exceed 500 characters per item
- **Error Messages:**
  - "At least one pro is required"
  - "Pro must not exceed 500 characters"

#### 10. Cons
- **Allowed Characters:** Any characters (alphabets, numbers, special characters)
- **Validation Rules:**
  - Must not be empty (at least one con required)
  - Must not exceed 500 characters per item
- **Error Messages:**
  - "At least one con is required"
  - "Con must not exceed 500 characters"

#### 11. Category
- **Type:** Dropdown selection
- **Validation Rules:**
  - Must not be empty
  - Must select from existing categories or create new category
- **Error Messages:**
  - "Category is required"
  - "Invalid category"
- **Category Auto-Creation:**
  - When creating a product with a new category name, the category is automatically added to the Category table
  - Auto-created categories have default values: description = "", imageUrl = "", status = "Active", displaySequence = 0
  - Admin can later edit the category details through the Categories tab in admin dashboard

#### 12. Display Sequence
- **Type:** Integer input
- **Purpose:** Controls the display order of products on the shopping page
- **Validation Rules:**
  - Must not be empty
  - Must be a positive integer
  - Must be numeric only
- **Admin Configurability:**
  - Admin can set the display sequence for each product
  - Products are sorted by displaySequence in ascending order on the shopping page
  - Default value: 0 (if not specified, products without sequence appear last)
- **Error Messages:**
  - "Display sequence is required"
  - "Display sequence must be a positive integer"
  - "Display sequence must be numeric only"

#### 13. Status
- **Type:** Dropdown selection
- **Allowed Values:** Active, Inactive
- **Validation Rules:**
  - Must not be empty
  - Must be either "Active" or "Inactive"
- **Error Messages:**
  - "Status is required"
  - "Invalid status"

---

## Backend Implementation

### 1. Validation Settings Model

Create a new model file for validation settings with the following classes:
- **ValidationSetting**: Main model with entity type, field name, validation rules, error messages, and metadata
- **ValidationRules**: Nested class for validation rule properties (required, maxLength, regexPattern, minValue, maxValue, allowedValues)
- **ErrorMessages**: Nested class for error message properties (required, pattern, maxLength, minValue, maxValue, invalidValue)
- **ValidationResult**: Class to return validation results with isValid flag and errors list

### 2. Validation Service

Create a ValidationService class with the following responsibilities:
- **Caching**: Implement in-memory caching of validation settings for performance
- **Thread Safety**: Use semaphore lock for cache access
- **Fetch Settings**: Method to retrieve validation settings from MongoDB by entity type
- **Validate Field**: Method to validate a single field value against its validation setting
- **Invalidate Cache**: Method to clear cache when settings are updated

### 3. Update MongoDbContext

Add ValidationSettings collection to the database context to enable CRUD operations on validation settings.

### 4. Update Product Model

Add Data Annotations to the Product model as a fallback mechanism:
- Required attribute for all mandatory fields
- StringLength attribute for length constraints
- RegularExpression attribute for pattern validation
- Range attribute for numeric value constraints
- MinLength attribute for array fields (pros, cons, imageUrls)
- Add DisplaySequence property (integer type)

### 5. Update Admin Controller

Integrate ValidationService in the AdminController:
- Inject ValidationService via constructor
- In CreateProduct and UpdateProduct methods:
  - Fetch validation settings from MongoDB
  - Validate each field using ValidationService
  - Return detailed validation errors if any
  - Fallback to ModelState validation if MongoDB settings unavailable
- In validation settings endpoints:
  - Implement GET to fetch settings by entity type
  - Implement POST to create new validation setting
  - Implement PUT to update existing validation setting
- In GetProducts endpoint:
  - Sort products by displaySequence in ascending order
  - Products with displaySequence = 0 or null appear last
  - Return products with displaySequence field included

### 6. Seed Data

Create seed data to populate ValidationSettings collection with Product validation rules:
- Insert validation settings for all Product fields (name, description, price, stock, seller, etc.)
- Include validation rules and error messages for each field
- Set all settings as active

---

## Frontend Implementation

### 1. Dynamic Validation Loading

Implement validation settings fetching:
- Create state to store validation settings
- Use useEffect to fetch settings on component mount
- Call API to get validation settings by entity type
- Convert array to dictionary keyed by field name for easy lookup
- Handle errors gracefully with console logging

### 2. Dynamic Field Validation

Implement field validation function:
- Accept field name and value as parameters
- Look up validation setting from stored settings
- Apply validation rules in order:
  - Required validation
  - Max length validation
  - Regex pattern validation
  - Min/Max value validation
- Return validation result with isValid flag and errors array
- Use error messages from MongoDB settings

### 3. Form Input Component

Update form inputs to use dynamic validation:
- Apply maxLength attribute from validation settings
- Add onBlur handler to trigger validation
- Update input border color based on validation state
- Display error message below input field
- Show character count using maxLength from settings
- Use validation settings for all applicable fields

### 4. Image Handling

Implement enhanced image handling:
- **Primary Image:**
  - Single file upload with preview
  - Remove button to clear selection
  - Validation for required field
- **Secondary Images:**
  - Multiple file upload
  - Grid display of all images
  - Remove button for each image
  - Add button to upload more
  - Show both existing and new images
  - Maintain image order

### 5. Form Layout Requirements

Ensure proper form layout:
- Group related fields together
- Use clear labels with asterisk (*) for required fields
- Show character count for fields with length limits
- Apply maxLength attribute from MongoDB settings
- Display error messages in red below each field
- Disable submit button until all validations pass

### 6. Display Sequence Sorting

Implement display sequence sorting for shopping page:
- **Backend:**
  - Sort products by displaySequence in ascending order
  - Products with displaySequence = 0 or null appear last
  - Include displaySequence field in product API responses
- **Frontend:**
  - Display products in the order returned from backend (already sorted)
  - No additional sorting needed on frontend
  - Display sequence is configured by admin in product edit form

### 7. Admin Configurability for Display Sequence

Implement display sequence configuration in admin dashboard:
- **Product Edit Form:**
  - Add displaySequence input field (integer type)
  - Allow admin to set the display order for each product
  - Default value: 0 (if not specified)
  - Validation: must be a positive integer
- **Product List View:**
  - Show current display sequence for each product
  - Allow inline editing of display sequence
  - Provide quick reorder functionality
- **Bulk Operations:**
  - Option to auto-assign display sequences based on current order
  - Option to reset all display sequences to 0

### 8. Subcategory Image Display

Implement subcategory image display in product edit page:
- **Category Selection:**
  - When a category is selected, check if it has a subcategory image
  - If subcategory image exists, display it in the edit form
  - Show subcategory image as a preview/reference
- **Image Storage:**
  - Subcategory images are stored in the Category collection
  - Category model should include imageUrl field for subcategory image
- **Display Logic:**
  - In product edit form, after category selection
  - Fetch category details including imageUrl
  - If imageUrl exists, display it in a designated area
  - Position: Near the category dropdown or in a preview section
- **Admin Configuration:**
  - Admin can upload subcategory images when creating/editing categories
  - Subcategory images are optional

### 9. Error Handling

Implement comprehensive error handling:
- Display server validation errors to user
- Show success message after successful operation
- Handle network errors gracefully
- Display MongoDB validation errors in user-friendly format
- Provide fallback behavior if validation settings fail to load

---

## Testing Checklist

### Add Product
- [ ] Test with all valid fields
- [ ] Test with missing mandatory fields
- [ ] Test with invalid regex patterns
- [ ] Test with field length exceeded
- [ ] Test with invalid image formats
- [ ] Test with no images
- [ ] Test with new category creation
- [ ] Test validation settings loaded from MongoDB
- [ ] Test fallback to Data Annotations if MongoDB fails

### Edit Product
- [ ] Test editing existing product
- [ ] Test with same validations as add
- [ ] Test image replacement
- [ ] Test image removal and addition
- [ ] Test with updated validation settings from MongoDB

### Activate/Deactivate
- [ ] Test activation of inactive product
- [ ] Test deactivation of active product
- [ ] Test with invalid product ID

### Delete
- [ ] Test deletion of product
- [ ] Test with invalid product ID
- [ ] Verify category cleanup when last product deleted

### Validation Settings Management
- [ ] Test fetching validation settings by entity type
- [ ] Test creating new validation setting
- [ ] Test updating existing validation setting
- [ ] Test cache invalidation
- [ ] Test active/inactive filter

---

## Current State Analysis

### Existing Product Model (ShoppingModels.cs)
- Name: No validation
- Description: No validation
- Price: Decimal type, no length validation
- Stock: Int type, no length validation
- Seller: No validation
- Rating: Double, not readonly enforced
- Pros/Cons: List<string>, no validation
- Images: No validation

### Existing Admin Controller (AdminController.cs)
- CreateProduct: No validation logic
- UpdateProduct: No validation logic
- DeleteProduct: Basic existence check
- UpdateProductStatus: Basic existence check

### Existing Frontend (AdminDashboard.jsx)
- Product form: Basic validation only
- No regex-based validation
- No focusout validation
- No character count display
- Image handling: Basic, needs enhancement for remove/add functionality
- No dynamic validation from MongoDB

---

## Implementation Priority

### Phase 1: Backend Foundation
1. **Create Validation Settings Model** - Add ValidationSetting, ValidationRules, and ErrorMessages models
2. **Create Validation Service** - Implement ValidationService with caching
3. **Update MongoDbContext** - Add ValidationSettings collection
4. **Add Validation Settings to MongoDB** - Seed validation settings for Product entity

### Phase 2: Backend API
5. **Create Validation Settings API Endpoints** - GET, POST, PUT for validation settings
6. **Update Product Model** - Add Data Annotations as fallback
7. **Update Admin Controller** - Integrate ValidationService in CreateProduct and UpdateProduct

### Phase 3: Frontend Implementation
8. **Frontend Validation Settings API** - Add API methods to fetch validation settings
9. **Frontend Dynamic Validation** - Update form to use MongoDB validation rules
10. **Frontend Image Component** - Enhanced image handling with remove/add

### Phase 4: Testing & Deployment
11. **Testing** - Comprehensive testing of all scenarios including dynamic validation changes
12. **Documentation** - Update API documentation with new validation settings endpoints
