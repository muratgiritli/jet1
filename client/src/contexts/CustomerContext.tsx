import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CustomerData {
  id: number;
  phone: string;
  name: string;
  address: string | null;
  notifyStock: boolean;
  notifyCampaign: boolean;
}

interface CustomerContextType {
  customer: CustomerData | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, name: string, address?: string) => Promise<void>;
  loginWithOtp: (phone: string, code: string, name?: string, address?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; address?: string }) => Promise<void>;
  refetch: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const syncLocalFavorites = useCallback(async () => {
    try {
      const localFavs = JSON.parse(localStorage.getItem("jet55_favorites") || "[]");
      if (localFavs.length > 0) {
        const productIds = localFavs.map((f: any) => Number(f.id)).filter((id: number) => !isNaN(id));
        if (productIds.length > 0) {
          await apiRequest("POST", "/api/customer/favorites/sync", { productIds });
          localStorage.removeItem("jet55_favorites");
          window.dispatchEvent(new Event("favorites-changed"));
        }
      }
    } catch {}
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const res = await apiRequest("POST", "/api/customer/login", { phone, password });
    const data = await res.json();
    setCustomer(data);
    setTimeout(syncLocalFavorites, 500);
  }, [syncLocalFavorites]);

  const register = useCallback(async (phone: string, password: string, name: string, address?: string) => {
    const res = await apiRequest("POST", "/api/customer/register", { phone, password, name, address });
    const data = await res.json();
    setCustomer(data);
    setTimeout(syncLocalFavorites, 500);
  }, [syncLocalFavorites]);

  const loginWithOtp = useCallback(async (phone: string, code: string, name?: string, address?: string) => {
    const res = await apiRequest("POST", "/api/otp/verify", { phone, code, name, address });
    const data = await res.json();
    if (data.deviceToken) {
      try {
        const tokens = JSON.parse(localStorage.getItem("jetgo_trusted_devices") || "{}");
        tokens[phone] = data.deviceToken;
        localStorage.setItem("jetgo_trusted_devices", JSON.stringify(tokens));
      } catch {}
    }
    setCustomer(data);
    setTimeout(syncLocalFavorites, 500);
  }, [syncLocalFavorites]);

  const logout = useCallback(async () => {
    await apiRequest("POST", "/api/customer/logout");
    setCustomer(null);
    queryClient.removeQueries({ queryKey: ["/api/customer/orders"] });
    queryClient.removeQueries({ queryKey: ["/api/customer/favorites"] });
    queryClient.removeQueries({ queryKey: ["/api/customer/favorites/details"] });
    queryClient.removeQueries({ queryKey: ["/api/customer/addresses"] });
    queryClient.removeQueries({ queryKey: ["/api/customer/pets"] });
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; address?: string }) => {
    const res = await apiRequest("PATCH", "/api/customer/profile", data);
    const updated = await res.json();
    setCustomer(updated);
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoading,
        isLoggedIn: !!customer,
        login,
        register,
        loginWithOtp,
        logout,
        updateProfile,
        refetch: fetchMe,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
  return ctx;
}
