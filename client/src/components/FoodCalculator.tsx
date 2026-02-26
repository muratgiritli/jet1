import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, Cat, Dog, Bell, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const FEEDING_GUIDE = {
  kedi: [
    { maxKg: 2, gramsPerDay: 30 },
    { maxKg: 3, gramsPerDay: 40 },
    { maxKg: 4, gramsPerDay: 50 },
    { maxKg: 5, gramsPerDay: 60 },
    { maxKg: 6, gramsPerDay: 70 },
    { maxKg: 8, gramsPerDay: 80 },
    { maxKg: 100, gramsPerDay: 90 },
  ],
  kopek: [
    { maxKg: 5, gramsPerDay: 100 },
    { maxKg: 10, gramsPerDay: 170 },
    { maxKg: 15, gramsPerDay: 230 },
    { maxKg: 20, gramsPerDay: 280 },
    { maxKg: 25, gramsPerDay: 330 },
    { maxKg: 30, gramsPerDay: 380 },
    { maxKg: 40, gramsPerDay: 450 },
    { maxKg: 50, gramsPerDay: 520 },
    { maxKg: 100, gramsPerDay: 650 },
  ],
};

function getAgeMultiplier(ageYears: number): number {
  if (ageYears < 1) return 1.5;
  if (ageYears <= 7) return 1.0;
  return 0.85;
}

function parsePackageWeight(productName: string): number | null {
  const cleaned = productName.replace(/\d+\s*(?:adet|lu|'lu|'lü|lü|x\s*\d+)/gi, "");
  const kgMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (kgMatch) return parseFloat(kgMatch[1].replace(",", ".")) * 1000;
  const grMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*gr/i);
  if (grMatch) return parseFloat(grMatch[1].replace(",", "."));
  const ltMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*lt/i);
  if (ltMatch) return null;
  return null;
}

function calculateDailyGrams(animalType: "kedi" | "kopek", weightKg: number, ageYears: number): number {
  const guide = FEEDING_GUIDE[animalType];
  let baseGrams = guide[guide.length - 1].gramsPerDay;
  for (const tier of guide) {
    if (weightKg <= tier.maxKg) {
      baseGrams = tier.gramsPerDay;
      break;
    }
  }
  return Math.round(baseGrams * getAgeMultiplier(ageYears));
}

interface FoodCalculatorProps {
  productId: number;
  productName: string;
  defaultAnimal?: "kedi" | "kopek";
}

