Feature: Movies Management

  Scenario: Add New Movie
    Given admin is on the movies management page
    When admin clicks the "Add Movie" button
    And admin enters movie title
    And admin enters movie description
    And admin enters genre
    And admin enters release date
    And admin enters duration
    And admin enters rating
    And admin uploads movie poster
    And admin enters showtimes
    And admin sets status to Active
    And admin clicks the save button
    Then movie should be created successfully
    And movie should appear in the movies list

  Scenario: Edit Movie
    Given admin is on the movies management page
    When admin selects a movie to edit
    And admin modifies movie details
    And admin clicks the save button
    Then movie should be updated successfully
    And changes should be reflected in the movies list

  Scenario: Activate Movie
    Given admin is on the movies management page
    When admin selects an inactive movie
    And admin clicks the activate button
    Then movie status should change to Active
    And movie should be visible on movies page

  Scenario: Deactivate Movie
    Given admin is on the movies management page
    When admin selects an active movie
    And admin clicks the deactivate button
    Then movie status should change to Inactive
    And movie should not be visible on movies page

  Scenario: Delete Movie
    Given admin is on the movies management page
    When admin selects a movie
    And admin clicks the delete button
    And admin confirms deletion
    Then movie should be removed from the system
    And movie should not appear in the movies list

  Scenario: Filter Movies by Genre
    Given admin is on the movies management page
    When admin selects a genre filter
    Then only movies from selected genre should be displayed

  Scenario: Update Showtimes
    Given admin is editing a movie
    When admin modifies showtimes
    And admin saves the movie
    Then showtimes should be updated successfully
