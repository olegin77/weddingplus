import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, ExternalLink, MapPin, Check, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { VendorMatchingEngine, WeddingMatchParams } from "@/lib/matching-engine";
import { Progress } from "@/components/ui/progress";

interface SmartVendorDrawerProps {
    category: string;
    maxPrice: number;
    weddingPlanId?: string;
}

// Маппинг budget категорий на vendor категории
const budgetToVendorCategory: Record<string, string> = {
    venue: "venue",
    catering: "caterer",
    photography: "photographer",
    videography: "videographer",
    flowers: "florist",
    decoration: "decorator",
    music: "music",
    attire: "clothing",
    makeup: "makeup",
    transportation: "transport",
    other: "other",
};

const categoryLabels: Record<string, string> = {
    venue: "площадок",
    caterer: "кейтерингов",
    photographer: "фотографов",
    videographer: "видеографов",
    florist: "флористов",
    decorator: "декораторов",
    music: "музыкантов",
    clothing: "ателье",
    makeup: "визажистов",
    transport: "транспорта",
    other: "услуг",
};

interface VendorWithScore {
    vendor: any;
    matchScore: number;
    reasons: { type: string; description: string; score: number }[];
}

export function SmartVendorDrawer({ category, maxPrice, weddingPlanId }: SmartVendorDrawerProps) {
    const [vendorsWithScores, setVendorsWithScores] = useState<VendorWithScore[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [weddingPlan, setWeddingPlan] = useState<any>(null);
    const navigate = useNavigate();

    const vendorCategory = budgetToVendorCategory[category];

    useEffect(() => {
        if (open && vendorCategory) {
            fetchWeddingPlanAndVendors();
        }
    }, [open, vendorCategory, maxPrice, weddingPlanId]);

    const fetchWeddingPlanAndVendors = async () => {
        if (!vendorCategory) return;
        
        setLoading(true);
        try {
            // Получаем данные свадебного плана для персонализации
            let planData = null;
            if (weddingPlanId) {
                const { data } = await supabase
                    .from('wedding_plans')
                    .select('*')
                    .eq('id', weddingPlanId)
                    .maybeSingle();
                planData = data;
                setWeddingPlan(data);
            } else {
                // Если нет weddingPlanId, попробуем получить текущий план пользователя
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase
                        .from('wedding_plans')
                        .select('*')
                        .eq('couple_user_id', user.id)
                        .limit(1)
                        .maybeSingle();
                    planData = data;
                    setWeddingPlan(data);
                }
            }

            // Настраиваем параметры мэтчинга
            const matchParams: WeddingMatchParams = {
                budget: planData?.budget_total || maxPrice * 10,
                categoryBudget: maxPrice,
                guestCount: planData?.estimated_guests || 100,
                style: planData?.style_preferences?.[0] || undefined,
                location: planData?.venue_location || undefined,
                languages: ['russian', 'uzbek'],
                weddingDate: planData?.wedding_date ? new Date(planData.wedding_date) : undefined,
                priorities: planData?.priorities as any,
            };

            // Используем matching engine
            const matches = await VendorMatchingEngine.findMatches(matchParams, {
                category: vendorCategory as any,
                maxPrice: maxPrice * 1.5,
                location: planData?.venue_location || undefined,
                availableOnDate: matchParams.weddingDate,
                styles: planData?.style_preferences || undefined,
            });

            // Получаем полные данные вендоров
            if (matches.length > 0) {
                const vendorIds = matches.map(m => m.vendorId);
                const { data: vendors } = await supabase
                    .from('vendor_profiles')
                    .select('*')
                    .in('id', vendorIds);

                if (vendors) {
                    const vendorsWithScores = matches.map(match => {
                        const vendor = vendors.find(v => v.id === match.vendorId);
                        return {
                            vendor,
                            matchScore: match.matchScore,
                            reasons: match.reasons,
                        };
                    }).filter(v => v.vendor);
                    
                    setVendorsWithScores(vendorsWithScores);
                }
            } else {
                // Fallback: простой запрос без мэтчинга
                const { data: vendors } = await supabase
                    .from('vendor_profiles')
                    .select('*')
                    .eq('category', vendorCategory as any)
                    .lte('starting_price', maxPrice * 1.5)
                    .order('rating', { ascending: false })
                    .limit(5);

                if (vendors) {
                    setVendorsWithScores(vendors.map(v => ({
                        vendor: v,
                        matchScore: Math.round((v.rating || 4) * 20),
                        reasons: [{ type: 'rating', description: 'Высокий рейтинг', score: 15 }],
                    })));
                }
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Не показывать для категорий без вендоров
    if (!vendorCategory) {
        return null;
    }

    const formatPrice = (price: number) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} млн`;
        }
        return `${(price / 1000).toFixed(0)} тыс`;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-orange-600";
    };

    const getReasonIcon = (type: string) => {
        switch (type) {
            case 'style': return '🎨';
            case 'rating': return '⭐';
            case 'budget': return '💰';
            case 'location': return '📍';
            case 'language': return '🗣️';
            case 'feature': return '✨';
            default: return '✓';
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
                    <Sparkles className="w-4 h-4" />
                    Smart Choice
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Умные рекомендации
                    </SheetTitle>
                    <SheetDescription>
                        {weddingPlan?.style_preferences?.length > 0 ? (
                            <>Подобрано для стиля «{weddingPlan.style_preferences[0]}» в пределах {formatPrice(maxPrice)} UZS</>
                        ) : (
                            <>Лучшие {categoryLabels[vendorCategory] || "исполнители"} в пределах {formatPrice(maxPrice)} UZS</>
                        )}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Sparkles className="w-8 h-8 animate-pulse mx-auto mb-2 text-primary" />
                                <p>Анализируем совместимость...</p>
                                <p className="text-xs mt-1">Учитываем стиль, бюджет и предпочтения</p>
                            </div>
                        ) : vendorsWithScores.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="mb-2">Нет подходящих исполнителей.</p>
                                <Button variant="link" onClick={() => navigate('/marketplace')}>
                                    Посмотреть всех исполнителей
                                </Button>
                            </div>
                        ) : (
                            vendorsWithScores.map(({ vendor, matchScore, reasons }, index) => (
                                <div 
                                    key={vendor.id} 
                                    className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors relative"
                                >
                                    {index === 0 && matchScore >= 70 && (
                                        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-pink-500">
                                            Лучший выбор
                                        </Badge>
                                    )}
                                    
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{vendor.business_name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    {vendor.rating?.toFixed(1) || "Новый"}
                                                    {vendor.total_reviews > 0 && (
                                                        <span className="text-xs">({vendor.total_reviews})</span>
                                                    )}
                                                </span>
                                                {vendor.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {vendor.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Match Score */}
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${getScoreColor(matchScore)}`}>
                                                {matchScore}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">совпадение</div>
                                        </div>
                                    </div>

                                    {/* Match Score Progress */}
                                    <Progress value={matchScore} className="h-2" />

                                    {/* Match Reasons */}
                                    {reasons.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {reasons.slice(0, 4).map((reason, idx) => (
                                                <Badge 
                                                    key={idx} 
                                                    variant="secondary" 
                                                    className="text-xs gap-1 py-1"
                                                >
                                                    <span>{getReasonIcon(reason.type)}</span>
                                                    {reason.description.length > 25 
                                                        ? reason.description.substring(0, 25) + '...'
                                                        : reason.description
                                                    }
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {vendor.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {vendor.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">от </span>
                                            <span className="font-semibold text-primary">
                                                {formatPrice(vendor.starting_price || vendor.price_range_min || 0)} UZS
                                            </span>
                                        </div>
                                        {vendor.verified && (
                                            <Badge variant="outline" className="text-xs gap-1">
                                                <Check className="w-3 h-3" />
                                                Проверен
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            className="flex-1" 
                                            size="sm"
                                            onClick={() => navigate(`/vendor/${vendor.id}`)}
                                        >
                                            Подробнее
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            title="Открыть профиль"
                                            onClick={() => navigate(`/vendor/${vendor.id}`)}
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {/* Info about matching */}
                        {vendorsWithScores.length > 0 && (
                            <div className="text-xs text-muted-foreground text-center py-4 border-t">
                                <TrendingUp className="w-4 h-4 inline mr-1" />
                                Рекомендации основаны на стиле свадьбы, бюджете и локации
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}