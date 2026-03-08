# Contributing to QTrip

## Development Process
1. Fork the repository
2. Create a feature branch using the format: `feature/feature-name` or `fix/bug-name`
3. Make your changes
4. Test your changes locally
5. Submit a pull request with a detailed description

### Branch Naming Convention
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions/updates

## Code Style

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Define interfaces for all props
- Use type guards where necessary
- Avoid `any` types

Example:
```typescript
// Good
interface ButtonProps {
  onClick: () => void;
  label: string;
  variant?: 'primary' | 'secondary';
}

// Bad
interface ButtonProps {
  [key: string]: any;
}
```

### Component Structure
```typescript
// components/MyComponent/index.tsx
import { useState, useEffect } from 'react';
import type { MyComponentProps } from './types';
import { useStyles } from './styles';

export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // State declarations
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Render helpers
  const renderSection = () => {
    return <div>Section</div>;
  };

  // Main render
  return (
    <div>
      {renderSection()}
    </div>
  );
}
```

### TailwindCSS
- Use utility classes
- Create reusable component classes
- Follow mobile-first approach
- Use consistent spacing scale

Example:
```typescript
// Good
<div className="p-4 md:p-6 lg:p-8 space-y-4 rounded-lg shadow-md">

// Bad
<div className="padding-20px rounded-10px">
```

### Supabase Integration
- Use type-safe queries
- Handle errors properly
- Implement proper error boundaries
- Use optimistic updates where possible

Example:
```typescript
// Good
const { data, error } = await supabase
  .from('destinations')
  .select('id, name, country')
  .eq('id', destinationId)
  .single();

if (error) {
  throw new Error(`Failed to fetch destination: ${error.message}`);
}

// Bad
const { data } = await supabase
  .from('destinations')
  .select('*');
```

## Testing

### Unit Tests
- Test all utilities
- Test hooks in isolation
- Use React Testing Library
- Write meaningful assertions

Example:
```typescript
describe('useDestination', () => {
  it('should fetch destination data', async () => {
    const { result } = renderHook(() => useDestination(1));
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### Integration Tests
- Test component interactions
- Test data flow
- Test error states
- Test loading states

### Database Tests
- Test all CRUD operations
- Test constraints
- Test relationships
- Test edge cases

## Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Add usage examples
- Document props

Example:
```typescript
/**
 * Fetches destination data and related activities
 * @param destinationId - The ID of the destination
 * @returns Destination data with activities
 * @throws {Error} When destination not found
 */
async function fetchDestinationData(destinationId: string) {
  // Implementation
}
```

### Type Definitions
- Keep types up to date
- Document complex types
- Use descriptive names
- Add examples

Example:
```typescript
/**
 * Represents a travel destination
 * @example
 * {
 *   id: '123',
 *   name: 'Paris',
 *   country: 'France',
 *   activities: [...]
 * }
 */
interface Destination {
  id: string;
  name: string;
  country: string;
  activities: Activity[];
}
```

## Commit Messages
Follow conventional commits:
```bash
# Features
feat(scope): add new destination page
feat(ui): implement drag and drop in schedule

# Fixes
fix(api): handle network errors properly
fix(validation): correct date validation

# Documentation
docs(api): update Supabase integration guide
docs(setup): add development environment setup

# Style Changes
style(components): update button styling
style(layout): improve responsive design

# Refactoring
refactor(hooks): simplify data fetching logic
refactor(types): improve type safety

# Testing
test(utils): add tests for date utilities
test(components): add integration tests

# Maintenance
chore(deps): update dependencies
chore(build): optimize bundle size
```

## Development Setup
1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

4. Run tests:
```bash
npm test
```

## Getting Help
- Check existing issues
- Join our Discord channel
- Review documentation
- Ask in discussions