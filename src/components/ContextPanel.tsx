import { Link, Share2, ExternalLink } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ContextPanel = () => {
  const { selectedProject, updateProject, selectedAnalysis, sections } = useWorkspaceContext();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleShare = () => {
    if (!selectedProject || !selectedProject.share_token) {
      toast({
        title: "Unable to share",
        description: "Share token not available",
        variant: "destructive",
      });
      return;
    }
    
    const shareUrl = `${window.location.origin}/shared/${selectedProject.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    
    // Make project public if not already
    if (!selectedProject.is_public) {
      updateProject(selectedProject.id, { is_public: true });
    }
    
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard",
    });
  };

  return (
    <aside className="w-56 shrink-0 border-l border-border/20 bg-muted/10 overflow-y-auto flex flex-col">
      <div className="p-4 flex-1 space-y-6 text-xs">
        {/* User section */}
        <section>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40">
              Account
            </span>
            <button
              onClick={signOut}
              className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
          <p className="text-muted-foreground/60 truncate mt-1">
            {user?.email}
          </p>
        </section>

        <hr className="border-border/20" />

        {selectedProject ? (
          <>
            {/* Project info */}
            <section>
              <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-2">
                Project
              </h3>
              <p className="text-foreground/70 mb-2">{selectedProject.name}</p>
              {selectedProject.description && (
                <p className="text-muted-foreground/60 text-[11px] leading-relaxed">
                  {selectedProject.description}
                </p>
              )}
            </section>

            <hr className="border-border/20" />

            {/* Share section */}
            <section>
              <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-2">
                Sharing
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground/60">
                  {selectedProject.is_public ? (
                    <>
                      <ExternalLink className="h-3 w-3" />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <Link className="h-3 w-3" />
                      <span>Private</span>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="w-full text-xs h-7"
                >
                  <Share2 className="h-3 w-3 mr-1.5" />
                  Copy share link
                </Button>
              </div>
            </section>

            {selectedAnalysis && (
              <>
                <hr className="border-border/20" />

                {/* Analysis stats */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-2">
                    Analysis
                  </h3>
                  <div className="space-y-1 text-muted-foreground/60">
                    <div className="flex justify-between">
                      <span>Sections</span>
                      <span className="text-foreground/60">{sections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created</span>
                      <span className="text-foreground/60">
                        {new Date(selectedAnalysis.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        ) : (
          <div className="text-muted-foreground/40 italic">
            Select a project to see details
          </div>
        )}
      </div>
    </aside>
  );
};

export default ContextPanel;
