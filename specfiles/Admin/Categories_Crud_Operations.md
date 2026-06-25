# Admin Categories CRUD Operations Specification

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

This specification defines the CRUD operations for Shopping Categories in the Admin Dashboard, including display sequence management for controlling the order in which categories appear on the shopping page.

### Key Features
- Category CRUD operations (Create, Read, Update, Delete)
- Display sequence management for category ordering
- Categories sorted by displaySequence in ascending order
- Categories with displaySequence = 0 appear last
- Category auto-creation when products are added with new category names

---

## Operations

1. **Add Category** - Create a new category with display sequence
2. **Edit Category** - Update existing category including display sequence
3. **Delete Category** - Remove a category from the system
4. **View Categories** - List all categories sorted by display sequence

---

## Data Models & Schema

### Category Collection Schema

The Category collection stores all category data with the following structure:

- **_id**: ObjectId (unique identifier)
- **name**: String (category name)
- **description**: String (category description)
- **imageUrl**: String (category/subcategory image URL)
- **status**: String (Active/Inactive)
- **displaySequence**: Integer (display order for shopping page, configurable by admin)
- **createdAt**: ISODate (creation timestamp)

---

## API Endpoints

### Category CRUD Endpoints

#### Get All Categories
- **Endpoint:** `GET /api/admin/categories`
- **Authentication:** Required (Admin role)
- **Response:**
  - Success: 200 OK with array of categories sorted by displaySequence
  - Categories with displaySequence = 0 appear last
  - Error: 401 Unauthorized

#### Create Category
- **Endpoint:** `POST /api/admin/categories`
- **Authentication:** Required (Admin role)
- **Request Body:** Category object with all fields
- **Response:**
  - Success: 200 OK with created category data
  - Error: 400 Bad Request with validation errors

#### Update Category
- **Endpoint:** `PUT /api/admin/categories/{id}`
- **Authentication:** Required (Admin role)
- **Request Body:** Category object with updated fields
- **Response:**
  - Success: 200 OK with updated category data
  - Error: 400 Bad Request with validation errors or 404 Not Found

#### Delete Category
- **Endpoint:** `DELETE /api/admin/categories/{id}`
- **Authentication:** Required (Admin role)
- **Response:**
  - Success: 200 OK
  - Error: 404 Not Found
- **Product Behavior:**
  - Deleting a category does NOT delete products in that category
  - Products remain in the system but their categoryName field remains unchanged
  - Admin should manually update product categories if needed

---

## Field Validation Rules

### Field Specifications

| Field | Type | MongoDB Field | Max Length | Regex Pattern | Required |
|-------|------|---------------|------------|---------------|----------|
| Name | String | `name` | 100 | - | Yes |
| Description | String | `description` | 2000 | - | No |
| Image URL | String | `imageUrl` | - | - | No |
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
  - Optional field
  - Must not exceed 2000 characters
- **Error Messages:**
  - "Description must not exceed 2000 characters"

#### 3. Image URL
- **Type:** String (URL or data URL)
- **Validation Rules:**
  - Optional field
  - Must be a valid URL format if provided
- **Error Messages:**
  - "Invalid image URL format"

#### 4. Display Sequence
- **Type:** Integer input
- **Purpose:** Controls the display order of categories on the shopping page
- **Validation Rules:**
  - Must not be empty
  - Must be a positive integer (0 or greater)
  - Must be numeric only
- **Admin Configurability:**
  - Admin can set the display sequence for each category
  - Categories are sorted by displaySequence in ascending order on the shopping page
  - Default value: 0 (if not specified, categories without sequence appear last)
- **Error Messages:**
  - "Display sequence is required"
  - "Display sequence must be a positive integer"
  - "Display sequence must be numeric only"

#### 5. Status
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

### 1. Update Category Model

Add DisplaySequence property to the Category model in ShoppingModels.cs:
- Add `DisplaySequence` property with integer type
- Add validation attributes: Required, RegularExpression (numeric only), Range (0 to int.MaxValue)
- Set default value to 0

### 2. Update Category Seed Data

Add DisplaySequence values to all category entries in ShoppingSeedData.cs:
- Assign sequential values (1, 2, 3, etc.) to existing categories
- Ensure all categories have a displaySequence value

### 3. Update ShoppingController

Modify the GetCategories endpoint in ShoppingController.cs:
- Fetch all categories from database
- Sort categories by displaySequence in memory (ascending order)
- Handle displaySequence = 0 by treating it as int.MaxValue for sorting
- Return sorted categories

### 4. Update Admin Controller

