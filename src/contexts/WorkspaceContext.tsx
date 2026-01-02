import { createContext, useContext, ReactNode } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";

type WorkspaceContextType = ReturnType<typeof useWorkspace>;

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const workspace = useWorkspace();
  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider");
  }
  return context;
};
