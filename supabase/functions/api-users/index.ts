import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Parse URL to get path segments
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const userId = pathSegments[pathSegments.length - 1];
    const isIdRoute = userId && userId !== "api-users";

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    
    // Create client based on auth
    const supabase = createClient(supabaseUrl, authHeader ? supabaseAnonKey : supabaseServiceKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // POST /api-users - Create new user (signup)
    if (req.method === "POST" && !isIdRoute) {
      const { email, password, display_name, role } = await req.json();
      
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Email and password are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Creating new user: ${email}`);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: display_name || email.split("@")[0] },
        },
      });

      if (authError) {
        console.error("Signup error:", authError);
        // Return generic error to avoid revealing system details
        const isEmailTaken = authError.message?.toLowerCase().includes("already registered");
        return new Response(
          JSON.stringify({ error: isEmailTaken ? "An account with this email already exists" : "Failed to create account" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`User created successfully: ${authData.user?.id}`);
      
      return new Response(
        JSON.stringify({
          id: authData.user?.id,
          email: authData.user?.email,
          created_at: authData.user?.created_at,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /api-users/login - Authenticate user
    if (req.method === "POST" && userId === "login") {
      const { email, password } = await req.json();
      
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Email and password are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Login attempt: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Login error:", error);
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Login successful: ${data.user.id}`);
      
      return new Response(
        JSON.stringify({
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // All other endpoints require authentication
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /api-users/me - Get current user profile
    if (req.method === "GET" && userId === "me") {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return new Response(
          JSON.stringify({ error: "Profile not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ...profile, email: user.email }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /api-users/:id - Get user profile by ID (only own profile)
    if (req.method === "GET" && isIdRoute) {
      if (userId !== user.id) {
        return new Response(
          JSON.stringify({ error: "Cannot access other users' profiles" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: "Profile not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(profile),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT /api-users/:id - Update user profile
    if (req.method === "PUT" && isIdRoute) {
      if (userId !== user.id && userId !== "me") {
        return new Response(
          JSON.stringify({ error: "Cannot update other users' profiles" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updates = await req.json();
      // Only allow display_name updates - role changes must go through admin functions via user_roles table
      const allowedFields = ["display_name"];
      const sanitizedUpdates: Record<string, string> = {};
      
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          sanitizedUpdates[field] = updates[field];
        }
      }

      console.log(`Updating profile for user: ${user.id}`, sanitizedUpdates);

      const { data: profile, error } = await supabase
        .from("profiles")
        .update(sanitizedUpdates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Profile update error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update profile" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify(profile),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE /api-users/:id - Delete user account
    if (req.method === "DELETE" && isIdRoute) {
      if (userId !== user.id && userId !== "me") {
        return new Response(
          JSON.stringify({ error: "Cannot delete other users" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Deleting user: ${user.id}`);

      // Use service role to delete user
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const { error } = await adminClient.auth.admin.deleteUser(user.id);

      if (error) {
        console.error("User deletion error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to delete user" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "User deleted successfully" }),
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
