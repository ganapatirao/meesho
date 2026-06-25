Feature: Admin Authentication

  Scenario: Admin Login with Valid Credentials
    Given admin is on the login page
    When admin enters valid username and password
    And admin clicks the login button
    Then admin should be redirected to the admin dashboard
    And admin should see the dashboard with all sections

  Scenario: Admin Login with Invalid Credentials
    Given admin is on the login page
    When admin enters invalid username or password
    And admin clicks the login button
    Then admin should see an error message
    And admin should remain on the login page

  Scenario: Admin Logout
    Given admin is logged into the dashboard
    When admin clicks the logout button
    Then admin should be redirected to the login page
    And admin session should be terminated

  Scenario: Admin Password Reset
    Given admin is logged into the dashboard
    When admin navigates to profile settings
    And admin enters current password
    And admin enters new password
    And admin confirms new password
    And admin clicks the reset password button
    Then admin should see a success message
    And admin should be able to login with new password
