import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { AlertTriangle } from "lucide-react";

const rocData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.1, tpr: 0.35 },
  { fpr: 0.2, tpr: 0.52 },
  { fpr: 0.3, tpr: 0.62 },
  { fpr: 0.4, tpr: 0.68 },
  { fpr: 0.5, tpr: 0.74 },
  { fpr: 0.6, tpr: 0.79 },
  { fpr: 0.7, tpr: 0.84 },
  { fpr: 0.8, tpr: 0.89 },
  { fpr: 0.9, tpr: 0.94 },
  { fpr: 1, tpr: 1 },
];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="bg-card/80 rounded-xl p-6 shadow-sm">
    <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </section>
);

const AnalysisNotebook = () => {
  return (
    <div className="space-y-6">
      {/* Primary Claim */}
      <Section title="Primary Claim">
        <p className="text-base font-serif leading-relaxed text-foreground">
          Radiomic features extracted from pancreatic CT scans can distinguish PDAC from non-PDAC beyond chance.
        </p>
      </Section>

      {/* Dataset */}
      <Section title="Dataset">
        <ul className="text-sm font-serif leading-relaxed text-foreground/90 space-y-1.5 mb-4">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>182 CT volumes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Single-center, contrast-enhanced</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Labels: PDAC (n=96), non-PDAC (n=86)</span>
          </li>
        </ul>
        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-md px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>Scanner heterogeneity not yet controlled.</span>
        </div>
      </Section>

      {/* Preprocessing Decisions */}
      <Section title="Preprocessing Decisions">
        <ul className="text-sm font-serif leading-relaxed text-foreground/90 space-y-1.5 mb-4">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Resampled to 1×1×1 mm</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Z-score normalization per volume</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Pancreas-only mask used</span>
          </li>
        </ul>
        <p className="text-xs italic text-muted-foreground">
          Why this matters: Feature scale stability and anatomical specificity.
        </p>
      </Section>

      {/* Results */}
      <Section title="Results">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <ul className="text-sm font-serif leading-relaxed text-foreground/90 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Validation AUC: 0.71</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Accuracy: 0.66</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>Precision (PDAC): 0.69</span>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-40 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocData} margin={{ top: 5, right: 5, bottom: 20, left: 20 }}>
                <XAxis 
                  dataKey="fpr" 
                  tick={{ fontSize: 9 }} 
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  label={{ value: 'FPR', position: 'bottom', fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fontSize: 9 }} 
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  label={{ value: 'TPR', angle: -90, position: 'left', fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tpr" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line 
                  type="linear"
                  data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                  dataKey="tpr"
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>

      {/* Interpretation */}
      <Section title="Interpretation">
        <p className="text-[15px] font-serif leading-relaxed text-foreground">
          The model captures signal beyond chance, but effect size is modest.
          <br />
          Given the single-center data and handcrafted features, this result supports feasibility, not clinical readiness.
        </p>
      </Section>

      {/* Next Actions */}
      <Section title="Next Actions">
        <ul className="text-sm font-serif leading-relaxed text-foreground/90 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Add scanner harmonization</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Test stability across folds</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>Compare against random forest baseline</span>
          </li>
        </ul>
      </Section>
    </div>
  );
};

export default AnalysisNotebook;
