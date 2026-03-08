# Supabase Integration Guide

## Setup & Configuration

### Initial Setup
```bash
# Install Supabase client
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react

# Install type generator
npm install supabase-type-generator --save-dev
```

### Environment Configuration
```bash
# .env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For admin operations
```

## Database Structure

### Core Tables
```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- Enable Row Level Security (RLS)
alter table destinations enable row level security;
alter table activities enable row level security;
alter table accommodations enable row level security;
alter table transport enable row level security;

-- Create policies
create policy "Public destinations are viewable by everyone"
  on destinations for select
  using ( true );

create policy "Destinations are insertable by admin"
  on destinations for insert
  with check ( auth.role() = 'admin' );
```

### Relationships & Foreign Keys
```sql
-- Add foreign key constraints with cascading delete
alter table activities
  add constraint fk_destination
  foreign key (destination_id)
  references destinations(id)
  on delete cascade;

-- Add indexes for better performance
create index idx_activities_destination
  on activities(destination_id);

create index idx_accommodations_destination
  on accommodations(destination_id);
```

## Type Safety

### Generate Types
```typescript
// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: string
          name: string
          country: string
          description: string | null
          coordinates: unknown | null
          created_at: string
        }
        Insert: {
          name: string
          country: string
          description?: string | null
          coordinates?: unknown | null
        }
        Update: {
          name?: string
          country?: string
          description?: string | null
          coordinates?: unknown | null
        }
      }
      // ... other tables
    }
    Views: {
      // Define any views here
    }
    Functions: {
      // Define any functions here
    }
  }
}
```

## Data Access Patterns

### Custom Hooks
```typescript
// hooks/useSupabase.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useDestinations() {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select(`
          id,
          name,
          country,
          description,
          activities (
            id,
            title,
            duration,
            price
          )
        `);
      
      if (error) throw error;
      return data;
    }
  });
}

export function useAddDestination() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newDestination) => {
      const { data, error } = await supabase
        .from('destinations')
        .insert(newDestination)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['destinations']);
    }
  });
}
```

### Error Handling
```typescript
// utils/supabaseErrors.ts
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public details: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function handleSupabaseError(error: any) {
  if (error.code === 'PGRST301') {
    return new SupabaseError(
      'Row not found',
      error.code,
      error.details
    );
  }
  // ... handle other error types
}
```

## Caching Strategy

### Query Configuration
```typescript
// config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});
```

## Real-time Subscriptions

### Setup Subscriptions
```typescript
// hooks/useRealtimeData.ts
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeDestinations() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .channel('public:destinations')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'destinations' 
        }, 
        (payload) => {
          queryClient.invalidateQueries(['destinations']);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);
}
```

## Performance Optimization

### Pagination
```typescript
export function usePagedDestinations(page: number, pageSize: number) {
  return useQuery({
    queryKey: ['destinations', page, pageSize],
    queryFn: async () => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      const { data, error, count } = await supabase
        .from('destinations')
        .select('*', { count: 'exact' })
        .range(start, end);

      if (error) throw error;
      return { data, count };
    }
  });
}
```

### Infinite Loading
```typescript
export function useInfiniteDestinations() {
  return useInfiniteQuery({
    queryKey: ['destinations-infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .range(pageParam * 10, (pageParam + 1) * 10 - 1);

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 10 ? pages.length : undefined;
    }
  });
}
```

## Security Best Practices

### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
alter table destinations enable row level security;

-- Create policies
create policy "Public read access"
  on destinations for select
  using ( true );

create policy "Admin write access"
  on destinations for insert update delete
  using ( auth.role() = 'admin' );
```

### Type-safe Queries
```typescript
// Always use type-safe queries
const { data, error } = await supabase
  .from('destinations')
  .select('id, name, country')
  .eq('id', destinationId)
  .single();

// Never use raw SQL unless absolutely necessary
```

## Testing

### Mock Supabase Client
```typescript
// tests/mocks/supabase.ts
export const mockSupabase = {
  from: (table: string) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockData, error: null })
  })
};
```

### Integration Tests
```typescript
describe('Destination API', () => {
  it('should fetch destinations', async () => {
    const { result } = renderHook(() => useDestinations());
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toHaveLength(2);
  });
});
```

Would you like me to:
1. Add more examples for specific use cases?
2. Add deployment configuration details?
3. Add more security best practices?
