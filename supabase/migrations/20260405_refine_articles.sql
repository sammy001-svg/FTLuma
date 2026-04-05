-- FTLuma Schema Refinement

-- Add is_featured and read_time to articles
ALTER TABLE articles 
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN read_time TEXT DEFAULT '5 min read';

-- Refresh RLS for the new columns (automatically accessible if defined in column list)

-- Migrate existing seed data if necessary (already seeded authors and categories in previous step)
