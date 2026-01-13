import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, Scale, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { VendorComparisonChart } from "@/components/vendor/VendorComparisonChart";
import { VendorComparisonCard } from "@/components/vendor/VendorComparisonCard";
import { VendorMatchingEngine } from "@/lib/matching-engine";
import type { Database } from "@/integrations/supabase/types";
import type { VendorMatchResult } from "@/types/vendor-attributes";

type VendorProfile = Database["public"]["Tables"]["vendor_profiles"]["Row"];
type VendorCategory = Database["public"]["Enums"]["vendor_category"];

const CATEGORY_LABELS: Record<VendorCategory, string> = {
  venue: "Площадка",
  photographer: "Фотограф",
  videographer: "Видеограф",
  caterer: "Кейтеринг",
  florist: "Флорист",
  decorator: "Декоратор",
  music: "Музыка",
  makeup: "Визажист",
  clothing: "Одежда",
  transport: "Транспорт",
  other: "Другое",
};

const MAX_COMPARE = 3;

export default function VendorCompare() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<VendorCategory>(
    (searchParams.get("category") as VendorCategory) || "photographer"
  );
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [allVendors, setAllVendors] = useState<VendorProfile[]>([]);
  const [matchResults, setMatchResults] = useState<Map<string, VendorMatchResult>>(
    new Map()
  );
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>(() => {
    const ids = searchParams.get("vendors");
    return ids ? ids.split(",").filter(Boolean) : [];
  });
  const [weddingPlanId, setWeddingPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch wedding plan
  useEffect(() => {
    const fetchWeddingPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: plan } = await supabase
        .from("wedding_plans")
        .select("id")
        .eq("couple_user_id", user.id)
        .maybeSingle();

      if (plan) {
        setWeddingPlanId(plan.id);
      }
    };

    fetchWeddingPlan();
  }, []);

  // Fetch all vendors for category
  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("category", selectedCategory)
        .order("rating", { ascending: false });

      if (error) {
        toast.error("Ошибка загрузки вендоров");
        return;
      }

      setAllVendors(data || []);
    };

    fetchVendors();
  }, [selectedCategory]);

  // Fetch match results
  const fetchMatchResults = useCallback(async () => {
    if (!weddingPlanId || selectedVendorIds.length === 0) {
      setMatchResults(new Map());
      return;
    }

    setLoading(true);

    try {
      const params = await VendorMatchingEngine.getWeddingParams(weddingPlanId);
      if (!params) {
        setLoading(false);
        return;
      }

      const results = await VendorMatchingEngine.findMatches(
        params,
        {
          category: selectedCategory,
          availableOnDate: params.weddingDate,
        },
        { includeExcluded: true, limit: 100 }
      );

      const resultsMap = new Map<string, VendorMatchResult>();
      results.forEach((result) => {
        resultsMap.set(result.vendorId, result);
      });

      setMatchResults(resultsMap);
    } catch (error) {
      console.error("Error fetching match results:", error);
    }

    setLoading(false);
  }, [weddingPlanId, selectedCategory, selectedVendorIds]);

  useEffect(() => {
    if (weddingPlanId) {
      fetchMatchResults();
    }
  }, [weddingPlanId, fetchMatchResults]);

  // Update selected vendors data
  useEffect(() => {
    const selected = allVendors.filter((v) => selectedVendorIds.includes(v.id));
    setVendors(selected);
  }, [allVendors, selectedVendorIds]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("category", selectedCategory);
    if (selectedVendorIds.length > 0) {
      params.set("vendors", selectedVendorIds.join(","));
    }
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedVendorIds, setSearchParams]);

  const handleCategoryChange = (category: VendorCategory) => {
    setSelectedCategory(category);
    setSelectedVendorIds([]);
    setVendors([]);
  };

  const handleAddVendor = (vendorId: string) => {
    if (selectedVendorIds.includes(vendorId)) {
      toast.info("Вендор уже добавлен");
      return;
    }
    if (selectedVendorIds.length >= MAX_COMPARE) {
      toast.error(`Можно сравнить максимум ${MAX_COMPARE} вендоров`);
      return;
    }
    setSelectedVendorIds((prev) => [...prev, vendorId]);
  };

  const handleRemoveVendor = (vendorId: string) => {
    setSelectedVendorIds((prev) => prev.filter((id) => id !== vendorId));
  };

  const vendorNames = vendors.reduce(
    (acc, v) => ({ ...acc, [v.id]: v.business_name }),
    {} as Record<string, string>
  );

  const availableVendors = allVendors.filter(
    (v) => !selectedVendorIds.includes(v.id)
  );

  const comparisonData = vendors
    .map((v) => matchResults.get(v.id))
    .filter(Boolean) as VendorMatchResult[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Scale className="h-6 w-6" />
                Сравнение вендоров
              </h1>
              <p className="text-muted-foreground">
                Сравните до {MAX_COMPARE} вендоров по всем параметрам
              </p>
            </div>
          </div>

          <Select
            value={selectedCategory}
            onValueChange={(v) => handleCategoryChange(v as VendorCategory)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add Vendor */}
        {selectedVendorIds.length < MAX_COMPARE && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Добавить вендора для сравнения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleAddVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите вендора..." />
                </SelectTrigger>
                <SelectContent>
                  {availableVendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      <div className="flex items-center gap-2">
                        <span>{vendor.business_name}</span>
                        {vendor.rating && (
                          <Badge variant="secondary" className="text-xs">
                            ★ {vendor.rating.toFixed(1)}
                          </Badge>
                        )}
                        {vendor.verified && (
                          <Badge variant="outline" className="text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Comparison Content */}
        {vendors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Выберите вендоров для сравнения
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Добавьте от 2 до {MAX_COMPARE} вендоров из категории "
                {CATEGORY_LABELS[selectedCategory]}", чтобы увидеть детальное
                сравнение с радар-диаграммой
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Radar Chart */}
            {comparisonData.length >= 2 && (
              <VendorComparisonChart
                vendors={comparisonData}
                vendorNames={vendorNames}
              />
            )}

            {/* Vendor Cards */}
            <div
              className={`grid gap-4 ${
                vendors.length === 1
                  ? "grid-cols-1 max-w-md"
                  : vendors.length === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {vendors.map((vendor) => {
                const matchResult = matchResults.get(vendor.id);
                if (!matchResult) {
                  // Создаём пустой результат, если нет данных matching
                  const emptyResult: VendorMatchResult = {
                    vendorId: vendor.id,
                    matchScore: 0,
                    reasons: [],
                    excluded: false,
                    availableOnDate: true,
                    categoryScores: {
                      style: 0,
                      rating: 0,
                      budget: 0,
                      experience: 0,
                      categorySpecific: 0,
                      verification: 0,
                    },
                  };
                  return (
                    <VendorComparisonCard
                      key={vendor.id}
                      vendor={vendor}
                      matchResult={emptyResult}
                      onRemove={() => handleRemoveVendor(vendor.id)}
                      onViewDetails={() =>
                        navigate(`/marketplace/${vendor.id}`)
                      }
                    />
                  );
                }
                return (
                  <VendorComparisonCard
                    key={vendor.id}
                    vendor={vendor}
                    matchResult={matchResult}
                    onRemove={() => handleRemoveVendor(vendor.id)}
                    onViewDetails={() => navigate(`/marketplace/${vendor.id}`)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
