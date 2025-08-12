import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CarSample, QueryInput, KnnResult } from "@/utils/pricing/knn";
import { suggestPriceKNN } from "@/utils/pricing/knn";

export function usePriceSuggestion(input: QueryInput, opts?: { k?: number; roundStep?: number }) {
  const [data, setData] = useState<CarSample[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("make,model,year,price,condition,fuel_type,description")
        .eq("is_sold", false);

      if (error) throw error;

      const cleaned: CarSample[] = (data || [])
        .filter((d: any) => d && d.make && d.model && Number.isFinite(d.year) && Number.isFinite(d.price))
        .map((d: any) => ({
          make: d.make,
          model: d.model,
          year: Number(d.year),
          price: Number(d.price),
          condition: d.condition,
          fuel_type: d.fuel_type || undefined,
          description: typeof d.description === "string" ? d.description : undefined,
        }));

      setData(cleaned);
    } catch (e: any) {
      console.error("usePriceSuggestion fetch error", e);
      setError(e?.message || "Failed to load pricing data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch once when mounted
    fetchData();
  }, [fetchData]);

  const result: KnnResult = useMemo(() => {
    if (!data) return { suggestedPrice: null, neighbors: [], confidence: 0 };
    return suggestPriceKNN(input, data, opts?.k ?? 5, opts?.roundStep ?? 1000);
  }, [data, input.make, input.model, input.year, input.condition, input.fuelType, input.description, opts?.k, opts?.roundStep]);

  return {
    loading,
    error,
    result,
    refetch: fetchData,
  };
}
