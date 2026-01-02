import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeItem {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: TreeItem[];
}

const projectTree: TreeItem[] = [
  {
    id: "1",
    name: "PanEcho",
    type: "folder",
    children: [
      { id: "1-1", name: "Dataset A (TCIA)", type: "file" },
      {
        id: "1-2",
        name: "Baseline Radiomics",
        type: "folder",
        children: [
          { id: "1-2-1", name: "With Wavelet Features", type: "file" },
          { id: "1-2-2", name: "Leakage Test", type: "file" },
        ],
      },
    ],
  },
];

interface TreeNodeProps {
  item: TreeItem;
  level: number;
  selectedId: string;
  onSelect: (id: string) => void;
}

const TreeNode = ({ item, level, selectedId, onSelect }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedId === item.id;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen);
          onSelect(item.id);
        }}
        className={cn(
          "w-full flex items-center gap-1 py-1.5 px-2 text-left text-sm rounded-sm transition-colors",
          "hover:bg-accent/50",
          isSelected && "bg-accent text-foreground font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
          )
        ) : (
          <span className="w-3" />
        )}
        {item.type === "folder" ? (
          isOpen ? (
            <FolderOpen className="h-3.5 w-3.5 text-primary shrink-0" />
          ) : (
            <Folder className="h-3.5 w-3.5 text-primary shrink-0" />
          )
        ) : null}
        <span className="truncate text-foreground/80">{item.name}</span>
      </button>
      {hasChildren && isOpen && (
        <div>
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectSidebar = () => {
  const [selectedId, setSelectedId] = useState("1-2");

  return (
    <aside className="w-48 shrink-0 border-r border-border/50 bg-card/30 overflow-y-auto">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Projects
        </h2>
      </div>
      <div className="p-2">
        {projectTree.map((item) => (
          <TreeNode
            key={item.id}
            item={item}
            level={0}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ))}
      </div>
    </aside>
  );
};

export default ProjectSidebar;
