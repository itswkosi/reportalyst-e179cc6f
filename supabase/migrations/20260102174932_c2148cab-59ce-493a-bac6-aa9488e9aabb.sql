-- Add missing INSERT policy - prevent manual token creation (rely on trigger only)
CREATE POLICY "Only system can create share tokens"
  ON public.project_share_tokens FOR INSERT
  WITH CHECK (false);

-- Add missing DELETE policy - only project owners can delete their tokens
CREATE POLICY "Owners can delete their project tokens"
  ON public.project_share_tokens FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_share_tokens.project_id AND p.user_id = auth.uid()
  ));