Feature: Movies User Flow

  Scenario: Browse Movies
    Given user is on the movies page
    When user views the movies list
    Then user should see all active movies
    And each movie should show title, genre, rating, and poster

  Scenario: Filter Movies by Genre
    Given user is on the movies page
    When user selects a genre filter
    Then only movies from selected genre should be displayed

  Scenario: Search Movies
    Given user is on the movies page
    When user enters search keywords
    Then movies matching the search should be displayed

  Scenario: View Movie Details
    Given user is on the movies page
    When user clicks on a movie
    Then user should see movie details
    And user should see movie description
    And user should see cast and crew
    And user should see showtimes
    And user should see rating

  Scenario: Book Movie Tickets
    Given user is logged in
    And user is viewing a movie
    When user clicks book tickets button
    And user selects showtime
    And user selects number of tickets
    And user selects seats
    And user confirms booking
    Then booking should be created successfully
    And user should see booking confirmation

  Scenario: View Movie Bookings
    Given user is logged in
    When user navigates to my bookings
    Then user should see all movie bookings
    And user should see booking status
