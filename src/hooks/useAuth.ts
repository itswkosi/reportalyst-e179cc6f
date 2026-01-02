import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Update last login on sign in (and ensure profile exists)
        if (event === "SIGNED_IN" && session?.user) {
          const fallbackName = session.user.email?.split("@")[0] ?? null;

          setTimeout(() => {
            supabase
              .from("profiles")
              .upsert(
                {
                  user_id: session.user.id,
                  display_name: fallbackName,
                  last_login_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
              );
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
};
