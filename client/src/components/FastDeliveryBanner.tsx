import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const MAMA_SUBCATEGORIES = [
  "mama-markalari",
  "acik-mama",
  "yas-mama",
  "kedi-mamasi",
  "kedi-konserve",
];

function getTurkeyTime(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
}

function getDeliveryDeadline(): Date | null {
  const now = getTurkeyTime();
  const hour = now.getHours();
  const day = now.getDay();
  if (day === 0 || hour < 12 || hour >= 18) return null;
  const deadline = new Date(now);
  deadline.setHours(18, 0, 0, 0);
  return deadline;
}

function getTimeRemaining(): { hours: number; minutes: number; seconds: number } | null {
  const deadline = getDeliveryDeadline();
  if (!deadline) return null;
  const now = getTurkeyTime();
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return null;
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function shouldShowFastDelivery(animal: string, subcategory: string): boolean {
  if (animal !== "kedi" && animal !== "kopek") return false;
  if (!MAMA_SUBCATEGORIES.includes(subcategory)) return false;
  return getDeliveryDeadline() !== null;
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center" data-testid={`timer-${label}`}>
      <div
        className="text-base font-bold rounded-md px-2 py-1 min-w-[36px] text-center"
        style={{ backgroundColor: "#fff3e0", color: "#e65100" }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

export default function FastDeliveryBanner() {
  const [remaining, setRemaining] = useState(getTimeRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!remaining) return null;

  const totalMinutes = remaining.hours * 60 + remaining.minutes;
  const hourText = remaining.hours > 0 ? `${remaining.hours} saat ` : "";
  const minText = `${remaining.minutes} dakika`;

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
      style={{ backgroundColor: "#fff8f0", border: "1px solid #ffe0b2" }}
      data-testid="banner-fast-delivery"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Clock className="w-5 h-5 shrink-0" style={{ color: "#e65100" }} />
        <span className="text-sm font-semibold" style={{ color: "#bf360c" }}>
          {hourText}{minText} içinde sipariş ver, aynı gün kargoda!
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <TimeBox value={remaining.hours} label="sa" />
        <TimeBox value={remaining.minutes} label="dk" />
        <TimeBox value={remaining.seconds} label="sn" />
      </div>
    </div>
  );
}
