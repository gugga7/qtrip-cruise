# Travel Planner Application

A comprehensive travel planning application built with React, TypeScript, and Strapi CMS.

## Features

### 1. Trip Planning Flow

#### Step 1: Preferences
- Destination selection with city images
- Date range picker with large calendar UI
- Number of travelers input
- Budget setting with per-person/total toggle
- Real-time validation and updates

#### Step 2: Activities
- Recommended activities based on preferences
- Category-based filtering
- Search functionality
- Quick add/remove with + and × buttons
- Group voting system with thumbs up
- Detailed activity modal with full information
- Real-time budget tracking

#### Step 3: Schedule
- Drag-and-drop activity scheduling
- Smart auto-scheduling feature
- Weather forecast integration
- Day-by-day planning with morning/afternoon/evening slots
- Quick remove activities with × button
- Activities return to "Available Activities" when removed

#### Step 4: Accommodation
- Visual accommodation cards with images
- Quick selection with + button
- Selected state with checkmark
- Detailed view in modal
- Filter by type and amenities
- Price per night display

#### Step 5: Transport
- Vehicle type selection
- Quick selection with + button
- Selected state with checkmark
- Detailed view in modal
- Features and pricing display

#### Step 6: Review & Book
- Complete trip summary
- Daily itinerary view
- Cost breakdown
- Travel documents section
- Additional comments field
- Final booking confirmation

### 2. Trip Summary
- Real-time updates as selections are made
- Collapsible sections (Activities collapsed by default)
- Weather forecast based on trip duration
- Budget tracking with progress bar
- Quick activity removal

### 3. Collaboration Features
- Invite collaborators
- Group voting on activities
- Expense splitting
- Real-time updates
- Chat functionality

## Technical Implementation

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- DND Kit for drag-and-drop
- React Query for data fetching
- Zustand for state management

### Backend (Strapi)
- Content Types:
  - Activities
  - Destinations
  - Accommodations
  - Transport
  - Bookings
  - Users
  - Collaborations
  - Expenses
  - Votes

## Remaining Tasks

1. Authentication
- Implement LoginForm component
- Implement RegisterForm component
- Complete auth integration with Strapi

2. Activity Filters
- Implement enhanced filter system
- Add price range filter
- Add duration filter
- Add rating filter

3. Collaboration Features
- Implement CollaborationPanel component
- Add real-time updates with WebSocket
- Implement chat functionality
- Add expense splitting

4. Booking System
- Complete booking flow
- Add payment integration
- Add booking confirmation emails
- Add booking management in profile

5. Profile Page
- Add booking history
- Add saved trips
- Add preferences management
- Add collaboration invites

6. Testing
- Add unit tests
- Add integration tests
- Add end-to-end tests

## Recent Updates

### 1. API Integration
- ✅ Centralized API configuration
- ✅ Environment variable validation
- ✅ Unified error handling
- ✅ Query function standardization

### 2. Loading States
- ✅ Added LoadingSpinner component
- ✅ Added ErrorMessage component
- ✅ Implemented loading states across all pages
- ✅ Added error boundaries

### 3. Form Validation
- ✅ Step validation implementation
- ✅ Toast notifications for errors
- ✅ Booking process validation

## Current Issues Fixed
- Fixed API_URL undefined error
- Standardized API calls across components
- Improved error handling and user feedback
- Added type safety for API responses

## Next Steps
1. Complete remaining API integrations:
   - Collaborations
   - Expenses
   - Votes

2. Implement missing features:
   - Weather forecast integration
   - Real-time updates
   - Chat functionality

3. Testing:
   - Add unit tests for API calls
   - Add integration tests for booking flow
   - Add error boundary tests

## Development Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Start Strapi CMS:
```bash
cd cms
npm run develop
```

## Environment Variables

Create a `.env` file with:
```
VITE_STRAPI_URL=http://localhost:1337
VITE_STRAPI_API_TOKEN=your_strapi_token_here
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License







I'll add a section to the README about the image handling fix we implemented. Here's what we should add:

```markdown:frontend/README.md
## Troubleshooting Guide

### Image Handling in Strapi API Responses

#### Issue: Missing Images in Transport API Response
When fetching transport data from Strapi, images were not appearing in the API response despite being properly uploaded in the Strapi admin interface.

#### Root Cause
1. The transport controller was using `strapi.db.query()` which doesn't automatically populate media fields
2. The response structure needed to be properly formatted with `attributes` and `data` nesting

#### Solution
1. Updated the transport controller to use `strapi.entityService.findMany()`:
```typescript:backend/src/api/transport/controllers/transport.ts
async find(ctx) {
  try {
    const entries = await strapi.entityService.findMany('api::transport.transport', {
      ...ctx.query,
      populate: {
        vehicleImage: true,
        interiorImages: true,
        destination: true
      }
    });

    const sanitizedEntries = await this.sanitizeOutput(entries, ctx);

    return {
      data: sanitizedEntries,
      meta: {
        pagination: {
          page: 1,
          pageSize: entries.length,
          pageCount: 1,
          total: entries.length
        }
      }
    };
  } catch (error) {
    console.error('Transport find error:', error);
    ctx.throw(500, error);
  }
}
```

2. Updated the frontend hook to handle the response structure:
```typescript:frontend/src/hooks/useStrapi.ts
export const useTransports = (destinationId?: number) => {
  return useQuery({
    queryKey: ['transports', destinationId],
    queryFn: async () => {
      const response = await apiHandler(strapiAPI.get('/transports', {
        params: {
          'populate': {
            vehicleImage: true,
            interiorImages: true,
            destination: true
          },
          ...(destinationId ? { 'filters[destination][id]': destinationId } : {})
        }
      }));

      return response.data.data.map((item: any) => {
        const data = item;
        // Transform response data...
      });
    }
  });
};
```

#### Key Learnings
1. Use `entityService.findMany()` instead of `db.query()` when working with media fields in Strapi
2. Always explicitly specify which fields to populate in the query
3. Ensure proper sanitization of the response using `sanitizeOutput()`
4. Match the frontend data transformation to Strapi's response structure

#### Related Files
- Transport Controller: `backend/src/api/transport/controllers/transport.ts`
- Transport Hook: `frontend/src/hooks/useStrapi.ts`
- Transport Types: `frontend/src/lib/types.ts`
```

This documentation will help the team understand:
1. What the issue was
2. How we fixed it
3. Best practices for handling similar issues
4. Where to find the relevant code

Would you like me to add any additional details to this documentation?




