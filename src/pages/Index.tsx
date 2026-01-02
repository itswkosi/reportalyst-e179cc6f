import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import OutputSection from "@/components/OutputSection";
import { Search, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">
          Radiology Report Clarifier
        </h1>
      </header>

      <main className="container max-w-4xl py-8 px-4 sm:px-6">
        {/* Input Card */}
        <div className="bg-card border border-border shadow-sm mb-6">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">
              Radiology report excerpt
            </h2>
          </div>
          <div className="p-5">
            <Textarea
              placeholder="Paste radiology report text here..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="min-h-[140px] resize-y border-border bg-background text-sm font-serif leading-relaxed"
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
          </div>
        </div>

        {/* Output Sections - Stacked */}
        <div className="space-y-4">
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
      </main>
    </div>
  );
};

export default Index;
