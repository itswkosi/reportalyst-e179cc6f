import { Check } from "lucide-react";

const ContextPanel = () => {
  return (
    <aside className="w-64 shrink-0 border-l border-border/20 bg-muted/20 overflow-y-auto">
      <div className="p-5 space-y-6 text-xs">
        {/* Model Snapshot */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-2">
            Run Details
          </h3>
          <div className="space-y-1 text-muted-foreground font-mono">
            <div className="flex justify-between">
              <span>Seed</span>
              <span className="text-foreground/60">42</span>
            </div>
            <div className="flex justify-between">
              <span>Fold</span>
              <span className="text-foreground/60">3 / 5</span>
            </div>
            <div className="flex justify-between">
              <span>Run ID</span>
              <span className="text-foreground/60">RPT-0219</span>
            </div>
          </div>
        </section>

        <hr className="border-border/20" />

        {/* Assumptions */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-2">
            Assumptions
          </h3>
          <ul className="space-y-1.5 text-muted-foreground">
            {[
              "Labels are correct",
              "Masks are accurate",
              "No site leakage",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-3 w-3 opacity-40 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="border-border/20" />

        {/* Red Flags */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-2">
            Limitations
          </h3>
          <ul className="space-y-1.5 text-foreground/70">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/50">—</span>
              <span>Single-center dataset</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/50">—</span>
              <span>No external validation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground/50">—</span>
              <span>Feature count exceeds samples</span>
            </li>
          </ul>
        </section>

        <hr className="border-border/20" />

        {/* Overall Confidence */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-3">
            Confidence
          </h3>
          <div className="space-y-2">
            <div className="relative">
              <div className="flex justify-between text-[9px] text-muted-foreground/40 mb-1">
                <span>Low</span>
                <span>High</span>
              </div>
              <div className="h-px bg-border/40 relative">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-foreground/50 rounded-full"
                  style={{ left: "50%", transform: "translate(-50%, -50%)" }}
                />
              </div>
            </div>
            <p className="text-center text-muted-foreground">
              Moderate
            </p>
            <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
              Based on dataset diversity, validation strategy, and stability tests.
            </p>
          </div>
        </section>

        <hr className="border-border/20" />

        {/* Next Actions */}
        <section>
          <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground/40 mb-2">
            Pending
          </h3>
          <ul className="space-y-1 text-muted-foreground/50">
            <li>Scanner harmonization</li>
            <li>Cross-fold stability</li>
            <li>RF baseline comparison</li>
          </ul>
        </section>
      </div>
    </aside>
  );
};

export default ContextPanel;
