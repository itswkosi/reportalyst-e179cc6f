-- Add last_project_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN last_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;