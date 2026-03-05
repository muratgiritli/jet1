import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Clock, Home, Activity, Zap } from "lucide-react";

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

const ACTIVITY_MULTIPLIERS = [
  { key: "low", label: "Az Hareketli", icon: Home, multiplier: 0.85 },
  { key: "normal", label: "Normal", icon: Activity, multiplier: 1.0 },
  { key: "high", label: "Çok Aktif", icon: Zap, multiplier: 1.2 },
] as const;

function parsePackageWeight(productName: string): number | null {
  const cleaned = productName.replace(/\d+\s*(?:adet|lu|'lu|'lü|lü|x\s*\d+)/gi, "");
  const kgMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (kgMatch) return parseFloat(kgMatch[1].replace(",", ".")) * 1000;
  const grMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*gr/i);
  if (grMatch) return parseFloat(grMatch[1].replace(",", "."));
  return null;
}

function getBaseGrams(animalType: "kedi" | "kopek", weightKg: number): number {
  const guide = FEEDING_GUIDE[animalType];
  for (const tier of guide) {
    if (weightKg <= tier.maxKg) return tier.gramsPerDay;
  }
  return guide[guide.length - 1].gramsPerDay;
}

interface FoodCalculatorProps {
  productId: number;
  productName: string;
  productPrice: number;
  defaultAnimal?: "kedi" | "kopek";
}

export default function FoodCalculator({ productName, productPrice, defaultAnimal }: FoodCalculatorProps) {
  const animalType = defaultAnimal || "kedi";
  const isKedi = animalType === "kedi";
  const maxWeight = isKedi ? 15 : 60;
  const defaultWeight = isKedi ? 4 : 15;
  const mealCount = isKedi ? 3 : 2;
  const animalLabel = isKedi ? "Kedi" : "Köpek";

  const [portionWeight, setPortionWeight] = useState(defaultWeight);
  const [activity, setActivity] = useState<"low" | "normal" | "high">("low");
  const [durationWeight, setDurationWeight] = useState(isKedi ? 5 : 20);

  const packageGrams = useMemo(() => parsePackageWeight(productName), [productName]);

  const activityMultiplier = ACTIVITY_MULTIPLIERS.find(a => a.key === activity)!.multiplier;

  const portionResult = useMemo(() => {
    const base = getBaseGrams(animalType, portionWeight);
    const daily = Math.round(base * activityMultiplier);
    const perMeal = Math.round(daily / mealCount);
    return { daily, perMeal, mealCount };
  }, [animalType, portionWeight, activityMultiplier, mealCount]);

  const durationResult = useMemo(() => {
    if (!packageGrams) return null;
    const dailyGrams = Math.round(getBaseGrams(animalType, durationWeight) * 1.0);
    const days = Math.max(1, Math.floor(packageGrams / dailyGrams));
    const weeks = (days / 7).toFixed(1);
    const months = (days / 30).toFixed(1);
    const dailyCost = productPrice / days;
    return { dailyGrams, days, weeks, months, dailyCost };
  }, [animalType, durationWeight, packageGrams, productPrice]);

  if (!packageGrams) return null;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border border-gray-200" data-testid="card-portion-calculator">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
          <UtensilsCrossed className="w-5 h-5 text-gray-700" />
          <h3 className="font-bold text-base text-gray-900" data-testid="text-portion-title">Günlük Porsiyon Hesaplayıcı</h3>
        </div>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {animalLabel} ağırlığı: <span className="font-bold text-gray-900">{portionWeight} kg</span>
            </p>
            <input
              type="range"
              min={1}
              max={maxWeight}
              step={1}
              value={portionWeight}
              onChange={(e) => setPortionWeight(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
              style={{ background: `linear-gradient(to right, #f97316 0%, #f97316 ${((portionWeight - 1) / (maxWeight - 1)) * 100}%, #e5e7eb ${((portionWeight - 1) / (maxWeight - 1)) * 100}%, #e5e7eb 100%)` }}
              data-testid="slider-portion-weight"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>1 kg</span>
              <span>{maxWeight} kg</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Aktivite Seviyesi</p>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_MULTIPLIERS.map((a) => {
                const Icon = a.icon;
                const isActive = activity === a.key;
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setActivity(a.key)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all border ${
                      isActive
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                    data-testid={`btn-activity-${a.key}`}
                  >
                    <Icon className="w-5 h-5" />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              <div className="p-3">
                <p className="text-xs text-gray-500">Günlük toplam:</p>
                <p className="text-xl font-bold text-orange-600" data-testid="text-daily-total">{portionResult.daily} gram</p>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500">Öğün sayısı:</p>
                <p className="text-xl font-bold text-gray-900" data-testid="text-meal-count">Günde {portionResult.mealCount} öğün</p>
              </div>
            </div>
            <div className="border-t border-gray-200 p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Öğün başına:</span>
                <span className="text-xl font-bold text-gray-900" data-testid="text-per-meal">~{portionResult.perMeal} gram</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {durationResult && (
        <Card className="overflow-hidden border border-gray-200" data-testid="card-duration-calculator">
          <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
            <Clock className="w-5 h-5 text-gray-700" />
            <h3 className="font-bold text-base text-gray-900" data-testid="text-duration-title">Kaç Gün Gider?</h3>
          </div>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {animalLabel} ağırlığı: <span className="font-bold text-gray-900">{durationWeight} kg</span>
              </p>
              <input
                type="range"
                min={1}
                max={maxWeight}
                step={1}
                value={durationWeight}
                onChange={(e) => setDurationWeight(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
                style={{ background: `linear-gradient(to right, #f97316 0%, #f97316 ${((durationWeight - 1) / (maxWeight - 1)) * 100}%, #e5e7eb ${((durationWeight - 1) / (maxWeight - 1)) * 100}%, #e5e7eb 100%)` }}
                data-testid="slider-duration-weight"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>1 kg</span>
                <span>{maxWeight} kg</span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-gray-200">
                <div className="p-3">
                  <p className="text-xs text-gray-500">Günlük porsiyon:</p>
                  <p className="font-bold text-gray-900" data-testid="text-duration-daily">{durationResult.dailyGrams} g</p>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500">Paket süresi:</p>
                  <p className="text-xl font-bold text-gray-900" data-testid="text-duration-days">{durationResult.days} gün</p>
                </div>
              </div>
              <div className="border-t border-gray-200 p-3">
                <p className="text-xs text-gray-500">
                  ({durationResult.weeks} hafta / ~{durationResult.months} ay)
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Günlük maliyet:</span>
                <span className="text-xl font-bold text-orange-600" data-testid="text-daily-cost">
                  {durationResult.dailyCost.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL/gün
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
