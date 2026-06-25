Feature: Packages Management

  Scenario: Add New Package
    Given admin is on the packages management page
    When admin clicks the "Add Package" button
    And admin enters package name
    And admin enters package description
    And admin enters destination
    And admin enters duration
    And admin enters price
    And admin enters inclusions
    And admin uploads package image
    And admin sets status to Active
    And admin clicks the save button
    Then package should be created successfully
    And package should appear in the packages list

  Scenario: Edit Package
    Given admin is on the packages management page
    When admin selects a package to edit
    And admin modifies package details
    And admin clicks the save button
    Then package should be updated successfully
    And changes should be reflected in the packages list

  Scenario: Activate Package
    Given admin is on the packages management page
    When admin selects an inactive package
    And admin clicks the activate button
    Then package status should change to Active
    And package should be visible on travel page

  Scenario: Deactivate Package
    Given admin is on the packages management page
    When admin selects an active package
    And admin clicks the deactivate button
    Then package status should change to Inactive
    And package should not be visible on travel page

  Scenario: Delete Package
    Given admin is on the packages management page
    When admin selects a package
    And admin clicks the delete button
    And admin confirms deletion
    Then package should be removed from the system
    And package should not appear in the packages list

  Scenario: Filter Packages by Destination
    Given admin is on the packages management page
    When admin selects a destination filter
    Then only packages to selected destination should be displayed
