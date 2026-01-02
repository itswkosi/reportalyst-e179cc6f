import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, GripVertical, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import EditableText from "./EditableText";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// TYPES
// ============================================================

interface AnalysisResult {
  explicit: string;
  implied: string;
  hedging: string;
}

interface AnalysisState {
  status: "idle" | "loading" | "success" | "error";
  result: AnalysisResult | null;
  error: string | null;
}

// ============================================================
// DEBOUNCE HOOK - For section content auto-save
// ============================================================

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

// ============================================================
// SECTION EDITOR COMPONENT
// ============================================================

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

// ============================================================
// ANALYSIS RESULTS DISPLAY COMPONENT
// ============================================================

const AnalysisResults = ({ state }: { state: AnalysisState }) => {
  if (state.status === "idle") return null;

  // Loading state
  if (state.status === "loading") {
    return (
      <div className="bg-muted/30 rounded-lg p-4 border border-border/20 animate-pulse">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Analyzing report content...</span>
        </div>
      </div>
    );
  }

  // Error state - styled with destructive colors
  if (state.status === "error") {
    return (
      <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-destructive">Analysis Failed</h3>
            <p className="text-xs text-destructive/80 mt-1">{state.error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - styled with success colors
  if (state.status === "success" && state.result) {
    return (
      <div className="bg-primary/5 rounded-lg p-4 space-y-4 border border-primary/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-medium uppercase tracking-wide text-primary">
            AI Analysis Results
          </h3>
        </div>
        
        <div className="space-y-3 text-sm">
          {/* Explicit Findings */}
          <div className="bg-background/50 rounded p-3">
            <h4 className="text-xs font-medium text-foreground/80 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Explicit Findings
            </h4>
            <p className="text-muted-foreground/70 whitespace-pre-line text-xs leading-relaxed">
              {state.result.explicit || "None stated."}
            </p>
          </div>

          {/* Implied Concerns */}
          <div className="bg-background/50 rounded p-3">
            <h4 className="text-xs font-medium text-foreground/80 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Implied Concerns
            </h4>
            <p className="text-muted-foreground/70 whitespace-pre-line text-xs leading-relaxed">
              {state.result.implied || "None stated."}
            </p>
          </div>

          {/* Hedging Language */}
          <div className="bg-background/50 rounded p-3">
            <h4 className="text-xs font-medium text-foreground/80 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              Hedging Language
            </h4>
            <p className="text-muted-foreground/70 whitespace-pre-line text-xs leading-relaxed">
              {state.result.hedging || "None stated."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ============================================================
// MAIN ANALYSIS NOTEBOOK COMPONENT
// ============================================================

const AnalysisNotebook = () => {
  // Get workspace context - contains sections, selected analysis, etc.
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

  // Analysis state - tracks loading, success, error states
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: "idle",
    result: null,
    error: null,
  });

  // ============================================================
  // ANALYZE REPORT HANDLER
  // Calls the analyze-report Edge Function with section content
  // ============================================================
  const handleAnalyzeReport = async () => {
    // Prevent multiple simultaneous requests
    if (analysisState.status === "loading") return;

    // Combine all section content into a single report text
    // Format: "Section Title\nSection Content" for each section
    const reportText = sections
      .map((s) => `${s.title}\n${s.content || ""}`)
      .join("\n\n")
      .trim();

    // Validate minimum content length (Edge Function requires >= 10 chars)
    if (reportText.length < 10) {
      setAnalysisState({
        status: "error",
        result: null,
        error: "Not enough content. Add more text to your sections before analyzing (minimum 10 characters).",
      });
      return;
    }

    // Set loading state
    setAnalysisState({
      status: "loading",
      result: null,
      error: null,
    });

    try {
      // ============================================================
      // AUTHENTICATION CHECK
      // Get current session and access token for authenticated request
      // ============================================================
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error("Failed to get authentication session");
      }

      const session = sessionData?.session;

      if (!session?.access_token) {
        setAnalysisState({
          status: "error",
          result: null,
          error: "Authentication required. Please sign in to analyze reports.",
        });
        return;
      }

      // ============================================================
      // CALL EDGE FUNCTION DIRECTLY VIA FETCH
      // Using fetch() to have full control over headers
      // ============================================================
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-report`;
      
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reportText }),
      });

      // ============================================================
      // PARSE RESPONSE SAFELY
      // Read raw text first, then attempt JSON parse
      // ============================================================
      const rawBody = await response.text();
      
      let data: Record<string, unknown> | null = null;
      try {
        data = JSON.parse(rawBody);
      } catch {
        console.error("Failed to parse response as JSON:", rawBody.slice(0, 200));
      }

      // ============================================================
      // ERROR HANDLING
      // Check for non-2xx status codes
      // ============================================================
      if (!response.ok) {
        const errorMessage = (data?.error as string) || 
          `Request failed with status ${response.status}`;
        console.error("Edge function error:", response.status, errorMessage);
        throw new Error(errorMessage);
      }

      // Check if the response body contains an error field
      if (data?.error) {
        throw new Error(data.error as string);
      }

      // ============================================================
      // EXTRACT RESULTS
      // Safely extract analysis results from response
      // ============================================================
      const result: AnalysisResult = {
        explicit: String(data?.explicit || ""),
        implied: String(data?.implied || ""),
        hedging: String(data?.hedging || ""),
      };

      // Set success state with parsed results
      setAnalysisState({
        status: "success",
        result,
        error: null,
      });

      toast({
        title: "Analysis complete",
        description: "Report has been analyzed successfully.",
      });

    } catch (err: unknown) {
      // ============================================================
      // CATCH ALL ERRORS
      // Handle network errors, parsing errors, unexpected errors
      // ============================================================
      console.error("Analysis error:", err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "An unexpected error occurred. Please try again.";

      setAnalysisState({
        status: "error",
        result: null,
        error: errorMessage,
      });

      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Memoize section update handler to prevent unnecessary re-renders
  const handleUpdateSection = useCallback(
    (id: string, updates: { title?: string; content?: string }) => {
      updateSection(id, updates);
    },
    [updateSection]
  );

  // ============================================================
  // EMPTY STATES
  // Show appropriate messages when no project/analysis selected
  // ============================================================

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

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <article className="space-y-8">
      {/* Analysis Header with Title and Analyze Button */}
      <header className="border-b border-border/20 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EditableText
              value={selectedAnalysis.name}
              onSave={() => {
                // Title editing is handled by sidebar
              }}
              placeholder="Untitled Analysis"
              className="text-lg font-serif text-foreground"
            />
            {isSaving && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50" />
            )}
          </div>

          {/* Analyze Report Button - disabled while loading or no sections */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyzeReport}
            disabled={analysisState.status === "loading" || sections.length === 0}
            className="text-xs h-7"
          >
            {analysisState.status === "loading" ? (
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1.5" />
            )}
            {analysisState.status === "loading" ? "Analyzing..." : "Analyze Report"}
          </Button>
        </div>
      </header>

      {/* Analysis Results Display - shows below header */}
      <AnalysisResults state={analysisState} />

      {/* Sections List */}
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

      {/* Add Section Button */}
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
