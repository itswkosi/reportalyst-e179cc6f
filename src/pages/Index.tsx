import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ProjectSidebar from "@/components/ProjectSidebar";
import ContextPanel from "@/components/ContextPanel";
import OutputSection from "@/components/OutputSection";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { toast } = useToast();
  const [reportText, setReportText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState({
    explicit: "",
    implied: "",
    hedging: "",
  });

  const hasResults = !!(results.explicit || results.implied || results.hedging);

  const handleAnalyze = async () => {
    if (!reportText.trim()) return;
    
    setIsAnalyzing(true);
    setResults({ explicit: "", implied: "", hedging: "" });

    try {
      const { data, error } = await supabase.functions.invoke("analyze-report", {
        body: { reportText: reportText.trim() },
      });

      if (error) {
        console.error("Analysis error:", error);
        toast({
          title: "Analysis failed",
          description: error.message || "Unable to analyze the report. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.error) {
        toast({
          title: "Analysis error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setResults({
        explicit: data.explicit || "None stated.",
        implied: data.implied || "None stated.",
        hedging: data.hedging || "None stated.",
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border/50 bg-card/50 px-6 flex items-center justify-between shrink-0">
        <h1 className="text-base font-semibold text-foreground">Reportalyst</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>PDAC Analysis</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <ProjectSidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-8 px-6">
            {/* Page Title */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground">Analysis Notebook</h2>
            </div>

            {/* Input Section */}
            <section className="bg-card/80 rounded-xl p-6 shadow-sm mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Radiology report excerpt
              </h3>
              <Textarea
                placeholder="Paste radiology report text here..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="min-h-[120px] resize-y border-border/50 bg-background/60 text-sm font-serif leading-relaxed rounded-lg"
              />
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAnalyze}
                  disabled={!reportText.trim() || isAnalyzing}
                  size="sm"
                  className="gap-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Search className="h-3.5 w-3.5" />
                  )}
                  {isAnalyzing ? "Analyzing..." : "Clarify report language"}
                </Button>
              </div>
            </section>

            {/* Output Sections */}
            <div className="space-y-6">
              <OutputSection
                title="Explicit findings"
                content={results.explicit}
                variant="default"
              />
              <OutputSection
                title="Implied concerns"
                content={results.implied}
                variant="warning"
              />
              <OutputSection
                title="Hedging / non-actionable language"
                content={results.hedging}
                variant="muted"
              />
            </div>
          </div>
        </main>

        {/* Right Context Panel */}
        <ContextPanel hasResults={hasResults} />
      </div>
    </div>
  );
};

export default Index;
