import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Trash2, FileText, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import EditableText from "./EditableText";
import UserProfileDropdown from "./UserProfileDropdown";

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

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  return (
    <aside className="w-52 shrink-0 border-r border-border/20 overflow-y-auto flex flex-col">
      {/* Header with app name and user profile */}
      <div className="p-4 pb-2 border-b border-border/20 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Reportalyst</span>
        <UserProfileDropdown />
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
              const projectAnalyses = isSelected ? analyses : [];
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
                        {projectAnalyses.map((analysis) => (
                          <div
                            key={analysis.id}
                            className={cn(
                              "group flex items-center gap-1.5 py-1 px-1.5 rounded-sm transition-colors cursor-pointer",
                              selectedAnalysisId === analysis.id
                                ? "bg-muted/60"
                                : "hover:bg-muted/30"
                            )}
                            onMouseEnter={() => setHoveredItem(analysis.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAnalysis(analysis.id);
                                }}
                                className="p-0.5 hover:bg-destructive/10 rounded text-muted-foreground/40 hover:text-destructive/70"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {projectAnalyses.length === 0 && (
                          <p className="text-[10px] text-muted-foreground/40 italic px-1.5">
                            No analyses
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
