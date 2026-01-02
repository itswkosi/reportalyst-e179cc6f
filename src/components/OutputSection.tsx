import { cn } from "@/lib/utils";

interface OutputSectionProps {
  title: string;
  content: string;
  variant?: "default" | "warning" | "muted";
}

const OutputSection = ({ title, content, variant = "default" }: OutputSectionProps) => {
  return (
    <div className="bg-card border border-border shadow-sm">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">
        {content ? (
          <div
            className={cn(
              "text-sm font-serif leading-relaxed p-4",
              variant === "warning" && "bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-400",
              variant === "muted" && "bg-muted/30 border-l-2 border-muted italic",
              variant === "default" && "bg-background"
            )}
          >
            {content}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Results will appear here after analysis
          </p>
        )}
      </div>
    </div>
  );
};

export default OutputSection;
