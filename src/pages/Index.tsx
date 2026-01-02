import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ProjectSidebar from "@/components/ProjectSidebar";
import ContextPanel from "@/components/ContextPanel";
import AnalysisNotebook from "@/components/AnalysisNotebook";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const WorkspaceContent = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <ProjectSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-12 px-8">
          <AnalysisNotebook />
        </div>
      </main>
      <ContextPanel />
    </div>
  );
};

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // Unauthenticated users should land on the public landing page.
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <WorkspaceProvider>
      <WorkspaceContent />
    </WorkspaceProvider>
  );
};

export default Index;
