import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackNavigation() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.history.back()}
        className="text-muted-foreground gap-2 px-2"
        data-testid="button-back-navigation"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        ÖNCEKİ SAYFA GERİ DÖN
      </Button>
    </div>
  );
}
