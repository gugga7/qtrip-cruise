# QTRIP Routes Documentation

## Overview
This document outlines the routing structure of the QTRIP application, including both main user routes and admin routes.

## Main Routes

### User Flow Routes
1. `/` - Home page
2. `/preferences` - Trip preferences selection
3. `/activities` - Activity selection and customization
4. `/schedule` - Schedule planning and optimization
5. `/accommodation` - Accommodation selection
6. `/transport` - Transport options and booking
7. `/review` - Trip review and booking confirmation

### User Management Routes
- `/login` - User authentication
- `/profile` - User profile management

## Admin Routes
All admin routes are prefixed with `/admin`

### Core Admin Routes
1. `/admin` - Admin dashboard
2. `/admin/cities` - City management
3. `/admin/products` - Product management
4. `/admin/ai-config` - AI configuration settings

## Route Features

### Main Routes
- Progressive navigation through trip planning steps
- Persistent state management across routes
- Responsive layouts with trip summary sidebar
- AI-powered optimization integration

### Admin Routes
- Protected routes requiring authentication
- Centralized management interface
- Data management capabilities
- System configuration options

## Navigation

### User Navigation
- Step-by-step progression through trip planning
- Ability to move back and forth between steps
- Persistent trip summary view
- Progress tracking

### Admin Navigation
- Sidebar navigation menu
- Quick access to all admin functions
- Dashboard overview
- Data management tools

## Testing Routes
A dedicated Routes page has been created at `/routes` that provides:
- Direct links to all available routes
- Visual organization of routes by category
- Path information for each route
- Access level indicators

## Route Protection
- Admin routes are protected by authentication
- User flow routes maintain state consistency
- Invalid routes redirect to home page
- Session management integration

## Technical Implementation
- React Router v6
- Centralized route configuration
- Component-based route rendering
- Nested route support for admin section

## Future Route Additions
1. Specialized variant routes:
   - Hen Do Planner routes
   - Space Venue Planner routes
   - Diet & Fitness Planner routes
   - Corporate Retreat routes
   - Wellness Retreat routes
   - Family Reunion routes
   - Wedding Planner routes

2. Additional planned routes:
   - Payment processing
   - Notification management
   - Multi-language support
   - Offline mode
   - Analytics dashboard 