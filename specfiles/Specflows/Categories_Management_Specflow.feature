Feature: Categories Management

  Scenario: Add New Category
    Given admin is on the categories management page
    When admin clicks the "Add Category" button
    And admin enters category name
    And admin enters category description
    And admin uploads category image
    And admin enters display sequence
    And admin sets status to Active
    And admin clicks the save button
    Then category should be created successfully
    And category should appear in the categories list

  Scenario: Edit Category
    Given admin is on the categories management page
    When admin selects a category to edit
    And admin modifies category details
    And admin clicks the save button
    Then category should be updated successfully
    And changes should be reflected in the categories list

  Scenario: Delete Category
    Given admin is on the categories management page
    When admin selects a category
    And admin clicks the delete button
    And admin confirms deletion
    Then category should be removed from the system
    And category should not appear in the categories list

  Scenario: Reorder Categories by Display Sequence
    Given admin is on the categories management page
    When admin modifies display sequence values
    And admin saves the changes
    Then categories should be reordered according to display sequence
