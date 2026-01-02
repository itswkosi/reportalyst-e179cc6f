import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FolderKanban, ShieldCheck, Play, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-semibold tracking-tight text-foreground">
              Reportalyst
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth" state={{ fromLanding: true, mode: "login" }}>Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth" state={{ fromLanding: true, mode: "signup" }}>Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground mb-6 leading-tight">
              Streamlined Data Analysis for Medical Research
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              A structured research notebook designed for clinicians and medical students. 
              Document your analyses step-by-step, track assumptions, and maintain transparency 
              throughout your research workflow.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth" state={{ fromLanding: true, mode: "signup" }}>Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Hero Image - Notebook Preview */}
          <div className="max-w-5xl mx-auto">
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Mock Browser Header */}
              <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background border border-border rounded px-3 py-1 text-xs text-muted-foreground">
                    app.reportalyst.io
                  </div>
                </div>
              </div>
              
              {/* Mock App Interface */}
              <div className="flex h-80 md:h-96">
                {/* Sidebar */}
                <div className="w-48 border-r border-border bg-muted/30 p-4 hidden md:block">
                  <div className="text-xs font-medium text-muted-foreground mb-3">PROJECTS</div>
                  <div className="space-y-2">
                    <div className="text-sm text-foreground bg-accent/50 rounded px-2 py-1.5">
                      Cardiac Study 2024
                    </div>
                    <div className="text-sm text-muted-foreground px-2 py-1.5">
                      MRI Analysis
                    </div>
                    <div className="text-sm text-muted-foreground px-2 py-1.5">
                      Patient Cohort A
                    </div>
                  </div>
                  <div className="text-xs font-medium text-muted-foreground mt-6 mb-3">ANALYSES</div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground px-2 py-1">
                      Baseline Comparison
                    </div>
                    <div className="text-sm text-muted-foreground px-2 py-1">
                      Survival Analysis
                    </div>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 p-6 overflow-hidden">
                  <div className="text-lg font-medium text-foreground mb-4">Baseline Comparison</div>
                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4">
                      <div className="text-sm font-medium text-foreground mb-2">Claim</div>
                      <div className="text-sm text-muted-foreground">
                        Patients with elevated troponin levels show significantly higher...
                      </div>
                    </div>
                    <div className="border border-border rounded-lg p-4">
                      <div className="text-sm font-medium text-foreground mb-2">Dataset</div>
                      <div className="text-sm text-muted-foreground">
                        N = 1,247 patients from regional cardiac registry (2019-2023)
                      </div>
                    </div>
                    <div className="border border-border rounded-lg p-4">
                      <div className="text-sm font-medium text-foreground mb-2">Results</div>
                      <div className="text-sm text-muted-foreground">
                        AUC: 0.847 (95% CI: 0.821–0.873), p &lt; 0.001
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Panel */}
                <div className="w-56 border-l border-border bg-muted/20 p-4 hidden lg:block">
                  <div className="text-xs font-medium text-muted-foreground mb-3">CONTEXT</div>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="text-muted-foreground text-xs mb-1">Confidence</div>
                      <div className="text-foreground">High</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground text-xs mb-1">Assumptions</div>
                      <div className="text-foreground text-xs">Missing data &lt; 5%</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground text-xs mb-1">Red Flags</div>
                      <div className="text-amber-600 dark:text-amber-500 text-xs">
                        Check class imbalance
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30 border-y border-border/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-4">
              Built for Research Transparency
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tools designed to support rigorous, reproducible medical research.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-border/60 bg-card/50 shadow-none">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  Interactive Research Notebook
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Document analyses step-by-step with modular sections for claims, 
                  datasets, preprocessing, results, and interpretations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 shadow-none">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  Customizable Project Management
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Organize work into projects and analyses. All names and labels 
                  are fully editable to match your research structure.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 shadow-none">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  Built-In Transparency Checks
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Flag potential issues like data leakage, overfitting, or class 
                  imbalance. Track assumptions and confidence throughout.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/40">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 Reportalyst. Built for medical research.
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
