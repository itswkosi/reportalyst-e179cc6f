import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeItem {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: TreeItem[];
}

const projectTree: TreeItem[] = [
  {
    id: "panecho",
    name: "PanEcho",
    type: "folder",
    children: [
      { id: "dataset-a", name: "Dataset A (TCIA)", type: "file" },
      {
        id: "baseline-radiomics",
        name: "Baseline Radiomics",
        type: "folder",
        children: [
          { id: "wavelet-features", name: "With Wavelet Features", type: "file" },
          { id: "leakage-test", name: "Leakage Test", type: "file" },
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
  const [isOpen, setIsOpen] = useState(level === 0 || level === 1);
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
          "w-full flex items-center gap-1.5 py-1.5 px-2 text-left text-xs rounded-sm transition-colors",
          "hover:bg-muted/50 text-muted-foreground",
          isSelected && "bg-muted/70 text-foreground font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
          )
        ) : (
          <span className="w-3" />
        )}
        <span className="truncate">{item.name}</span>
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
  const [selectedId, setSelectedId] = useState("baseline-radiomics");

  return (
    <aside className="w-44 shrink-0 border-r border-border/30 bg-background/50 overflow-y-auto opacity-80 hover:opacity-100 transition-opacity">
      <div className="p-3 border-b border-border/30">
        <h2 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          Projects
        </h2>
      </div>
      <div className="p-1.5">
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
