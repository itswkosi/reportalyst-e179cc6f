import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are an assistant that analyzes the language of clinical radiology reports related to suspected pancreatic cancer.

You are NOT diagnosing disease, predicting outcomes, or recommending clinical actions.

Your task is to extract meaning from uncertainty, not to restate sentences.

Given a radiology report excerpt, separate the content into three categories using the rules below.

Rules for classification:

**Explicit findings**
- Include only directly stated, observable facts (measurements, locations, presence or absence of findings)
- Do not include interpretive adjectives unless they describe a physical characteristic (e.g., size, location)

**Implied concerns**
- Capture concerns suggested by language such as "suspicious," "cannot exclude," or "poorly defined"
- Abstract these into short, clinically neutral concern statements (e.g., "possible malignancy," "possible early involvement")
- Do not repeat the original phrasing verbatim unless necessary

**Hedging or non-actionable language**
- Extract uncertainty, legal, or cautious phrases that limit certainty but do not state a finding
- List these phrases verbatim when possible

Output requirements:
- Use concise bullet points
- Do not mirror the original sentence structure
- Perform one level of abstraction: convert descriptive phrases into short, neutral concepts
- Separate physical observations from interpretive language
- Prefer concept labels (e.g., "possible malignancy") over copied wording
- Do not add new information or clinical judgments
- Do not recommend actions or next steps
- If a category has no content, write "None stated."

Respond in this exact JSON format:
{
  "explicit": "• bullet point 1\\n• bullet point 2",
  "implied": "• bullet point 1\\n• bullet point 2",
  "hedging": "• bullet point 1\\n• bullet point 2"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("Request rejected: No authorization header");
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user with Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log("Request rejected: Invalid or expired token", userError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { reportText } = await req.json();

    // Input validation with length limits
    if (!reportText || typeof reportText !== "string") {
      return new Response(
        JSON.stringify({ error: "reportText must be a non-empty string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedText = reportText.trim();
    
    if (trimmedText.length < 10) {
      return new Response(
        JSON.stringify({ error: "Report text too short (minimum 10 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trimmedText.length > 50000) {
      return new Response(
        JSON.stringify({ error: "Report text too long (maximum 50,000 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing report for user:", user.id, "length:", trimmedText.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: trimmedText },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("AI response received for user:", user.id);

    // Parse JSON from response
    let result;
    try {
      // Extract JSON from possible markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      result = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      result = {
        explicit: content,
        implied: "",
        hedging: "",
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-report:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});