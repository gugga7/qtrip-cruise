# Supabase Migration Strategy

## Current Status Analysis
- Frontend design and UX is well developed
- Using mock data for development
- Core functionality working with mock data
- Navigation and validation needs improvement

## Migration Strategy

### Phase 1: Continue with Mock Data (Current Phase)
- [x] Keep developing with mock data
- [x] Complete all UI/UX features
- [x] Finalize user flow
- [ ] Complete all validations
- [ ] Fix navigation issues
- [ ] Complete drag-and-drop functionality

### Phase 2: Supabase Setup (Parallel Development)

#### 1. Database Schema
```sql
-- Destinations
create table destinations (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null,
    country varchar not null,
    description text,
    image_url text,
    created_at timestamptz default now()
);

-- Activities
create table activities (
    id uuid default uuid_generate_v4() primary key,
    title varchar not null,
    description text,
    duration integer not null,
    price decimal not null,
    category varchar not null,
    main_image_url text,
    gallery_urls text[],
    destination_id uuid references destinations(id),
    created_at timestamptz default now()
);

-- Accommodations
create table accommodations (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null,
    type varchar not null,
    description text,
    price_per_night decimal not null,
    rating decimal,
    amenities text[],
    main_image_url text,
    gallery_urls text[],
    destination_id uuid references destinations(id),
    created_at timestamptz default now()
);

-- Transport
create table transport (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null,
    type varchar not null,
    provider varchar,
    price decimal not null,
    duration varchar,
    description text,
    features text[],
    vehicle_image_url text,
    interior_images_urls text[],
    destination_id uuid references destinations(id),
    created_at timestamptz default now()
);
```

#### 2. Environment Setup
```bash
# .env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 3. Type Definitions
```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: string
          name: string
          country: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          name: string
          country: string
          description?: string
          image_url?: string
        }
        Update: {
          name?: string
          country?: string
          description?: string
          image_url?: string
        }
      }
      // Similar for activities, accommodations, transport
    }
  }
}
```

### Phase 3: Integration Steps

1. **Setup Supabase Client**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
```

2. **Create Data Hooks**
```typescript
// hooks/useSupabase.ts
export function useDestinations() {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
      if (error) throw error
      return data
    }
  })
}
```

### Phase 4: Admin Interface Development

1. **Basic Structure**
```typescript
/admin
├── components/
│   ├── DataTable.tsx
│   ├── EditForm.tsx
│   └── MediaUpload.tsx
├── pages/
│   ├── destinations/
│   ├── activities/
│   ├── accommodations/
│   └── transport/
```

## Timeline

### Week 1: Frontend Completion
- Complete all UI/UX features
- Fix navigation issues
- Complete validation

### Week 2: Supabase Setup
- Create Supabase project
- Set up database schema
- Create initial data migration scripts

### Week 3: Integration
- Implement Supabase client
- Create data hooks
- Replace mock data gradually

### Week 4: Admin Interface
- Create basic CRUD interface
- Implement media uploads
- Test all functionality

## Success Metrics
1. API response times < 200ms
2. Zero TypeScript errors
3. All CRUD operations working
4. Successful data migration
5. Admin interface functional

## Next Steps
1. Complete current UI development
2. Set up Supabase project
3. Begin admin interface development
4. Create test data migration scripts
```

Would you like me to:
1. Add more detail to any specific phase?
2. Create example components for the admin interface?
3. Add more specific type definitions?
