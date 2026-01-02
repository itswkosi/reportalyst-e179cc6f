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

    // Parse URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const sectionId = pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : null;
    const isIdRoute = sectionId && sectionId !== "api-sections";
    const analysisId = url.searchParams.get("analysis_id");

    // POST /api-sections?analysis_id=xxx - Create new section
    if (req.method === "POST" && !isIdRoute) {
      const body = await req.json();
      const targetAnalysisId = body.analysis_id || analysisId;
      
      if (!targetAnalysisId) {
        return new Response(
          JSON.stringify({ error: "analysis_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get max section_order for the analysis
      const { data: existingSections } = await supabase
        .from("sections")
        .select("section_order")
        .eq("analysis_id", targetAnalysisId)
        .order("section_order", { ascending: false })
        .limit(1);

      const nextOrder = existingSections && existingSections.length > 0 
        ? existingSections[0].section_order + 1 
        : 0;

      console.log(`Creating section for analysis: ${targetAnalysisId}, order: ${nextOrder}`);

      const { data: section, error } = await supabase
        .from("sections")
        .insert({
          analysis_id: targetAnalysisId,
          title: body.title || "New Section",
          content: body.content || null,
          section_order: body.section_order ?? nextOrder,
        })
        .select()
        .single();

      if (error) {
        console.error("Section creation error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to create section" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Section created: ${section.id}`);
      
      return new Response(
        JSON.stringify(section),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /api-sections?analysis_id=xxx - List sections for analysis
    if (req.method === "GET" && !isIdRoute) {
      if (!analysisId) {
        return new Response(
          JSON.stringify({ error: "analysis_id query parameter is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Fetching sections for analysis: ${analysisId}`);

      const { data: sections, error } = await supabase
        .from("sections")
        .select("*")
        .eq("analysis_id", analysisId)
        .order("section_order", { ascending: true });

      if (error) {
        console.error("Sections fetch error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch sections" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ sections, count: sections.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /api-sections/:id - Get single section
    if (req.method === "GET" && isIdRoute) {
      console.log(`Fetching section: ${sectionId}`);

      const { data: section, error } = await supabase
        .from("sections")
        .select("*")
        .eq("id", sectionId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: "Section not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(section),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT /api-sections/:id - Update section
    if (req.method === "PUT" && isIdRoute) {
      const updates = await req.json();
      const allowedFields = ["title", "content", "section_order"];
      const sanitizedUpdates: Record<string, unknown> = {};
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          sanitizedUpdates[field] = updates[field];
        }
      }

      console.log(`Updating section: ${sectionId}`, sanitizedUpdates);

      const { data: section, error } = await supabase
        .from("sections")
        .update(sanitizedUpdates)
        .eq("id", sectionId)
        .select()
        .single();

      if (error) {
        console.error("Section update error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update section" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(section),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PATCH /api-sections/reorder - Bulk reorder sections
    if (req.method === "PATCH" && sectionId === "reorder") {
      const { sections: sectionOrders } = await req.json();
      
      if (!Array.isArray(sectionOrders)) {
        return new Response(
          JSON.stringify({ error: "sections array is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Reordering ${sectionOrders.length} sections`);

      // Update each section's order
      const updates = sectionOrders.map((item: { id: string; section_order: number }) =>
        supabase
          .from("sections")
          .update({ section_order: item.section_order })
          .eq("id", item.id)
      );

      await Promise.all(updates);

      return new Response(
        JSON.stringify({ message: "Sections reordered successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE /api-sections/:id - Delete section
    if (req.method === "DELETE" && isIdRoute) {
      console.log(`Deleting section: ${sectionId}`);

      const { error } = await supabase
        .from("sections")
        .delete()
        .eq("id", sectionId);

      if (error) {
        console.error("Section deletion error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to delete section" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "Section deleted successfully" }),
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
