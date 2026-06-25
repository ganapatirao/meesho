Feature: Recruitment User Flow

  Scenario: Browse Jobs
    Given user is on the recruitment page
    When user views the jobs list
    Then user should see all active jobs
    And each job should show title, company, location, and salary

  Scenario: Filter Jobs by Location
    Given user is on the recruitment page
    When user selects a location filter
    Then only jobs from selected location should be displayed

  Scenario: Filter Jobs by Job Type
    Given user is on the recruitment page
    When user selects a job type filter
    Then only jobs of selected type should be displayed

  Scenario: Search Jobs
    Given user is on the recruitment page
    When user enters search keywords
    Then jobs matching the search should be displayed

  Scenario: View Job Details
    Given user is on the recruitment page
    When user clicks on a job
    Then user should see job details
    And user should see job description
    And user should see required skills
    And user should see company information
    And user should see salary range

  Scenario: Apply for Job
    Given user is logged in
    And user is viewing a job
    When user clicks apply button
    And user uploads resume
    And user enters cover letter
    And user submits application
    Then application should be submitted successfully
    And user should see confirmation message

  Scenario: View Job Applications
    Given user is logged in
    When user navigates to my applications
    Then user should see all submitted applications
    And user should see application status
