import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Trash2, FileText, Database, Search, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import EditableText from "./EditableText";
import UserProfileDropdown from "./UserProfileDropdown";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProjectSidebar = () => {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    selectedAnalysisId,
    setSelectedAnalysisId,
    analyses,
    datasets,
    createProject,
    updateProject,
    deleteProject,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
    createDataset,
    updateDataset,
    deleteDataset,
  } = useWorkspaceContext();

  const { toast } = useToast();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const toggleProject = (id: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    if (!expandedProjects.has(id)) {
      setExpandedProjects((prev) => new Set(prev).add(id));
    }
  };

  const handleCreateProject = async () => {
    const project = await createProject();
    if (project) {
      setExpandedProjects((prev) => new Set(prev).add(project.id));
    }
  };

  // Add label to an analysis
  const handleAddLabel = async (analysisId: string, label: string) => {
    if (!label.trim()) return;
    
    const analysis = analyses.find(a => a.id === analysisId);
    if (!analysis) return;

    const currentLabels = (analysis as any).labels || [];
    if (currentLabels.includes(label.trim())) {
      toast({ title: "Label already exists", variant: "destructive" });
      return;
    }

    const newLabels = [...currentLabels, label.trim()];
    
    const { error } = await supabase
      .from("analyses")
      .update({ labels: newLabels })
      .eq("id", analysisId);

    if (error) {
      toast({ title: "Failed to add label", variant: "destructive" });
    } else {
      // Refresh the analyses list by triggering a re-render
      updateAnalysis(analysisId, { name: analysis.name });
    }
    setNewLabel("");
  };

  // Remove label from an analysis
  const handleRemoveLabel = async (analysisId: string, labelToRemove: string) => {
    const analysis = analyses.find(a => a.id === analysisId);
    if (!analysis) return;

    const currentLabels = (analysis as any).labels || [];
    const newLabels = currentLabels.filter((l: string) => l !== labelToRemove);
    
    const { error } = await supabase
      .from("analyses")
      .update({ labels: newLabels })
      .eq("id", analysisId);

    if (error) {
      toast({ title: "Failed to remove label", variant: "destructive" });
    } else {
      updateAnalysis(analysisId, { name: analysis.name });
    }
  };

  // Filter analyses based on search query
  const filteredAnalyses = analyses.filter((analysis) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = analysis.name.toLowerCase().includes(query);
    const labelsMatch = ((analysis as any).labels || []).some((l: string) => 
      l.toLowerCase().includes(query)
    );
    const contentMatch = [
      analysis.analysis_explicit,
      analysis.analysis_implied,
      analysis.analysis_hedging,
    ].some(field => field?.toLowerCase().includes(query));

    return nameMatch || labelsMatch || contentMatch;
  });

  return (
    <aside className="w-52 shrink-0 border-r border-border/20 overflow-y-auto flex flex-col">
      {/* Header with app name and user profile */}
      <div className="p-4 pb-2 border-b border-border/20 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Reportalyst</span>
        <UserProfileDropdown />
      </div>

      {/* Search bar */}
      <div className="px-4 py-3 border-b border-border/20">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports..."
            className="h-7 pl-7 pr-7 text-xs bg-muted/30 border-border/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 pt-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] uppercase tracking-wider text-muted-foreground/40">
            Projects
          </h2>
          <button
            onClick={handleCreateProject}
            className="p-1 hover:bg-muted/50 rounded transition-colors text-muted-foreground/50 hover:text-muted-foreground"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-xs text-muted-foreground/50 italic">
            No projects yet
          </p>
        ) : (
          <div className="space-y-0.5">
            {projects.map((project) => {
              const isExpanded = expandedProjects.has(project.id);
              const isSelected = selectedProjectId === project.id;
              const projectAnalyses = isSelected ? filteredAnalyses : [];
              const projectDatasets = isSelected ? datasets : [];

              return (
                <div key={project.id}>
                  {/* Project row */}
                  <div
                    className={cn(
                      "group flex items-center gap-1 py-1.5 px-2 rounded-sm transition-colors cursor-pointer",
                      isSelected ? "bg-muted/50" : "hover:bg-muted/30"
                    )}
                    onMouseEnter={() => setHoveredItem(project.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <button
                      onClick={() => toggleProject(project.id)}
                      className="shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                      )}
                    </button>
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => handleSelectProject(project.id)}
                    >
                      <EditableText
                        value={project.name}
                        onSave={(name) => updateProject(project.id, { name })}
                        className="text-xs text-foreground/80 truncate block"
                      />
                    </div>
                    {hoveredItem === project.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                        className="p-0.5 hover:bg-destructive/10 rounded text-muted-foreground/40 hover:text-destructive/70"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Project contents */}
                  {isExpanded && isSelected && (
                    <div className="ml-4 border-l border-border/20 pl-2 mt-0.5 space-y-0.5">
                      {/* Analyses */}
                      <div className="py-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">
                            Analyses
                          </span>
                          <button
                            onClick={() => createAnalysis()}
                            className="p-0.5 hover:bg-muted/50 rounded text-muted-foreground/40 hover:text-muted-foreground"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        {projectAnalyses.map((analysis) => {
                          const labels = (analysis as any).labels || [];
                          
                          return (
                            <div
                              key={analysis.id}
                              className={cn(
                                "group flex flex-col gap-1 py-1 px-1.5 rounded-sm transition-colors cursor-pointer",
                                selectedAnalysisId === analysis.id
                                  ? "bg-muted/60"
                                  : "hover:bg-muted/30"
                              )}
                              onMouseEnter={() => setHoveredItem(analysis.id)}
                              onMouseLeave={() => setHoveredItem(null)}
                            >
                              <div className="flex items-center gap-1.5">
                                <FileText className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                <div
                                  className="flex-1 min-w-0"
                                  onClick={() => setSelectedAnalysisId(analysis.id)}
                                >
                                  <EditableText
                                    value={analysis.name}
                                    onSave={(name) => updateAnalysis(analysis.id, { name })}
                                    className="text-[11px] text-foreground/70 truncate block"
                                  />
                                </div>
                                {hoveredItem === analysis.id && (
                                  <div className="flex items-center gap-0.5">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className="p-0.5 hover:bg-muted/50 rounded text-muted-foreground/40 hover:text-muted-foreground">
                                          <Tag className="h-2.5 w-2.5" />
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-48 p-2" align="start">
                                        <div className="space-y-2">
                                          <div className="flex gap-1">
                                            <Input
                                              value={newLabel}
                                              onChange={(e) => setNewLabel(e.target.value)}
                                              placeholder="Add label..."
                                              className="h-6 text-xs"
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleAddLabel(analysis.id, newLabel);
                                                }
                                              }}
                                            />
                                            <Button
                                              size="sm"
                                              className="h-6 px-2 text-xs"
                                              onClick={() => handleAddLabel(analysis.id, newLabel)}
                                            >
                                              Add
                                            </Button>
                                          </div>
                                          {labels.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                              {labels.map((label: string) => (
                                                <Badge
                                                  key={label}
                                                  variant="secondary"
                                                  className="text-[10px] px-1.5 py-0 h-5 gap-1"
                                                >
                                                  {label}
                                                  <button
                                                    onClick={() => handleRemoveLabel(analysis.id, label)}
                                                    className="hover:text-destructive"
                                                  >
                                                    <X className="h-2.5 w-2.5" />
                                                  </button>
                                                </Badge>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteAnalysis(analysis.id);
                                      }}
                                      className="p-0.5 hover:bg-destructive/10 rounded text-muted-foreground/40 hover:text-destructive/70"
                                    >
                                      <Trash2 className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              {/* Display labels below analysis name */}
                              {labels.length > 0 && (
                                <div className="flex flex-wrap gap-0.5 ml-4">
                                  {labels.slice(0, 2).map((label: string) => (
                                    <Badge
                                      key={label}
                                      variant="outline"
                                      className="text-[9px] px-1 py-0 h-4 bg-muted/30"
                                    >
                                      {label}
                                    </Badge>
                                  ))}
                                  {labels.length > 2 && (
                                    <span className="text-[9px] text-muted-foreground/50">
                                      +{labels.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {projectAnalyses.length === 0 && (
                          <p className="text-[10px] text-muted-foreground/40 italic px-1.5">
                            {searchQuery ? "No matches" : "No analyses"}
                          </p>
                        )}
                      </div>

                      {/* Datasets */}
                      <div className="py-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">
                            Datasets
                          </span>
                          <button
                            onClick={() => createDataset()}
                            className="p-0.5 hover:bg-muted/50 rounded text-muted-foreground/40 hover:text-muted-foreground"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        {projectDatasets.map((dataset) => (
                          <div
                            key={dataset.id}
                            className="group flex items-center gap-1.5 py-1 px-1.5 rounded-sm hover:bg-muted/30 transition-colors"
                            onMouseEnter={() => setHoveredItem(dataset.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <Database className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                            <EditableText
                              value={dataset.name}
                              onSave={(name) => updateDataset(dataset.id, { name })}
                              className="text-[11px] text-foreground/70 truncate flex-1"
                            />
                            {hoveredItem === dataset.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteDataset(dataset.id);
                                }}
                                className="p-0.5 hover:bg-destructive/10 rounded text-muted-foreground/40 hover:text-destructive/70"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {projectDatasets.length === 0 && (
                          <p className="text-[10px] text-muted-foreground/40 italic px-1.5">
                            No datasets
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ProjectSidebar;
