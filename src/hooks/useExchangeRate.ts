import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ExchangeRateData {
  usdRate: number;
  date: string;
  loading: boolean;
  error: string | null;
}

export function useExchangeRate(): ExchangeRateData {
  const [usdRate, setUsdRate] = useState<number>(12800);
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-exchange-rate");
        
        if (error) throw error;
        
        if (data?.success) {
          setUsdRate(data.usd_rate);
          setDate(data.date);
        }
      } catch (err: any) {
        console.error("Failed to fetch exchange rate:", err);
        setError(err.message);
        // Keep fallback rate
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  return { usdRate, date, loading, error };
}

// Currency conversion utilities
export function uzsToUsd(uzs: number, rate: number): number {
  return Math.round(uzs / rate);
}

export function usdToUzs(usd: number, rate: number): number {
  return Math.round(usd * rate);
}

export function formatCurrency(amount: number, currency: "UZS" | "USD"): string {
  if (currency === "USD") {
    return `$${amount.toLocaleString()}`;
  }
  return `${amount.toLocaleString()} сум`;
}

