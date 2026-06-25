Feature: Ads Management

  Scenario: Add New Ad
    Given admin is on the ads management page
    When admin clicks the "Add Ad" button
    And admin enters ad title
    And admin enters ad description
    And admin enters ad price
    And admin selects category
    And admin selects subcategory
    And admin uploads ad image
    And admin enters seller contact information
    And admin sets status to Active
    And admin clicks the save button
    Then ad should be created successfully
    And ad should appear in the ads list

  Scenario: Edit Ad
    Given admin is on the ads management page
    When admin selects an ad to edit
    And admin modifies ad details
    And admin clicks the save button
    Then ad should be updated successfully
    And changes should be reflected in the ads list

  Scenario: Activate Ad
    Given admin is on the ads management page
    When admin selects an inactive ad
    And admin clicks the activate button
    Then ad status should change to Active
    And ad should be visible on advertising page

  Scenario: Deactivate Ad
    Given admin is on the ads management page
    When admin selects an active ad
    And admin clicks the deactivate button
    Then ad status should change to Inactive
    And ad should not be visible on advertising page

  Scenario: Delete Ad
    Given admin is on the ads management page
    When admin selects an ad
    And admin clicks the delete button
    And admin confirms deletion
    Then ad should be removed from the system
    And ad should not appear in the ads list

  Scenario: Filter Ads by Category
    Given admin is on the ads management page
    When admin selects a category filter
    Then only ads from selected category should be displayed

  Scenario: Filter Ads by Subcategory
    Given admin is on the ads management page
    When admin selects a subcategory filter
    Then only ads from selected subcategory should be displayed
