Feature: Shopping User Flow

  Scenario: Browse Products
    Given user is on the shopping page
    When user views the products list
    Then user should see all active products
    And products should be sorted by display sequence
    And each product should show name, price, and image

  Scenario: Filter Products by Category
    Given user is on the shopping page
    When user selects a category filter
    Then only products from selected category should be displayed

  Scenario: View Product Details
    Given user is on the shopping page
    When user clicks on a product
    Then user should see product details
    And user should see product images
    And user should see product description
    And user should see product pros and cons
    And user should see product reviews

  Scenario: Add Product to Cart
    Given user is logged in
    And user is viewing a product
    When user clicks the "Add to Cart" button
    Then product should be added to cart
    And cart item count should increase

  Scenario: View Cart
    Given user is logged in
    When user navigates to cart page
    Then user should see all cart items
    And user should see item quantities
    And user should see total price

  Scenario: Update Cart Item Quantity
    Given user is logged in
    And user has items in cart
    When user changes item quantity
    Then cart should be updated
    And total price should be recalculated

  Scenario: Remove Item from Cart
    Given user is logged in
    And user has items in cart
    When user clicks remove button on an item
    Then item should be removed from cart
    And cart should be updated

  Scenario: Proceed to Checkout
    Given user is logged in
    And user has items in cart
    When user clicks the checkout button
    Then user should be redirected to checkout page
    And user should see shipping step

  Scenario: Complete Shipping Step
    Given user is on checkout shipping step
    When user enters shipping information
    And user validates all fields
    And user clicks continue
    Then user should proceed to billing step

  Scenario: Complete Billing Step
    Given user is on checkout billing step
    When user enters billing information
    Or user selects "Same as Shipping"
    And user validates all fields
    And user clicks continue
    Then user should proceed to payment step

  Scenario: Complete Payment Step
    Given user is on checkout payment step
    When user selects payment method
    And user enters payment details
    And user validates all fields
    And user clicks continue
    Then user should proceed to review step

  Scenario: Review Order
    Given user is on checkout review step
    When user reviews shipping address
    And user reviews billing address
    And user reviews payment method
    And user reviews order items
    And user reviews order summary
    And user accepts terms and conditions
    And user clicks place order
    Then order should be created successfully
    And user should be redirected to confirmation page

  Scenario: View Order Confirmation
    Given user has placed an order
    When user views confirmation page
    Then user should see order ID
    And user should see order details
    And user should see estimated delivery date

  Scenario: View Order History
    Given user is logged in
    When user navigates to order history
    Then user should see all past orders
    And user should see order status
    And user should be able to view order details

  Scenario: Submit Product Review
    Given user is logged in
    And user has purchased a product
    When user navigates to product page
    And user clicks write review
    And user enters review details
    And user submits review
    Then review should be saved
    And product rating should be updated
