import { Plus, Trash2, GripVertical } from "lucide-react";
import { useWorkspaceContext } from "@/contexts/WorkspaceContext";
import EditableText from "./EditableText";
import { Textarea } from "@/components/ui/textarea";

const AnalysisNotebook = () => {
  const {
    selectedAnalysis,
    selectedProject,
    sections,
    createSection,
    updateSection,
    deleteSection,
  } = useWorkspaceContext();

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground/50">
        <div className="text-center">
          <p className="text-sm mb-2">No project selected</p>
          <p className="text-xs">Create or select a project from the sidebar</p>
        </div>
      </div>
    );
  }

  if (!selectedAnalysis) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground/50">
        <div className="text-center">
          <p className="text-sm mb-2">No analysis selected</p>
          <p className="text-xs">Create or select an analysis from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <article className="space-y-8">
      {/* Analysis title */}
      <header className="border-b border-border/20 pb-4">
        <EditableText
          value={selectedAnalysis.name}
          onSave={(name) => {
            // This is handled by sidebar
          }}
          placeholder="Untitled Analysis"
          className="text-lg font-serif text-foreground"
        />
      </header>

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground/50">
          <p className="text-sm mb-4">This analysis is empty</p>
          <button
            onClick={() => createSection()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Add your first section
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.id} className="group relative">
              <div className="flex items-start gap-2">
                {/* Drag handle placeholder */}
                <div className="pt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                  <GripVertical className="h-4 w-4 text-muted-foreground/30" />
                </div>

                <div className="flex-1">
                  {/* Section title */}
                  <div className="flex items-center gap-2 mb-2">
                    <EditableText
                      value={section.title}
                      onSave={(title) => updateSection(section.id, { title })}
                      placeholder="Section title"
                      className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70"
                    />
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded text-muted-foreground/40 hover:text-destructive/70"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Section content */}
                  <Textarea
                    value={section.content || ""}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    placeholder="Write your content here..."
                    className="min-h-[80px] resize-y border-none bg-transparent p-0 text-sm font-serif leading-relaxed text-foreground/80 focus-visible:ring-0 placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Add section button */}
      <button
        onClick={() => createSection()}
        className="flex items-center gap-2 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-2"
      >
        <Plus className="h-3 w-3" />
        Add section
      </button>
    </article>
  );
};

export default AnalysisNotebook;
