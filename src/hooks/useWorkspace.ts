import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  share_token: string;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }, [user]);

  // Fetch analyses and datasets for selected project
  const fetchProjectContent = useCallback(async () => {
    if (!selectedProjectId) {
      setAnalyses([]);
      setDatasets([]);
      return;
    }

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

    setAnalyses(analysesRes.data || []);
    setDatasets(datasetsRes.data || []);
  }, [selectedProjectId]);

  // Fetch sections for selected analysis
  const fetchSections = useCallback(async () => {
    if (!selectedAnalysisId) {
      setSections([]);
      return;
    }

    const { data } = await supabase
      .from("sections")
      .select("*")
      .eq("analysis_id", selectedAnalysisId)
      .order("section_order", { ascending: true });
    setSections(data || []);
  }, [selectedAnalysisId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjectContent();
  }, [fetchProjectContent]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Project CRUD
  const createProject = async (name?: string, description?: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("projects")
      .insert({ 
        user_id: user.id, 
        name: name || "Untitled Project",
        description 
      })
      .select()
      .single();
    if (!error && data) {
      setProjects((prev) => [data, ...prev]);
      setSelectedProjectId(data.id);
    }
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Pick<Project, "name" | "description" | "is_public">>) => {
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id);
    if (!error) {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    }
  };

  const deleteProject = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
      setSelectedAnalysisId(null);
    }
  };

  // Analysis CRUD
  const createAnalysis = async (name?: string) => {
    if (!selectedProjectId) return null;
    const { data, error } = await supabase
      .from("analyses")
      .insert({ project_id: selectedProjectId, name: name || "New Analysis" })
      .select()
      .single();
    if (!error && data) {
      setAnalyses((prev) => [...prev, data]);
      setSelectedAnalysisId(data.id);
    }
    return data;
  };

  const updateAnalysis = async (id: string, name: string) => {
    const { error } = await supabase
      .from("analyses")
      .update({ name })
      .eq("id", id);
    if (!error) {
      setAnalyses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, name } : a))
      );
    }
  };

  const deleteAnalysis = async (id: string) => {
    await supabase.from("analyses").delete().eq("id", id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAnalysisId === id) {
      setSelectedAnalysisId(null);
    }
  };

  // Dataset CRUD
  const createDataset = async (name?: string) => {
    if (!selectedProjectId) return null;
    const { data, error } = await supabase
      .from("datasets")
      .insert({ project_id: selectedProjectId, name: name || "Untitled Dataset" })
      .select()
      .single();
    if (!error && data) {
      setDatasets((prev) => [...prev, data]);
    }
    return data;
  };

  const updateDataset = async (id: string, updates: Partial<Pick<Dataset, "name" | "description">>) => {
    const { error } = await supabase
      .from("datasets")
      .update(updates)
      .eq("id", id);
    if (!error) {
      setDatasets((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
      );
    }
  };

  const deleteDataset = async (id: string) => {
    await supabase.from("datasets").delete().eq("id", id);
    setDatasets((prev) => prev.filter((d) => d.id !== id));
  };

  // Section CRUD
  const createSection = async (title?: string) => {
    if (!selectedAnalysisId) return null;
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.section_order), -1);
    const { data, error } = await supabase
      .from("sections")
      .insert({
        analysis_id: selectedAnalysisId,
        title: title || "New Section",
        section_order: maxOrder + 1,
      })
      .select()
      .single();
    if (!error && data) {
      setSections((prev) => [...prev, data]);
    }
    return data;
  };

  const updateSection = async (id: string, updates: Partial<Pick<Section, "title" | "content" | "section_order">>) => {
    const { error } = await supabase
      .from("sections")
      .update(updates)
      .eq("id", id);
    if (!error) {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    }
  };

  const deleteSection = async (id: string) => {
    await supabase.from("sections").delete().eq("id", id);
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const reorderSections = async (reorderedSections: Section[]) => {
    setSections(reorderedSections);
    const updates = reorderedSections.map((s, i) => ({
      id: s.id,
      section_order: i,
    }));
    for (const update of updates) {
      await supabase
        .from("sections")
        .update({ section_order: update.section_order })
        .eq("id", update.id);
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
  };
};