Add category CRUD endpoints in AdminController.cs:
- **GetCategories:** Fetch and sort categories by displaySequence
- **CreateCategory:** Create new category with validation
- **UpdateCategory:** Update existing category with validation
- **DeleteCategory:** Delete category without affecting products

### 5. Update CreateProduct

Modify CreateProduct in AdminController.cs:
- After creating a product, check if category exists in Category table
- If category doesn't exist, create it with default values:
  - description = ""
  - imageUrl = ""
  - status = "Active"
  - displaySequence = 0
  - createdAt = DateTime.UtcNow

### 6. Update DeleteProduct

Modify DeleteProduct in AdminController.cs:
- Remove logic that deletes category when last product is deleted
- Categories should remain in the system regardless of product count
- Admin must manually delete categories through Categories tab

---

## Frontend Implementation

### 1. Add Categories Tab

Add a new "Categories" tab to the Admin Dashboard navigation:
- Add 'categories' to the tabs array
- Create a new section to display categories list

### 2. Categories List View

Implement categories list table with columns:
- Name
- Description
- Display Sequence
- Status
- Actions (Edit, Delete)

### 3. Category Handlers

Implement handler functions:
- **handleEditCategory:** Open edit modal with category data
- **handleDeleteCategory:** Delete category via API
- **handleSaveCategory:** Save category (create or update) via API

### 4. Category Edit Modal

Implement category form modal with fields:
- Name (required, max 100 characters)
- Description (optional, max 2000 characters)
- Image URL (optional)
- Display Sequence (required, numeric, min 0)
- Status (dropdown: Active/Inactive)

### 5. Display Sequence Sorting

Ensure categories are displayed in the order returned from backend:
- Backend already sorts by displaySequence
- Frontend displays in the order received
- No additional sorting needed on frontend

---

## Testing Checklist

### Add Category
- [ ] Test with all valid fields
- [ ] Test with missing mandatory fields (name, displaySequence, status)
- [ ] Test with invalid displaySequence (negative, non-numeric)
- [ ] Test with name exceeding 100 characters
- [ ] Test with description exceeding 2000 characters
- [ ] Verify category is created in database
- [ ] Verify displaySequence is saved correctly

### Edit Category
- [ ] Test editing existing category
- [ ] Test with same validations as add
- [ ] Test updating displaySequence
- [ ] Verify category is updated in database
- [ ] Verify displaySequence changes affect sorting

### Delete Category
- [ ] Test deletion of category
- [ ] Test with invalid category ID
- [ ] Verify products in category are NOT deleted
- [ ] Verify products' categoryName field remains unchanged

### View Categories
- [ ] Verify categories are sorted by displaySequence
- [ ] Verify categories with displaySequence = 0 appear last
- [ ] Verify all category fields are displayed correctly

### Category Auto-Creation
- [ ] Test creating product with new category name
- [ ] Verify category is auto-created in Category table
- [ ] Verify auto-created category has default values
- [ ] Test creating another product with same new category name
- [ ] Verify category is not duplicated

### Product Deletion
- [ ] Test deleting product from a category
- [ ] Verify category remains in Category table
- [ ] Verify category is not deleted when last product is removed

---

## Current State Analysis

### Existing Category Model (ShoppingModels.cs)
- Name: Basic validation
- Description: Basic validation
- ImageUrl: Basic validation
- Status: Basic validation
- DisplaySequence: Not present (needs to be added)

### Existing Admin Controller (AdminController.cs)
- Category CRUD endpoints: Not present (needs to be added)
- CreateProduct: No category auto-creation logic
- DeleteProduct: Has category deletion logic (needs to be removed)

### Existing Frontend (AdminDashboard.jsx)
- Categories tab: Not present (needs to be added)
- Category list view: Not present (needs to be added)
- Category edit modal: Not present (needs to be added)
- Category handlers: Not present (needs to be added)

---

## Implementation Priority

### Phase 1: Backend Foundation
1. **Add DisplaySequence to Category Model** - Add property with validation
2. **Update Category Seed Data** - Add displaySequence values
3. **Update GetCategories Endpoint** - Sort by displaySequence

### Phase 2: Backend API
4. **Add Category CRUD Endpoints** - Get, Create, Update, Delete in AdminController
5. **Update CreateProduct** - Add category auto-creation logic
6. **Update DeleteProduct** - Remove category deletion logic

### Phase 3: Frontend Implementation
7. **Add Categories Tab** - Add to navigation and create list view
8. **Implement Category Handlers** - Edit, Delete, Save functions
9. **Add Category Edit Modal** - Form with all fields including displaySequence

### Phase 4: Testing & Deployment
10. **Testing** - Comprehensive testing of all scenarios
11. **Documentation** - Update API documentation with category endpoints
