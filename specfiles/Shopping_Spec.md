# Shopping - High Level Specification

## Overview
Users can browse products, add to cart, and complete checkout process for purchasing items.

## Core Features

### 1. Product Browsing
- View all active products
- Filter products by category
- Search products by name
- View product details (images, description, price, stock)
- View product reviews and ratings
- View product pros and cons
- Sort products by price, rating, or display sequence

### 2. Cart Management
- Add products to cart
- View cart items
- Update item quantities
- Remove items from cart
- Clear entire cart
- View cart total with tax and shipping

### 3. Checkout Process
- **Shipping Step**: Enter shipping address, contact info
- **Billing Step**: Enter billing address or use same as shipping
- **Payment Step**: Select payment method, enter payment details
- **Review Step**: Review all order details before confirmation
- **Confirmation**: Receive order confirmation with order ID

### 4. Order Management
- View order history
- Track order status
- View order details
- Cancel pending orders

### 5. Product Reviews
- Submit product reviews after purchase
- Rate products (1-5 stars)
- Write review comments
- View other user reviews

## Business Rules
- User must be logged in to add to cart
- User must be logged in to checkout
- Stock must be available for purchase
- Reviews can only be submitted after purchase
- One review per product per user
- Order confirmation sends email notification
- Tax calculated at 18%
- Shipping fees based on order value

## User Experience
- Products sorted by display sequence
- Categories filter products dynamically
- Real-time cart updates
- Form validation on blur
- Error messages for invalid inputs
- Order tracking available
