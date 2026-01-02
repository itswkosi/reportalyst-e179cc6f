import ProjectSidebar from "@/components/ProjectSidebar";
import ContextPanel from "@/components/ContextPanel";
import AnalysisNotebook from "@/components/AnalysisNotebook";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {

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

            <AnalysisNotebook />
          </div>
        </main>

        {/* Right Context Panel */}
        <ContextPanel hasResults={false} />
      </div>
    </div>
  );
};

export default Index;
