import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { 
  validatePassword, 
  validateEmail, 
  getAuthErrorMessage 
} from "@/lib/passwordValidation";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      navigate("/app");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  // Validate email on change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      const result = validateEmail(value);
      setEmailErrors(result.errors);
    } else {
      setEmailErrors([]);
    }
  };

  // Validate password on change (only for signup)
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!isLogin && value) {
      const result = validatePassword(value);
      setPasswordErrors(result.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submission
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailErrors(emailValidation.errors);
      return;
    }
    
    // For signup, validate password strength
    if (!isLogin) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordErrors(passwordValidation.errors);
        return;
      }
    }
    
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Navigation handled by useEffect when user state updates
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        if (error) throw error;
        toast({
          title: "Account created",
          description: "You can now sign in.",
        });
        setIsLogin(true);
        setPassword("");
        setPasswordErrors([]);
      }
    } catch (error: unknown) {
      const authError = error as { message: string; code?: string };
      const friendlyMessage = getAuthErrorMessage(authError);
      toast({
        title: "Error",
        description: friendlyMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const passwordRequirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number", test: (p: string) => /[0-9]/.test(p) },
    { label: "One special character", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-lg font-serif text-foreground mb-1">Reportalyst</h1>
          <p className="text-xs text-muted-foreground">
            {isLogin ? "Sign in to continue" : "Create an account"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              className={`text-sm ${emailErrors.length > 0 ? 'border-destructive' : ''}`}
            />
            {emailErrors.length > 0 && (
              <div className="mt-1 text-xs text-destructive flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{emailErrors[0]}</span>
              </div>
            )}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              minLength={6}
              className={`text-sm ${passwordErrors.length > 0 ? 'border-destructive' : ''}`}
            />
            {/* Show password requirements for signup */}
            {!isLogin && password && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => {
                  const isMet = req.test(password);
                  return (
                    <div 
                      key={index} 
                      className={`text-xs flex items-center gap-1 ${isMet ? 'text-green-600' : 'text-muted-foreground'}`}
                    >
                      {isMet ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-current" />
                      )}
                      <span>{req.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting || emailErrors.length > 0 || (!isLogin && passwordErrors.length > 0)}
          >
            {submitting ? "..." : isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
