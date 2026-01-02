-- Drop the security definer view as it's flagged by the linter
DROP VIEW IF EXISTS public.shared_projects_view;

-- The secure function approach is sufficient - it validates tokens
-- without exposing them and returns only safe columns