import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import OutputSection from "@/components/OutputSection";
import { Search } from "lucide-react";

const Index = () => {
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
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setResults({
      explicit: "Analysis results will appear here when connected to an AI backend.",
      implied: "Implied concerns from the report will be identified here.",
      hedging: "Hedging or non-actionable language will be highlighted here.",
    });
    setIsAnalyzing(false);
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
                <Search className="h-3.5 w-3.5" />
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
