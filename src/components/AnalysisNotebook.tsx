import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, GripVertical, Loader2, Sparkles } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import EditableText from "./EditableText";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  explicit: string;
  implied: string;
  hedging: string;
}

// Debounce hook for section content updates
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const SectionEditor = ({
  section,
  onUpdate,
  onDelete,
}: {
  section: { id: string; title: string; content: string | null };
  onUpdate: (id: string, updates: { title?: string; content?: string }) => void;
  onDelete: (id: string) => void;
}) => {
  const [localContent, setLocalContent] = useState(section.content || "");
  const debouncedContent = useDebounce(localContent, 500);

  // Sync with parent when debounced content changes
  useEffect(() => {
    if (debouncedContent !== section.content) {
      onUpdate(section.id, { content: debouncedContent });
    }
  }, [debouncedContent, section.id, section.content, onUpdate]);

  // Reset local content when section changes
  useEffect(() => {
    setLocalContent(section.content || "");
  }, [section.id, section.content]);

  return (
    <section className="group relative">
      <div className="flex items-start gap-2">
        <div className="pt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground/30" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <EditableText
              value={section.title}
              onSave={(title) => onUpdate(section.id, { title })}
              placeholder="Section title"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70"
            />
            <button
              onClick={() => onDelete(section.id)}
              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded text-muted-foreground/40 hover:text-destructive/70"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          <Textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            placeholder="Write your content here..."
            className="min-h-[80px] resize-y border-none bg-transparent p-0 text-sm font-serif leading-relaxed text-foreground/80 focus-visible:ring-0 placeholder:text-muted-foreground/40"
          />
        </div>
      </div>
    </section>
  );
};

const AnalysisNotebook = () => {
  const {
    selectedAnalysis,
    selectedProject,
    sections,
    createSection,
    updateSection,
    deleteSection,
    isSaving,
  } = useWorkspaceContext();
  
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyzeReport = async () => {
    // Combine all section content
    const reportText = sections
      .map((s) => `${s.title}\n${s.content || ""}`)
      .join("\n\n")
      .trim();

    if (reportText.length < 10) {
      toast({
        title: "Not enough content",
        description: "Add more content to your sections before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please sign in to analyze reports.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      console.log("Calling analyze-report with token present:", !!token);

      const { data, error } = await supabase.functions.invoke("analyze-report", {
        body: { reportText },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response:", { data, error });

      if (error) {
        console.error("Edge function error:", error);
        const errorMessage = error.message || "Analysis failed";
        throw new Error(errorMessage);
      }

      // Check if the response contains an error field
      if (data?.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data);
      toast({
        title: "Analysis complete",
        description: "Report has been analyzed successfully.",
      });
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis failed",
        description: err.message || "Unable to analyze report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateSection = useCallback(
    (id: string, updates: { title?: string; content?: string }) => {
      updateSection(id, updates);
    },
    [updateSection]
  );

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground/50">
        <div className="text-center">
          <p className="text-sm mb-2">No project selected</p>
          <p className="text-xs">Create or select a project from the sidebar</p>
        </div>
      </div>
    );
  }

  if (!selectedAnalysis) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground/50">
        <div className="text-center">
          <p className="text-sm mb-2">No analysis selected</p>
          <p className="text-xs">Create or select an analysis from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <article className="space-y-8">
      {/* Analysis title */}
      <header className="border-b border-border/20 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EditableText
              value={selectedAnalysis.name}
              onSave={(name) => {
                // This is handled by sidebar
              }}
              placeholder="Untitled Analysis"
              className="text-lg font-serif text-foreground"
            />
            {isSaving && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50" />
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyzeReport}
            disabled={isAnalyzing || sections.length === 0}
            className="text-xs h-7"
          >
            {isAnalyzing ? (
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1.5" />
            )}
            {isAnalyzing ? "Analyzing..." : "Analyze Report"}
          </Button>
        </div>
      </header>

      {/* Analysis Results */}
      {analysisResult && (
        <section className="bg-muted/30 rounded-lg p-4 space-y-4 border border-border/20">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
            AI Analysis Results
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="text-xs font-medium text-foreground/80 mb-1">Explicit Findings</h4>
              <p className="text-muted-foreground/70 whitespace-pre-line text-xs leading-relaxed">
                {analysisResult.explicit || "None stated."}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-foreground/80 mb-1">Implied Concerns</h4>
              <p className="text-muted-foreground/70 whitespace-pre-line text-xs leading-relaxed">
                {analysisResult.implied || "None stated."}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-foreground/80 mb-1">Hedging Language</h4>
              <p className="text-muted-foreground/70 whitespace-pre-line text-xs leading-relaxed">
                {analysisResult.hedging || "None stated."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground/50">
          <p className="text-sm mb-4">This analysis is empty</p>
          <button
            onClick={() => createSection()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Add your first section
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <SectionEditor
              key={section.id}
              section={section}
              onUpdate={handleUpdateSection}
              onDelete={deleteSection}
            />
          ))}
        </div>
      )}

      {/* Add section button */}
      <button
        onClick={() => createSection()}
        className="flex items-center gap-2 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-2"
      >
        <Plus className="h-3 w-3" />
        Add section
      </button>
    </article>
  );
};

export default AnalysisNotebook;
