import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OutputSectionProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
}

const OutputSection = ({ title, content, icon }: OutputSectionProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-[120px] text-sm text-muted-foreground">
          {content || (
            <span className="italic opacity-60">
              Results will appear here after analysis
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OutputSection;
