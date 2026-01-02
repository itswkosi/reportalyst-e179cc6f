-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  description TEXT,
  share_token UUID DEFAULT gen_random_uuid(),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analyses table (notebooks within projects)
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'New Analysis',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create datasets table
CREATE TABLE public.datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Dataset',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sections table (content within analyses)
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Section',
  content TEXT,
  section_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Projects policies (owner + shared access)
CREATE POLICY "Users can view their own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared projects" ON public.projects
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Analyses policies (based on project ownership)
CREATE POLICY "Users can view analyses of their projects" ON public.analyses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can view analyses of shared projects" ON public.analyses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND is_public = true)
  );

CREATE POLICY "Users can insert analyses in their projects" ON public.analyses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update analyses in their projects" ON public.analyses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete analyses in their projects" ON public.analyses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

-- Datasets policies (based on project ownership)
CREATE POLICY "Users can view datasets of their projects" ON public.datasets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can view datasets of shared projects" ON public.datasets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND is_public = true)
  );

CREATE POLICY "Users can insert datasets in their projects" ON public.datasets
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update datasets in their projects" ON public.datasets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete datasets in their projects" ON public.datasets
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
  );

-- Sections policies (based on project ownership via analysis)
CREATE POLICY "Users can view sections of their analyses" ON public.sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.analyses a
      JOIN public.projects p ON a.project_id = p.id
      WHERE a.id = analysis_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view sections of shared analyses" ON public.sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.analyses a
      JOIN public.projects p ON a.project_id = p.id
      WHERE a.id = analysis_id AND p.is_public = true
    )
  );

CREATE POLICY "Users can insert sections in their analyses" ON public.sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analyses a
      JOIN public.projects p ON a.project_id = p.id
      WHERE a.id = analysis_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sections in their analyses" ON public.sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.analyses a
      JOIN public.projects p ON a.project_id = p.id
      WHERE a.id = analysis_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sections in their analyses" ON public.sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.analyses a
      JOIN public.projects p ON a.project_id = p.id
      WHERE a.id = analysis_id AND p.user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON public.analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at
  BEFORE UPDATE ON public.datasets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();