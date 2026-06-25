# Users Management - High Level Specification

## Overview
Admin can manage all registered users in the system, including activation, deactivation, and role management.

## Core Features

### 1. View Users
- List all registered users
- View user details (name, email, phone, registration date)
- Filter users by status (active/inactive)
- Search users by name or email
- Pagination for large user lists

### 2. User Status Management
- Activate user accounts
- Deactivate user accounts
- View user activity status
- Bulk activate/deactivate operations

### 3. User Details
- View user profile information
- View user order history
- View user posting history (ads, reviews)
- View user login history

### 4. User Roles
- Assign admin role to users
- Remove admin role from users
- View current user roles

## Business Rules
- Only admins can manage other users
- Super admin cannot be deactivated
- Deactivated users cannot login
- User data is retained even when deactivated
- Role changes require confirmation

## Security
- User management requires admin authentication
- Audit log for all user status changes
- Sensitive data (passwords) not visible
- Role changes logged for security
