Feature: Transports Management

  Scenario: Add New Transport
    Given admin is on the transports management page
    When admin clicks the "Add Transport" button
    And admin enters transport type
    And admin enters source location
    And admin enters destination location
    And admin enters departure time
    And admin enters arrival time
    And admin enters price
    And admin enters available seats
    And admin uploads transport image
    And admin sets status to Active
    And admin clicks the save button
    Then transport should be created successfully
    And transport should appear in the transports list

  Scenario: Edit Transport
    Given admin is on the transports management page
    When admin selects a transport to edit
    And admin modifies transport details
    And admin clicks the save button
    Then transport should be updated successfully
    And changes should be reflected in the transports list

  Scenario: Activate Transport
    Given admin is on the transports management page
    When admin selects an inactive transport
    And admin clicks the activate button
    Then transport status should change to Active
    And transport should be visible on transport page

  Scenario: Deactivate Transport
    Given admin is on the transports management page
    When admin selects an active transport
    And admin clicks the deactivate button
    Then transport status should change to Inactive
    And transport should not be visible on transport page

  Scenario: Delete Transport
    Given admin is on the transports management page
    When admin selects a transport
    And admin clicks the delete button
    And admin confirms deletion
    Then transport should be removed from the system
    And transport should not appear in the transports list

  Scenario: Filter Transports by Source
    Given admin is on the transports management page
    When admin selects a source location filter
    Then only transports from selected source should be displayed

  Scenario: Filter Transports by Destination
    Given admin is on the transports management page
    When admin selects a destination location filter
    Then only transports to selected destination should be displayed
