# Movies - High Level Specification

## Overview
Users can browse movie listings, view showtimes, book tickets, and manage their movie bookings.

## Core Features

### 1. Browse Movies
- View all active movies
- Filter movies by genre (action, comedy, drama, horror, etc.)
- Filter movies by language
- Search movies by title or actor
- View movie details (title, description, cast, crew, rating, duration)
- View showtimes and schedules
- View movie poster and trailers
- Sort by rating, release date, or popularity

### 2. Book Movie Tickets
- Select movie
- Select showtime
- Select number of tickets
- Select seats from seating layout
- View booking summary
- Make payment
- Receive booking confirmation
- Generate e-ticket

### 3. My Bookings
- View all movie bookings
- View booking details (movie, showtime, seats, total)
- View booking status (confirmed, cancelled, completed)
- Cancel bookings (if allowed)
- View booking history
- Download e-ticket

### 4. Movie Categories
- Action
- Comedy
- Drama
- Horror
- Thriller
- Romance
- Sci-Fi
- Animation
- Documentary
- Others

## Business Rules
- User must be logged in to book
- Seat selection required
- Cancellation policy applies (time-based)
- Refund policy varies by showtime
- Booking confirmation sent via email
- Seat availability tracked in real-time
- No overbooking allowed
- Age restrictions for certain movies

## User Experience
- Genre-based filtering
- Showtime selection
- Interactive seat selection
- E-ticket with QR code
- Easy cancellation process
