import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "student" | "clinician" | "researcher" | "admin";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: AppRole | null;
  last_login_at: string | null;
  last_project_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const [profileRes, rolesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id),
    ]);

    if (profileRes.data) {
      setProfile(profileRes.data as Profile);
    }
    if (rolesRes.data) {
      setRoles(rolesRes.data as UserRole[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Pick<Profile, "display_name" | "role" | "last_project_id" | "avatar_url">>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (!error) {
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
    }
    return { error };
  };

  const updateLastProject = async (projectId: string | null) => {
    if (!user) return;
    
    await supabase
      .from("profiles")
      .update({ last_project_id: projectId })
      .eq("user_id", user.id);
    
    setProfile((prev) => prev ? { ...prev, last_project_id: projectId } : null);
  };

  const updateLastLogin = async () => {
    if (!user) return;
    
    await supabase
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("user_id", user.id);
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.some((r) => r.role === role);
  };

  const isAdmin = hasRole("admin");

  return {
    profile,
    roles,
    loading,
    updateProfile,
    updateLastLogin,
    updateLastProject,
    hasRole,
    isAdmin,
    refetch: fetchProfile,
  };
};
