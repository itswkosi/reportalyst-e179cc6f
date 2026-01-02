import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export const useAuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (options?: {
    tableName?: string;
    recordId?: string;
    limit?: number;
  }) => {
    if (!user) return;
    
    setLoading(true);
    
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.tableName) {
      query = query.eq("table_name", options.tableName);
    }
    if (options?.recordId) {
      query = query.eq("record_id", options.recordId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data } = await query;
    setLogs((data as AuditLog[]) || []);
    setLoading(false);
  }, [user]);

  const getProjectHistory = async (projectId: string) => {
    await fetchLogs({ tableName: "projects", recordId: projectId, limit: 50 });
    return logs;
  };

  const getAnalysisHistory = async (analysisId: string) => {
    await fetchLogs({ tableName: "analyses", recordId: analysisId, limit: 50 });
    return logs;
  };

  const getSectionHistory = async (sectionId: string) => {
    await fetchLogs({ tableName: "sections", recordId: sectionId, limit: 50 });
    return logs;
  };

  return {
    logs,
    loading,
    fetchLogs,
    getProjectHistory,
    getAnalysisHistory,
    getSectionHistory,
  };
};
