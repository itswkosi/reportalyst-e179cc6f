-- Create a secure function to validate share tokens and return project data
-- This function checks if a share token is valid without exposing the actual token values

CREATE OR REPLACE FUNCTION public.get_project_by_share_token(token uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  is_public boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.description,
    p.is_public,
    p.created_at,
    p.updated_at
  FROM public.projects p
  WHERE p.share_token = token
    AND p.is_public = true;
$$;

-- Grant execute permission to anonymous users for shared project access
GRANT EXECUTE ON FUNCTION public.get_project_by_share_token(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_project_by_share_token(uuid) TO authenticated;

-- Update the RLS policy to hide share_token from public SELECT queries
-- First drop the existing public policy
DROP POLICY IF EXISTS "Users can view shared projects" ON public.projects;

-- Create a new policy that allows viewing public projects but restricts columns
-- Since RLS can't restrict columns, we'll handle this differently:
-- 1. Keep RLS for row-level access
-- 2. Use database views or the secure function for public access

-- Recreate the policy for viewing shared projects (row access only)
CREATE POLICY "Users can view shared projects"
ON public.projects
FOR SELECT
USING (is_public = true);

-- Create a secure view that hides share_token for public access
CREATE OR REPLACE VIEW public.shared_projects_view AS
SELECT 
  id,
  name,
  description,
  is_public,
  created_at,
  updated_at,
  user_id
FROM public.projects
WHERE is_public = true;

-- Grant access to the view
GRANT SELECT ON public.shared_projects_view TO anon;
GRANT SELECT ON public.shared_projects_view TO authenticated;