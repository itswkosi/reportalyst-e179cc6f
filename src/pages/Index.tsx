import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import OutputSection from "@/components/OutputSection";
import { FileText, AlertTriangle, HelpCircle, Search } from "lucide-react";

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
    // Simulate analysis delay - replace with actual AI integration
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Placeholder results - this would be replaced with actual AI analysis
    setResults({
      explicit: "Analysis results will appear here when connected to an AI backend.",
      implied: "Implied concerns from the report will be identified here.",
      hedging: "Hedging or non-actionable language will be highlighted here.",
    });
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-12 px-4 sm:px-6">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Radiology Report Clarifier
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Analyze radiology report excerpts to identify key findings and language patterns
          </p>
        </header>

        {/* Input Section */}
        <section className="mb-8">
          <Label htmlFor="report-input" className="text-sm font-medium mb-3 block">
            Radiology report excerpt
          </Label>
          <Textarea
            id="report-input"
            placeholder="Paste radiology report text here..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            className="min-h-[180px] resize-y bg-card text-sm"
          />
          <div className="mt-4">
            <Button
              onClick={handleAnalyze}
              disabled={!reportText.trim() || isAnalyzing}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Clarify report language"}
            </Button>
          </div>
        </section>

        {/* Output Sections */}
        <section className="grid gap-6 md:grid-cols-3">
          <OutputSection
            title="Explicit findings"
            content={results.explicit}
            icon={<FileText className="h-4 w-4 text-primary" />}
          />
          <OutputSection
            title="Implied concerns"
            content={results.implied}
            icon={<AlertTriangle className="h-4 w-4 text-primary" />}
          />
          <OutputSection
            title="Hedging / non-actionable language"
            content={results.hedging}
            icon={<HelpCircle className="h-4 w-4 text-primary" />}
          />
        </section>
      </div>
    </div>
  );
};

export default Index;
