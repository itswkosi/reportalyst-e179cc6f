import ProjectSidebar from "@/components/ProjectSidebar";
import ContextPanel from "@/components/ContextPanel";
import AnalysisNotebook from "@/components/AnalysisNotebook";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <ProjectSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-12 px-8">
          <AnalysisNotebook />
        </div>
      </main>

      {/* Right Context Panel */}
      <ContextPanel />
    </div>
  );
};

export default Index;
