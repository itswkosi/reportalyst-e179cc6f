import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Require auth for all project endpoints
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const projectId = pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : null;
    const isIdRoute = projectId && projectId !== "api-projects";

    // POST /api-projects - Create new project
    if (req.method === "POST" && !isIdRoute) {
      const { name, description } = await req.json();
      
      console.log(`Creating project for user: ${user.id}`, { name, description });

      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: name || "Untitled Project",
          description: description || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Project creation error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to create project" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Project created: ${project.id}`);
      
      return new Response(
        JSON.stringify(project),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /api-projects - List all projects for user
    if (req.method === "GET" && !isIdRoute) {
      console.log(`Fetching projects for user: ${user.id}`);

      const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Projects fetch error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch projects" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ projects, count: projects.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /api-projects/:id - Get project details with analyses
    if (req.method === "GET" && isIdRoute) {
      console.log(`Fetching project: ${projectId}`);

      const [projectRes, analysesRes, datasetsRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).single(),
        supabase.from("analyses").select("*").eq("project_id", projectId).order("created_at"),
        supabase.from("datasets").select("*").eq("project_id", projectId).order("created_at"),
      ]);

      if (projectRes.error) {
        return new Response(
          JSON.stringify({ error: "Project not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          ...projectRes.data,
          analyses: analysesRes.data || [],
          datasets: datasetsRes.data || [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT /api-projects/:id - Update project
    if (req.method === "PUT" && isIdRoute) {
      const updates = await req.json();
      const allowedFields = ["name", "description", "is_public"];
      const sanitizedUpdates: Record<string, unknown> = {};
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          sanitizedUpdates[field] = updates[field];
        }
      }

      console.log(`Updating project: ${projectId}`, sanitizedUpdates);

      const { data: project, error } = await supabase
        .from("projects")
        .update(sanitizedUpdates)
        .eq("id", projectId)
        .select()
        .single();

      if (error) {
        console.error("Project update error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update project" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(project),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE /api-projects/:id - Delete project
    if (req.method === "DELETE" && isIdRoute) {
      console.log(`Deleting project: ${projectId}`);

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        console.error("Project deletion error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to delete project" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "Project deleted successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
