Feature: Products Management

  Scenario: Add New Product with Valid Data
    Given admin is on the products management page
    When admin clicks the "Add Product" button
    And admin enters valid product name
    And admin enters valid product description
    And admin enters valid price
    And admin enters valid stock quantity
    And admin enters seller name
    And admin uploads primary image
    And admin uploads at least one secondary image
    And admin selects a category
    And admin enters display sequence
    And admin adds at least one pro
    And admin adds at least one con
    And admin sets status to Active
    And admin clicks the save button
    Then product should be created successfully
    And product should appear in the products list

  Scenario: Add Product with Missing Required Fields
    Given admin is on the products management page
    When admin clicks the "Add Product" button
    And admin leaves required fields empty
    And admin clicks the save button
    Then admin should see validation errors
    And product should not be created

  Scenario: Edit Existing Product
    Given admin is on the products management page
    When admin selects a product to edit
    And admin modifies product details
    And admin clicks the save button
    Then product should be updated successfully
    And changes should be reflected in the products list

  Scenario: Activate Product
    Given admin is on the products management page
    When admin selects an inactive product
    And admin clicks the activate button
    Then product status should change to Active
    And product should be visible on shopping page

  Scenario: Deactivate Product
    Given admin is on the products management page
    When admin selects an active product
    And admin clicks the deactivate button
    Then product status should change to Inactive
    And product should not be visible on shopping page

  Scenario: Delete Product
    Given admin is on the products management page
    When admin selects a product
    And admin clicks the delete button
    And admin confirms deletion
    Then product should be removed from the system
    And product should not appear in the products list

  Scenario: Upload Multiple Secondary Images
    Given admin is editing a product
    When admin uploads multiple secondary images
    Then all images should be displayed
    And admin should be able to remove individual images
    And admin should be able to add more images

  Scenario: Set Display Sequence
    Given admin is editing a product
    When admin enters a display sequence value
    And admin saves the product
    Then product should be sorted according to display sequence on shopping page
