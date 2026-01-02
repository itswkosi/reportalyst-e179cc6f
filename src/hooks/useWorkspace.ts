import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useProfile } from "./useProfile";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  share_token: string | null;
  is_public: boolean;
  created_at: string;
}

export interface Analysis {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
}

export interface Dataset {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Section {
  id: string;
  analysis_id: string;
  title: string;
  content: string | null;
  section_order: number;
}

export const useWorkspace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, updateLastProject } = useProfile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [initialProjectRestored, setInitialProjectRestored] = useState(false);

  // Wrapper to also save last project to profile
  const setSelectedProjectId = useCallback((id: string | null) => {
    setSelectedProjectIdState(id);
    if (id) {
      updateLastProject(id);
    }
  }, [updateLastProject]);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast({
        title: "Failed to load projects",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch analyses and datasets for selected project
  const fetchProjectContent = useCallback(async () => {
    if (!selectedProjectId) {
      setAnalyses([]);
      setDatasets([]);
      return;
    }

    try {
      const [analysesRes, datasetsRes] = await Promise.all([
        supabase
          .from("analyses")
          .select("*")
          .eq("project_id", selectedProjectId)
          .order("created_at", { ascending: true }),
        supabase
          .from("datasets")
          .select("*")
          .eq("project_id", selectedProjectId)
          .order("created_at", { ascending: true }),
      ]);

      if (analysesRes.error) throw analysesRes.error;
      if (datasetsRes.error) throw datasetsRes.error;

      setAnalyses(analysesRes.data || []);
      setDatasets(datasetsRes.data || []);
    } catch (error) {
      toast({
        title: "Failed to load project content",
        description: "Please try selecting the project again",
        variant: "destructive",
      });
    }
  }, [selectedProjectId, toast]);

  // Fetch sections for selected analysis
  const fetchSections = useCallback(async () => {
    if (!selectedAnalysisId) {
      setSections([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("analysis_id", selectedAnalysisId)
        .order("section_order", { ascending: true });
      
      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      toast({
        title: "Failed to load sections",
        description: "Please try selecting the analysis again",
        variant: "destructive",
      });
    }
  }, [selectedAnalysisId, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Restore last opened project after projects are loaded
  useEffect(() => {
    if (!initialProjectRestored && projects.length > 0 && profile?.last_project_id) {
      const lastProject = projects.find(p => p.id === profile.last_project_id);
      if (lastProject) {
        setSelectedProjectIdState(lastProject.id);
      }
      setInitialProjectRestored(true);
    } else if (!initialProjectRestored && projects.length > 0) {
      setInitialProjectRestored(true);
    }
  }, [projects, profile?.last_project_id, initialProjectRestored]);

  useEffect(() => {
    fetchProjectContent();
  }, [fetchProjectContent]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Project CRUD
  const createProject = async (name?: string, description?: string) => {
    if (!user) return null;
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({ 
          user_id: user.id, 
          name: name || "Untitled Project",
          description 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Optimistically add to start of list
      setProjects((prev) => [data, ...prev]);
      setSelectedProjectId(data.id);
      
      toast({
        title: "Project created",
        description: `"${data.name}" has been created`,
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Failed to create project",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<Pick<Project, "name" | "description" | "is_public">>) => {
    // Optimistic update
    const previousProjects = [...projects];
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    
    try {
      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    } catch (error) {
      // Rollback on error
      setProjects(previousProjects);
      toast({
        title: "Failed to update project",
        description: "Your changes could not be saved",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (id: string) => {
    // Optimistic update
    const previousProjects = [...projects];
    setProjects((prev) => prev.filter((p) => p.id !== id));
    
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
      setSelectedAnalysisId(null);
    }
    
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      
      toast({
        title: "Project deleted",
      });
    } catch (error) {
      // Rollback on error
      setProjects(previousProjects);
      toast({
        title: "Failed to delete project",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Analysis CRUD
  const createAnalysis = async (name?: string) => {
    if (!selectedProjectId) return null;
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from("analyses")
        .insert({ project_id: selectedProjectId, name: name || "New Analysis" })
        .select()
        .single();
      
      if (error) throw error;
      
      setAnalyses((prev) => [...prev, data]);
      setSelectedAnalysisId(data.id);
      
      return data;
    } catch (error) {
      toast({
        title: "Failed to create analysis",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateAnalysis = async (id: string, name: string) => {
    // Optimistic update
    const previousAnalyses = [...analyses];
    setAnalyses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, name } : a))
    );
    
    try {
      const { error } = await supabase
        .from("analyses")
        .update({ name })
        .eq("id", id);
      
      if (error) throw error;
    } catch (error) {
      // Rollback
      setAnalyses(previousAnalyses);
      toast({
        title: "Failed to update analysis",
        description: "Your changes could not be saved",
        variant: "destructive",
      });
    }
  };

  const deleteAnalysis = async (id: string) => {
    // Optimistic update
    const previousAnalyses = [...analyses];
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
    
    if (selectedAnalysisId === id) {
      setSelectedAnalysisId(null);
    }
    
    try {
      const { error } = await supabase.from("analyses").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      // Rollback
      setAnalyses(previousAnalyses);
      toast({
        title: "Failed to delete analysis",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Dataset CRUD
  const createDataset = async (name?: string) => {
    if (!selectedProjectId) return null;
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from("datasets")
        .insert({ project_id: selectedProjectId, name: name || "Untitled Dataset" })
        .select()
        .single();
      
      if (error) throw error;
      
      setDatasets((prev) => [...prev, data]);
      return data;
    } catch (error) {
      toast({
        title: "Failed to create dataset",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateDataset = async (id: string, updates: Partial<Pick<Dataset, "name" | "description">>) => {
    // Optimistic update
    const previousDatasets = [...datasets];
    setDatasets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    
    try {
      const { error } = await supabase
        .from("datasets")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    } catch (error) {
      // Rollback
      setDatasets(previousDatasets);
      toast({
        title: "Failed to update dataset",
        description: "Your changes could not be saved",
        variant: "destructive",
      });
    }
  };

  const deleteDataset = async (id: string) => {
    // Optimistic update
    const previousDatasets = [...datasets];
    setDatasets((prev) => prev.filter((d) => d.id !== id));
    
    try {
      const { error } = await supabase.from("datasets").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      // Rollback
      setDatasets(previousDatasets);
      toast({
        title: "Failed to delete dataset",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Section CRUD
  const createSection = async (title?: string) => {
    if (!selectedAnalysisId) return null;
    setIsSaving(true);
    
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.section_order), -1);
    
    try {
      const { data, error } = await supabase
        .from("sections")
        .insert({
          analysis_id: selectedAnalysisId,
          title: title || "New Section",
          section_order: maxOrder + 1,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setSections((prev) => [...prev, data]);
      return data;
    } catch (error) {
      toast({
        title: "Failed to create section",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateSection = async (id: string, updates: Partial<Pick<Section, "title" | "content" | "section_order">>) => {
    // Optimistic update
    const previousSections = [...sections];
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    
    try {
      const { error } = await supabase
        .from("sections")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    } catch (error) {
      // Rollback
      setSections(previousSections);
      toast({
        title: "Failed to update section",
        description: "Your changes could not be saved",
        variant: "destructive",
      });
    }
  };

  const deleteSection = async (id: string) => {
    // Optimistic update
    const previousSections = [...sections];
    setSections((prev) => prev.filter((s) => s.id !== id));
    
    try {
      const { error } = await supabase.from("sections").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      // Rollback
      setSections(previousSections);
      toast({
        title: "Failed to delete section",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const reorderSections = async (reorderedSections: Section[]) => {
    // Optimistic update
    const previousSections = [...sections];
    setSections(reorderedSections);
    
    try {
      const updates = reorderedSections.map((s, i) => ({
        id: s.id,
        section_order: i,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from("sections")
          .update({ section_order: update.section_order })
          .eq("id", update.id);
        
        if (error) throw error;
      }
    } catch (error) {
      // Rollback
      setSections(previousSections);
      toast({
        title: "Failed to reorder sections",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;
  const selectedAnalysis = analyses.find((a) => a.id === selectedAnalysisId) || null;

  return {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    selectedAnalysis,
    selectedAnalysisId,
    setSelectedAnalysisId,
    analyses,
    datasets,
    sections,
    loading,
    isSaving,
    createProject,
    updateProject,
    deleteProject,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
    createDataset,
    updateDataset,
    deleteDataset,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    refetch: fetchProjects,
  };
};
