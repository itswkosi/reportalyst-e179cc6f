-- Add columns to store AI analysis results per analysis notebook
ALTER TABLE public.analyses
ADD COLUMN analysis_explicit TEXT,
ADD COLUMN analysis_implied TEXT,
ADD COLUMN analysis_hedging TEXT,
ADD COLUMN analyzed_at TIMESTAMP WITH TIME ZONE;