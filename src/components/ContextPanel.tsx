import { Check, AlertTriangle, Circle } from "lucide-react";

const ContextPanel = () => {
  return (
    <aside className="w-72 shrink-0 border-l border-border/30 bg-background/50 overflow-y-auto">
      <div className="p-4 border-b border-border/30">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
          Context & Safety
        </h2>
      </div>

      <div className="p-4 space-y-5">
        {/* Model Snapshot */}
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
            Model Snapshot
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seed</span>
              <span className="font-mono text-foreground/70">42</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fold</span>
              <span className="font-mono text-foreground/70">3 / 5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Run ID</span>
              <span className="font-mono text-foreground/70">RPT-0219</span>
            </div>
          </div>
        </section>

        {/* Assumptions */}
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
            Assumptions
          </h3>
          <ul className="space-y-1.5 text-xs">
            {[
              "Labels are correct",
              "Masks are accurate",
              "No site leakage",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                <span className="text-foreground/70">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Red Flags - Visually prominent */}
        <section className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-destructive/80 mb-2">
            Red Flags
          </h3>
          <ul className="space-y-2 text-xs">
            {[
              "Single-center dataset",
              "No external validation",
              "Feature count > samples",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive/70 shrink-0 mt-0.5" />
                <span className="text-destructive/90 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Overall Confidence */}
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
            Overall Confidence
          </h3>
          <div className="space-y-2">
            {/* Confidence bar */}
            <div className="relative">
              <div className="flex justify-between text-[9px] text-muted-foreground/60 mb-1">
                <span>Low</span>
                <span>High</span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full relative">
                {/* Marker at ~50% for "Moderate" */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-foreground/60 rounded-full border-2 border-background"
                  style={{ left: "50%" }}
                />
              </div>
              <div className="text-center mt-1.5">
                <span className="text-xs font-medium text-foreground/80">Moderate</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              Based on dataset diversity, validation strategy, and stability tests.
            </p>
          </div>
        </section>

        {/* Next Actions - De-emphasized */}
        <section className="pt-2 border-t border-border/30">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2">
            Next Actions
          </h3>
          <ul className="space-y-1 text-[11px] text-muted-foreground/60">
            {[
              "Add scanner harmonization",
              "Test stability across folds",
              "Compare against random forest baseline",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Circle className="h-1.5 w-1.5 fill-muted-foreground/30 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
};

export default ContextPanel;
