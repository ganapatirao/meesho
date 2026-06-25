Feature: Jobs Management

  Scenario: Add New Job
    Given admin is on the jobs management page
    When admin clicks the "Add Job" button
    And admin enters job title
    And admin enters job description
    And admin enters company name
    And admin enters location
    And admin enters salary range
    And admin selects job type
    And admin enters required skills
    And admin uploads company logo
    And admin sets status to Active
    And admin clicks the save button
    Then job should be created successfully
    And job should appear in the jobs list

  Scenario: Edit Job
    Given admin is on the jobs management page
    When admin selects a job to edit
    And admin modifies job details
    And admin clicks the save button
    Then job should be updated successfully
    And changes should be reflected in the jobs list

  Scenario: Activate Job
    Given admin is on the jobs management page
    When admin selects an inactive job
    And admin clicks the activate button
    Then job status should change to Active
    And job should be visible on recruitment page

  Scenario: Deactivate Job
    Given admin is on the jobs management page
    When admin selects an active job
    And admin clicks the deactivate button
    Then job status should change to Inactive
    And job should not be visible on recruitment page

  Scenario: Delete Job
    Given admin is on the jobs management page
    When admin selects a job
    And admin clicks the delete button
    And admin confirms deletion
    Then job should be removed from the system
    And job should not appear in the jobs list

  Scenario: Filter Jobs by Location
    Given admin is on the jobs management page
    When admin selects a location filter
    Then only jobs from selected location should be displayed

  Scenario: Filter Jobs by Job Type
    Given admin is on the jobs management page
    When admin selects a job type filter
    Then only jobs of selected type should be displayed
