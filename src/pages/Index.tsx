import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ProjectSidebar from "@/components/ProjectSidebar";
import ContextPanel from "@/components/ContextPanel";
import AnalysisNotebook from "@/components/AnalysisNotebook";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/hooks/useAuth";

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
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
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
