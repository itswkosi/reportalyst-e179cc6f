import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

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

const Section = ({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) => (
  <section className={className}>
    <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70 mb-3">
      {title}
    </h3>
    {children}
  </section>
);

const AnalysisNotebook = () => {
  return (
    <article className="space-y-10">
      {/* Primary Claim */}
      <header>
        <p className="text-lg font-serif leading-relaxed text-foreground">
          Radiomic features extracted from pancreatic CT scans can distinguish PDAC from non-PDAC beyond chance.
        </p>
      </header>

      <hr className="border-border/30" />

      {/* Dataset */}
      <Section title="Dataset">
        <ul className="text-sm font-serif leading-relaxed text-foreground/80 space-y-1 mb-3">
          <li>182 CT volumes</li>
          <li>Single-center, contrast-enhanced</li>
          <li>Labels: PDAC (n=96), non-PDAC (n=86)</li>
        </ul>
        <p className="text-xs text-muted-foreground italic">
          Note: Scanner heterogeneity not yet controlled.
        </p>
      </Section>

      {/* Preprocessing Decisions */}
      <Section title="Preprocessing">
        <ul className="text-sm font-serif leading-relaxed text-foreground/80 space-y-1 mb-3">
          <li>Resampled to 1×1×1 mm</li>
          <li>Z-score normalization per volume</li>
          <li>Pancreas-only mask used</li>
        </ul>
        <p className="text-xs text-muted-foreground italic">
          Why this matters: Feature scale stability and anatomical specificity.
        </p>
      </Section>

      {/* Results */}
      <Section title="Results">
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="text-sm font-serif text-foreground/80 space-y-1">
            <p>Validation AUC: 0.71</p>
            <p>Accuracy: 0.66</p>
            <p>Precision (PDAC): 0.69</p>
          </div>
          <figure className="w-36 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocData} margin={{ top: 4, right: 4, bottom: 16, left: 16 }}>
                <XAxis 
                  dataKey="fpr" 
                  tick={{ fontSize: 8 }} 
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  label={{ value: 'FPR', position: 'bottom', fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tick={{ fontSize: 8 }} 
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  label={{ value: 'TPR', angle: -90, position: 'left', fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tpr" 
                  stroke="hsl(var(--foreground))" 
                  strokeWidth={1}
                  dot={false}
                  opacity={0.5}
                />
                <Line 
                  type="linear"
                  data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                  dataKey="tpr"
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <figcaption className="text-[9px] text-muted-foreground/60 text-center mt-1">
              ROC Curve
            </figcaption>
          </figure>
        </div>
      </Section>

      {/* Interpretation */}
      <Section title="Interpretation">
        <p className="text-sm font-serif leading-relaxed text-foreground/80">
          The model captures signal beyond chance, but effect size is modest.
          Given the single-center data and handcrafted features, this result supports feasibility, not clinical readiness.
        </p>
      </Section>

      {/* Next Actions */}
      <Section title="Next Steps">
        <ul className="text-sm font-serif text-foreground/70 space-y-1">
          <li>Add scanner harmonization</li>
          <li>Test stability across folds</li>
          <li>Compare against random forest baseline</li>
        </ul>
      </Section>
    </article>
  );
};

export default AnalysisNotebook;
