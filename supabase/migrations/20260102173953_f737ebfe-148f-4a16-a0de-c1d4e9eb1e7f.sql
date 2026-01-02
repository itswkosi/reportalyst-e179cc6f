-- 1. Create separate table for share tokens with strict RLS
CREATE TABLE public.project_share_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  share_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Enable RLS - tokens are NEVER visible via direct queries
ALTER TABLE public.project_share_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Only project owners can manage their tokens (no SELECT for others!)
CREATE POLICY "Owners can view their project tokens"
  ON public.project_share_tokens FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_share_tokens.project_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Owners can update their project tokens"
  ON public.project_share_tokens FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_share_tokens.project_id AND p.user_id = auth.uid()
  ));

-- 4. Migrate existing tokens
INSERT INTO public.project_share_tokens (project_id, share_token)
SELECT id, share_token FROM public.projects WHERE share_token IS NOT NULL;

-- 5. Auto-create token on new project
CREATE OR REPLACE FUNCTION public.create_share_token_for_project()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.project_share_tokens (project_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_share_token_on_project_insert
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_share_token_for_project();

-- 6. Update RPC to use new table
CREATE OR REPLACE FUNCTION public.get_project_by_share_token(token uuid)
RETURNS TABLE(id uuid, name text, description text, is_public boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.id, p.name, p.description, p.is_public, p.created_at, p.updated_at
  FROM public.projects p
  INNER JOIN public.project_share_tokens pst ON pst.project_id = p.id
  WHERE pst.share_token = token AND p.is_public = true;
$$;

-- 7. Helper for owners to get their token
CREATE OR REPLACE FUNCTION public.get_my_project_share_token(p_project_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT pst.share_token
  FROM public.project_share_tokens pst
  INNER JOIN public.projects p ON p.id = pst.project_id
  WHERE pst.project_id = p_project_id AND p.user_id = auth.uid();
$$;

-- 8. Remove share_token from projects table
ALTER TABLE public.projects DROP COLUMN share_token;

-- 9. Add updated_at trigger
CREATE TRIGGER update_project_share_tokens_updated_at
  BEFORE UPDATE ON public.project_share_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();