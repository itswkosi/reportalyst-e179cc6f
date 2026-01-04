import { useEffect, useState } from "react";

// Sample phrases that will animate into columns
const SAMPLE_PHRASES = {
  source: [
    "2.3 cm mass in the right upper lobe",
    "suspicious for malignancy",
    "clinical correlation recommended",
    "well-defined margins",
    "cannot exclude early invasion",
    "findings may represent",
    "located in pancreatic head",
    "further imaging advised",
  ],
  explicit: [
    "2.3 cm mass",
    "right upper lobe",
    "well-defined margins",
    "pancreatic head",
  ],
  implied: [
    "possible malignancy",
    "possible early invasion",
  ],
  hedging: [
    "clinical correlation recommended",
    "findings may represent",
    "further imaging advised",
  ],
};

interface AnimatedPhraseProps {
  text: string;
  delay: number;
  column: "explicit" | "implied" | "hedging";
}

const AnimatedPhrase = ({ text, delay, column }: AnimatedPhraseProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClass = {
    explicit: "text-primary",
    implied: "text-amber-600 dark:text-amber-500",
    hedging: "text-muted-foreground",
  }[column];

  return (
    <div
      className={`text-xs px-2 py-1 rounded bg-background/80 border border-border/40 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${colorClass}`}
    >
      {text}
    </div>
  );
};

const ParsingAnimation = () => {
  const [cycle, setCycle] = useState(0);

  // Reset animation every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCycle((c) => c + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto" key={cycle}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Source text column */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
          <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Report Text
          </h4>
          <div className="space-y-2">
            {SAMPLE_PHRASES.source.map((phrase, i) => (
              <div
                key={phrase}
                className="text-xs text-foreground/70 py-1 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {phrase}
              </div>
            ))}
          </div>
        </div>

        {/* Explicit Findings column */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <h4 className="text-xs font-medium text-primary mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Explicit
          </h4>
          <div className="space-y-2">
            {SAMPLE_PHRASES.explicit.map((phrase, i) => (
              <AnimatedPhrase
                key={phrase}
                text={phrase}
                delay={1000 + i * 400}
                column="explicit"
              />
            ))}
          </div>
        </div>

        {/* Implied Concerns column */}
        <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/20">
          <h4 className="text-xs font-medium text-amber-600 dark:text-amber-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Implied
          </h4>
          <div className="space-y-2">
            {SAMPLE_PHRASES.implied.map((phrase, i) => (
              <AnimatedPhrase
                key={phrase}
                text={phrase}
                delay={2500 + i * 400}
                column="implied"
              />
            ))}
          </div>
        </div>

        {/* Hedging Language column */}
        <div className="bg-muted/20 rounded-lg p-4 border border-border/40">
          <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            Hedging
          </h4>
          <div className="space-y-2">
            {SAMPLE_PHRASES.hedging.map((phrase, i) => (
              <AnimatedPhrase
                key={phrase}
                text={phrase}
                delay={3500 + i * 400}
                column="hedging"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animation caption */}
      <p className="text-center text-xs text-muted-foreground/60 mt-4">
        Watch how clinical text is parsed into structured categories
      </p>
    </div>
  );
};

export default ParsingAnimation;
