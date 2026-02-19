import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackNavigation() {
  return (
    <div className="px-4 py-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="text-muted-foreground gap-1.5 px-2"
        data-testid="button-back-navigation"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        Geri Dön
      </Button>
    </div>
  );
}
