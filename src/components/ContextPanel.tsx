import { cn } from "@/lib/utils";
import { Check, AlertTriangle } from "lucide-react";

interface ContextPanelProps {
  hasResults: boolean;
}

const ContextPanel = ({ hasResults }: ContextPanelProps) => {
  return (
    <aside className="w-72 shrink-0 border-l border-border/50 bg-card/30 overflow-y-auto">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Context Panel</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Model Snapshot */}
        <section className="bg-card/60 rounded-lg p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Analysis Snapshot
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium text-foreground">Gemini 2.5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-foreground">Language Analysis</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Run ID</span>
              <span className="font-mono text-xs text-foreground">RPT-{String(Date.now()).slice(-4)}</span>
            </div>
          </div>
        </section>

        {/* Assumptions */}
        <section className="bg-card/60 rounded-lg p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Assumptions
          </h3>
          <ul className="space-y-2 text-sm">
            {[
              "Report is pancreatic-related",
              "Text is from imaging study",
              "No clinical context needed",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span className="text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Red Flags */}
        <section className="bg-card/60 rounded-lg p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Red Flags
          </h3>
          {hasResults ? (
            <ul className="space-y-2 text-sm">
              {[
                "Review implied concerns carefully",
                "Hedging may obscure findings",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-amber-700 dark:text-amber-400">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Submit a report to see analysis flags
            </p>
          )}
        </section>

        {/* Confidence Indicator */}
        <section className="bg-card/60 rounded-lg p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Overall Confidence
          </h3>
          {hasResults ? (
            <>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "72%",
                    background: "linear-gradient(90deg, hsl(var(--chart-1)), hsl(var(--chart-3)))",
                  }}
                />
              </div>
              <p className="text-sm font-medium text-center text-foreground">Moderate</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Based on language clarity and specificity
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Awaiting analysis
            </p>
          )}
        </section>
      </div>
    </aside>
  );
};

export default ContextPanel;
