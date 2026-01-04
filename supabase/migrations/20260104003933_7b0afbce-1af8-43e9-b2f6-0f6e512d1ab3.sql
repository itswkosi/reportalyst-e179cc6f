-- Add labels column to analyses table for report management
ALTER TABLE public.analyses 
ADD COLUMN labels text[] DEFAULT '{}';

-- Add analysis_summary column to persist the plain-language summary
ALTER TABLE public.analyses 
ADD COLUMN analysis_summary text;

-- Create GIN index for efficient label filtering
CREATE INDEX idx_analyses_labels ON public.analyses USING GIN (labels);

-- Create full-text search index for searching across analysis content
CREATE INDEX idx_analyses_fulltext ON public.analyses 
  USING GIN (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(analysis_explicit, '') || ' ' || COALESCE(analysis_implied, '') || ' ' || COALESCE(analysis_hedging, '') || ' ' || COALESCE(analysis_summary, '')));