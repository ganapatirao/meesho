Feature: Transport User Flow

  Scenario: Browse Transports
    Given user is on the transport page
    When user views the transports list
    Then user should see all active transports
    And each transport should show type, source, destination, and price

  Scenario: Filter Transports by Source
    Given user is on the transport page
    When user selects a source location filter
    Then only transports from selected source should be displayed

  Scenario: Filter Transports by Destination
    Given user is on the transport page
    When user selects a destination location filter
    Then only transports to selected destination should be displayed

  Scenario: Search Transports
    Given user is on the transport page
    When user enters search keywords
    Then transports matching the search should be displayed

  Scenario: View Transport Details
    Given user is on the transport page
    When user clicks on a transport
    Then user should see transport details
    And user should see departure and arrival times
    And user should see available seats
    And user should see price

  Scenario: Book Transport
    Given user is logged in
    And user is viewing a transport
    When user clicks book button
    And user selects number of passengers
    And user enters passenger details
    And user confirms booking
    Then booking should be created successfully
    And user should see booking confirmation

  Scenario: View Transport Bookings
    Given user is logged in
    When user navigates to my bookings
    Then user should see all transport bookings
    And user should see booking status
