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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse URL - expects /api-analyses or /api-analyses/:id
    // Query param: ?project_id=xxx for filtering
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const analysisId = pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : null;
    const isIdRoute = analysisId && analysisId !== "api-analyses";
    const projectId = url.searchParams.get("project_id");

    // POST /api-analyses?project_id=xxx - Create new analysis
    if (req.method === "POST" && !isIdRoute) {
      const body = await req.json();
      const targetProjectId = body.project_id || projectId;
      
      if (!targetProjectId) {
        return new Response(
          JSON.stringify({ error: "project_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Creating analysis for project: ${targetProjectId}`);

      const { data: analysis, error } = await supabase
        .from("analyses")
        .insert({
          project_id: targetProjectId,
          name: body.name || "New Analysis",
        })
        .select()
        .single();

      if (error) {
        console.error("Analysis creation error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to create analysis" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Analysis created: ${analysis.id}`);
      
      return new Response(
        JSON.stringify(analysis),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /api-analyses?project_id=xxx - List analyses for project
    if (req.method === "GET" && !isIdRoute) {
      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "project_id query parameter is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Fetching analyses for project: ${projectId}`);

      const { data: analyses, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Analyses fetch error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch analyses" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ analyses, count: analyses.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /api-analyses/:id - Get analysis with sections
    if (req.method === "GET" && isIdRoute) {
      console.log(`Fetching analysis: ${analysisId}`);

      const [analysisRes, sectionsRes] = await Promise.all([
        supabase.from("analyses").select("*").eq("id", analysisId).single(),
        supabase.from("sections").select("*").eq("analysis_id", analysisId).order("section_order"),
      ]);

      if (analysisRes.error) {
        return new Response(
          JSON.stringify({ error: "Analysis not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          ...analysisRes.data,
          sections: sectionsRes.data || [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT /api-analyses/:id - Update analysis
    if (req.method === "PUT" && isIdRoute) {
      const updates = await req.json();
      const allowedFields = ["name"];
      const sanitizedUpdates: Record<string, unknown> = {};
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          sanitizedUpdates[field] = updates[field];
        }
      }

      console.log(`Updating analysis: ${analysisId}`, sanitizedUpdates);

      const { data: analysis, error } = await supabase
        .from("analyses")
        .update(sanitizedUpdates)
        .eq("id", analysisId)
        .select()
        .single();

      if (error) {
        console.error("Analysis update error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update analysis" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(analysis),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE /api-analyses/:id - Delete analysis
    if (req.method === "DELETE" && isIdRoute) {
      console.log(`Deleting analysis: ${analysisId}`);

      const { error } = await supabase
        .from("analyses")
        .delete()
        .eq("id", analysisId);

      if (error) {
        console.error("Analysis deletion error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to delete analysis" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "Analysis deleted successfully" }),
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
