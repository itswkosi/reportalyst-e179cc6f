import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Section {
  id: string;
  title: string;
  content: string | null;
  section_order: number;
}

interface Analysis {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
}

const SharedProject = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!shareToken) return;

    // Use the secure RPC function to validate share token
    // This never exposes share_token values in queries
    const { data: projectData, error: projectError } = await supabase
      .rpc("get_project_by_share_token", { token: shareToken })
      .maybeSingle();

    if (projectError || !projectData) {
      setError("Project not found or is not public");
      setLoading(false);
      return;
    }

    setProject(projectData);

    const { data: analysesData } = await supabase
      .from("analyses")
      .select("*")
      .eq("project_id", projectData.id)
      .order("created_at", { ascending: true });

    setAnalyses(analysesData || []);
    if (analysesData && analysesData.length > 0) {
      setSelectedAnalysisId(analysesData[0].id);
    }
    setLoading(false);
  }, [shareToken]);

  const fetchSections = useCallback(async () => {
    if (!selectedAnalysisId) return;

    const { data } = await supabase
      .from("sections")
      .select("*")
      .eq("analysis_id", selectedAnalysisId)
      .order("section_order", { ascending: true });

    setSections(data || []);
  }, [selectedAnalysisId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">{error || "Not found"}</p>
          <a href="/" className="text-xs text-muted-foreground hover:text-foreground underline">
            Go home
          </a>
        </div>
      </div>
    );
  }

  const selectedAnalysis = analyses.find((a) => a.id === selectedAnalysisId);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Simple sidebar for analyses */}
      <aside className="w-48 shrink-0 border-r border-border/20 overflow-y-auto">
        <div className="p-4 pt-6">
          <h1 className="text-sm font-serif text-foreground mb-1">{project.name}</h1>
          {project.description && (
            <p className="text-[10px] text-muted-foreground/60 mb-4">{project.description}</p>
          )}

          <h2 className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-2">
            Analyses
          </h2>
          <div className="space-y-0.5">
            {analyses.map((analysis) => (
              <button
                key={analysis.id}
                onClick={() => setSelectedAnalysisId(analysis.id)}
                className={`w-full text-left text-xs py-1.5 px-2 rounded-sm transition-colors ${
                  selectedAnalysisId === analysis.id
                    ? "bg-muted/60 text-foreground"
                    : "text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {analysis.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-12 px-8">
          {selectedAnalysis ? (
            <article className="space-y-8">
              <header className="border-b border-border/20 pb-4">
                <h2 className="text-lg font-serif text-foreground">{selectedAnalysis.name}</h2>
              </header>

              {sections.length === 0 ? (
                <p className="text-sm text-muted-foreground/50 italic">No content</p>
              ) : (
                <div className="space-y-6">
                  {sections.map((section) => (
                    <section key={section.id}>
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70 mb-2">
                        {section.title}
                      </h3>
                      <p className="text-sm font-serif leading-relaxed text-foreground/80 whitespace-pre-wrap">
                        {section.content || "—"}
                      </p>
                    </section>
                  ))}
                </div>
              )}
            </article>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">Select an analysis</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SharedProject;
