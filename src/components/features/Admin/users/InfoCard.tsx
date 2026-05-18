import { Button } from "@/components/ui/button";
import { FileText, FileTextIcon } from "lucide-react";

 export default function InfoCard({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="p-3 bg-muted/30 rounded-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium break-all">{value}</p>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={copyToClipboard}
          >
            <FileTextIcon className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
