import { cn } from "@/lib/utils";

interface OutputSectionProps {
  title: string;
  content: string;
  variant?: "default" | "warning" | "muted";
}

const OutputSection = ({ title, content, variant = "default" }: OutputSectionProps) => {
  return (
    <section className="bg-card/80 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {content ? (
        <div
          className={cn(
            "text-sm font-serif leading-relaxed p-4 rounded-lg",
            variant === "warning" && "bg-amber-50/80 dark:bg-amber-950/20 border-l-2 border-amber-400",
            variant === "muted" && "bg-muted/40 border-l-2 border-muted-foreground/30 italic",
            variant === "default" && "bg-background/60"
          )}
        >
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Results will appear here after analysis
        </p>
      )}
    </section>
  );
};

export default OutputSection;