export default function FoodCalculator({ productId, productName, defaultAnimal }: FoodCalculatorProps) {
  const [animalType, setAnimalType] = useState<"kedi" | "kopek">(defaultAnimal || "kedi");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState<{ dailyGrams: number; packageGrams: number; estimatedDays: number; dailyCost: number } | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderPhone, setReminderPhone] = useState("");
  const [reminderName, setReminderName] = useState("");
  const [reminderSent, setReminderSent] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const { toast } = useToast();

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const a = parseFloat(age);
    if (!w || w <= 0 || isNaN(a) || a < 0) {
      toast({ title: "Lütfen geçerli kilo ve yaş girin", variant: "destructive" });
      return;
    }
    const packageGrams = parsePackageWeight(productName);
    if (!packageGrams) {
      toast({ title: "Ürün gramajı tespit edilemedi", variant: "destructive" });
      return;
    }
    const dailyGrams = calculateDailyGrams(animalType, w, a);
    const estimatedDays = Math.max(1, Math.floor(packageGrams / dailyGrams));
    setResult({ dailyGrams, packageGrams, estimatedDays, dailyCost: 0 });
    setShowReminder(false);
    setReminderSent(false);
  };

  const handleSetReminder = async () => {
    if (!result) return;
    const normalized = reminderPhone.replace(/\D/g, "");
    if (normalized.length < 10) {
      toast({ title: "Geçerli bir telefon numarası girin", variant: "destructive" });
      return;
    }
    setReminderLoading(true);
    try {
      await apiRequest("POST", "/api/reorder-reminders", {
        customerPhone: reminderPhone.trim(),
        customerName: reminderName.trim() || undefined,
        productId,
        productName,
        animalType,
        dailyGrams: result.dailyGrams,
        packageGrams: result.packageGrams,
        estimatedDays: result.estimatedDays,
      });
      setReminderSent(true);
      toast({ title: "Hatırlatma kaydedildi!", description: `${result.estimatedDays} gün sonra size haber vereceğiz.` });
    } catch {
      toast({ title: "Bir hata oluştu", variant: "destructive" });
    } finally {
      setReminderLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #fce4ec 0%, #fff 100%)" }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f8bbd0" }}>
          <Calculator className="w-5 h-5" style={{ color: "#c62828" }} />
        </div>
        <div>
          <p className="font-bold text-sm" data-testid="text-calculator-title">Akıllı Mama Hesaplama</p>
          <p className="text-xs text-muted-foreground">Dostunuz için günlük mama ihtiyacını hesaplayın</p>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setAnimalType("kedi"); setResult(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${animalType === "kedi" ? "ring-2 ring-rose-400 bg-rose-50" : "bg-gray-50 hover:bg-gray-100"}`}
            data-testid="btn-animal-kedi"
          >
            <Cat className="w-4 h-4" />
            Kedi
          </button>
          <button
            type="button"
            onClick={() => { setAnimalType("kopek"); setResult(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${animalType === "kopek" ? "ring-2 ring-rose-400 bg-rose-50" : "bg-gray-50 hover:bg-gray-100"}`}
            data-testid="btn-animal-kopek"
          >
            <Dog className="w-4 h-4" />
            Köpek
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Kilo (kg)</label>
            <Input
              type="number"
              placeholder="örn. 4"
              value={weight}
              onChange={(e) => { setWeight(e.target.value); setResult(null); }}
              data-testid="input-pet-weight"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Yaş (yıl)</label>
            <Input
              type="number"
              placeholder="örn. 3"
              value={age}
              onChange={(e) => { setAge(e.target.value); setResult(null); }}
              data-testid="input-pet-age"
            />
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          className="w-full"
          style={{ background: "linear-gradient(135deg, #e57373 0%, #ef9a9a 100%)" }}
          data-testid="btn-calculate"
        >
          <Calculator className="w-4 h-4 mr-1" />
          Hesapla
        </Button>

        {result && (
          <div className="rounded-lg p-3 space-y-2" style={{ backgroundColor: "#f3e5f5", border: "1px solid #ce93d8" }}>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 rounded-md bg-white/70">
                <p className="text-xs text-muted-foreground">Günlük İhtiyaç</p>
                <p className="font-bold text-lg" style={{ color: "#7b1fa2" }} data-testid="text-daily-grams">{result.dailyGrams} gr</p>
              </div>
              <div className="text-center p-2 rounded-md bg-white/70">
                <p className="text-xs text-muted-foreground">Bu Paket Yeter</p>
                <p className="font-bold text-lg" style={{ color: "#7b1fa2" }} data-testid="text-estimated-days">{result.estimatedDays} gün</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {result.packageGrams >= 1000 ? `${result.packageGrams / 1000} kg` : `${result.packageGrams} gr`} paket, günde {result.dailyGrams} gr tüketimle yaklaşık {result.estimatedDays} gün sürer.
            </p>

            {!reminderSent && (
              <button
                type="button"
                onClick={() => setShowReminder(!showReminder)}
                className="w-full text-center text-xs font-medium py-2 rounded-md transition-colors"
                style={{ color: "#7b1fa2", backgroundColor: "#e1bee7" }}
                data-testid="btn-show-reminder"
              >
                <Bell className="w-3.5 h-3.5 inline mr-1" />
                Mama bitince bana hatırlat
              </button>
            )}

            {showReminder && !reminderSent && (
              <div className="space-y-2 pt-1">
                <Input
                  type="tel"
                  placeholder="Telefon numaranız"
                  value={reminderPhone}
                  onChange={(e) => setReminderPhone(e.target.value)}
                  data-testid="input-reminder-phone"
                />
                <Input
                  placeholder="Adınız (isteğe bağlı)"
                  value={reminderName}
                  onChange={(e) => setReminderName(e.target.value)}
                  data-testid="input-reminder-name"
                />
                <Button
                  onClick={handleSetReminder}
                  className="w-full"
                  size="sm"
                  disabled={reminderLoading}
                  style={{ backgroundColor: "#7b1fa2" }}
                  data-testid="btn-set-reminder"
                >
                  {reminderLoading ? "Kaydediliyor..." : "Hatırlatma Kur"}
                </Button>
              </div>
            )}

            {reminderSent && (
              <div className="flex items-center gap-2 text-xs justify-center py-2 rounded-md" style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }} data-testid="text-reminder-success">
                <Check className="w-4 h-4" />
                Hatırlatma kaydedildi! Mama bitme zamanı gelince size ulaşacağız.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
