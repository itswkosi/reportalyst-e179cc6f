import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, FolderOpen, Clock, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, roles, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [projectCount, setProjectCount] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProjectCount = async () => {
      if (!user) return;
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setProjectCount(count ?? 0);
    };
    fetchProjectCount();
  }, [user]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const displayName = profile.display_name || user.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const primaryRole = roles[0]?.role || profile.role || "student";
  const joinedDate = profile.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "Unknown";
  const lastLogin = profile.last_login_at 
    ? format(new Date(profile.last_login_at), "PPp") 
    : "Never";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate("/app")}>
            ← Back to Workspace
          </Button>
          <Button asChild>
            <Link to="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  {displayName}
                </h1>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                  <Badge variant="secondary" className="capitalize">
                    {primaryRole}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined {joinedDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Metrics */}
        <h2 className="text-lg font-medium text-foreground mb-4">Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{projectCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{lastLogin}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                Active
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Roles Section */}
        {roles.length > 0 && (
          <>
            <Separator className="my-6" />
            <h2 className="text-lg font-medium text-foreground mb-4">Assigned Roles</h2>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <Badge key={r.id} variant="outline" className="capitalize">
                  {r.role}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
