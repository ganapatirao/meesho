Feature: Advertising User Flow

  Scenario: Browse Ads
    Given user is on the advertising page
    When user views the ads list
    Then user should see all active ads
    And each ad should show title, price, and image

  Scenario: Filter Ads by Category
    Given user is on the advertising page
    When user selects a category filter
    Then only ads from selected category should be displayed

  Scenario: Filter Ads by Subcategory
    Given user is on the advertising page
    When user selects a subcategory filter
    Then only ads from selected subcategory should be displayed

  Scenario: View Ad Details
    Given user is on the advertising page
    When user clicks on an ad
    Then user should see ad details
    And user should see ad description
    And user should see ad images
    And user should see seller contact information

  Scenario: Search Ads
    Given user is on the advertising page
    When user enters search keywords
    Then ads matching the search should be displayed

  Scenario: Post New Ad
    Given user is logged in
    When user navigates to post ad page
    And user enters ad title
    And user enters ad description
    And user enters ad price
    And user selects category
    And user selects subcategory
    And user uploads ad image
    And user enters contact information
    And user clicks post ad
    Then ad should be created successfully
    And ad should appear in ads list

  Scenario: Edit Own Ad
    Given user is logged in
    And user has posted an ad
    When user navigates to my ads
    And user selects an ad to edit
    And user modifies ad details
    And user clicks save
    Then ad should be updated successfully

  Scenario: Delete Own Ad
    Given user is logged in
    And user has posted an ad
    When user navigates to my ads
    And user selects an ad to delete
    And user confirms deletion
    Then ad should be removed from system

  Scenario: Contact Seller
    Given user is viewing an ad
    When user clicks contact seller button
    Then user should see seller contact information
    Or user should be able to send message to seller
