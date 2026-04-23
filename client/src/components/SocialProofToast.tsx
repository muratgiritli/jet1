import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";

interface RecentOrder {
  firstName: string;
  district: string;
  productName: string;
  timeLabel: string;
}

const HIDDEN_PATHS = ["/odeme", "/admin", "/giris", "/hesabim", "/demo", "/demo1", "/demo2", "/demo-kampanya"];

function shouldHide(path: string) {
  return HIDDEN_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export default function SocialProofToast() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<RecentOrder | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const indexRef = useRef(0);

  const { data: orders = [] } = useQuery<RecentOrder[]>({
    queryKey: ["/api/social-proof/recent"],
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    enabled: !dismissed && !shouldHide(location),
  });

  useEffect(() => {
    try {
      if (sessionStorage.getItem("jetgo_fomo_dismissed") === "1") setDismissed(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (dismissed || shouldHide(location) || orders.length === 0) {
      setVisible(false);
      return;
    }

    let cancelled = false;
    const showOne = () => {
      if (cancelled) return;
      const next = orders[indexRef.current % orders.length];
      indexRef.current += 1;
      setCurrent(next);
      setVisible(true);
      const hideT = setTimeout(() => {
        if (!cancelled) setVisible(false);
      }, 6000);
      return () => clearTimeout(hideT);
    };

    const initT = setTimeout(showOne, 12000);
    const cycleT = setInterval(showOne, 35000);
    return () => {
      cancelled = true;
      clearTimeout(initT);
      clearInterval(cycleT);
    };
  }, [orders, dismissed, location]);

  if (dismissed || shouldHide(location) || !current) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed left-3 z-[9990] max-w-[300px]"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 76px)" }}
          data-testid="toast-social-proof"
        >
          <div className="bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex gap-2.5 items-start">
            <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-[#6B3480] dark:text-purple-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight" data-testid="text-fomo-name">
                <span className="text-[#6B3480] dark:text-purple-300">{current.firstName}</span>
                {current.district ? <span className="text-gray-600 dark:text-gray-400 font-normal"> · {current.district}</span> : null}
              </p>
              <p className="text-[11px] text-gray-700 dark:text-gray-300 mt-0.5 line-clamp-2" data-testid="text-fomo-product">
                <span className="font-medium">{current.productName}</span> sipariş verdi
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5" data-testid="text-fomo-time">{current.timeLabel}</p>
            </div>
            <button
              onClick={() => {
                setDismissed(true);
                try { sessionStorage.setItem("jetgo_fomo_dismissed", "1"); } catch {}
              }}
              className="text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 shrink-0"
              aria-label="Kapat"
              data-testid="btn-fomo-dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
