# Beta content workflow

For now, all customer-facing travel content lives in:

- `src/data/travelCatalog.ts`

## What to edit there

- destinations
- activities
- accommodations
- transports

## Why this is the temporary solution

- one file controls the beta catalog
- easy for the team to update without an admin CMS
- quote submissions still go to Supabase separately

## Recommended next step later

When the beta proves the flow, move this catalog into a proper content source:

- Supabase tables
- a lightweight admin tool
- or a headless CMS