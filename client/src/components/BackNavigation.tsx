import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function BackNavigation() {
  const [location] = useLocation();

  if (location === "/") return null;

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-2 cursor-pointer flex items-center gap-2"
      onClick={() => window.history.back()}
      data-testid="btn-back-navigation"
    >
      <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium text-muted-foreground">
        ÖNCEKİ SAYFA GERİ DÖN
      </span>
    </div>
  );
}
