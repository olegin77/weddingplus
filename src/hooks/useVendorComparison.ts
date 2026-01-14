import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const STORAGE_KEY = 'vendor_comparison';
const MAX_VENDORS = 3;

interface ComparisonItem {
  id: string;
  category: string;
  name: string;
}

export const useVendorComparison = () => {
  const navigate = useNavigate();
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setComparisonItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading comparison items:', error);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonItems));
    } catch (error) {
      console.error('Error saving comparison items:', error);
    }
  }, [comparisonItems]);

  const addToComparison = useCallback((vendor: { id: string; category: string; business_name: string }) => {
    setComparisonItems(prev => {
      // Check if already added
      if (prev.some(item => item.id === vendor.id)) {
        toast.info('Этот вендор уже в сравнении');
        return prev;
      }

      // Check category match
      if (prev.length > 0 && prev[0].category !== vendor.category) {
        toast.error('Можно сравнивать только вендоров одной категории');
        return prev;
      }

      // Check max limit
      if (prev.length >= MAX_VENDORS) {
        toast.error(`Максимум ${MAX_VENDORS} вендора для сравнения`);
        return prev;
      }

      toast.success(`${vendor.business_name} добавлен в сравнение`);
      return [...prev, { id: vendor.id, category: vendor.category, name: vendor.business_name }];
    });
  }, []);

  const removeFromComparison = useCallback((vendorId: string) => {
    setComparisonItems(prev => {
      const item = prev.find(i => i.id === vendorId);
      if (item) {
        toast.info(`${item.name} удалён из сравнения`);
      }
      return prev.filter(item => item.id !== vendorId);
    });
  }, []);

  const isInComparison = useCallback((vendorId: string) => {
    return comparisonItems.some(item => item.id === vendorId);
  }, [comparisonItems]);

  const clearComparison = useCallback(() => {
    setComparisonItems([]);
    toast.info('Сравнение очищено');
  }, []);

  const goToComparison = useCallback(() => {
    if (comparisonItems.length < 2) {
      toast.error('Добавьте минимум 2 вендора для сравнения');
      return;
    }

    const category = comparisonItems[0].category;
    const vendorIds = comparisonItems.map(item => item.id).join(',');
    navigate(`/compare?category=${category}&vendors=${vendorIds}`);
  }, [comparisonItems, navigate]);

  const canAddToComparison = useCallback((category: string) => {
    if (comparisonItems.length === 0) return true;
    if (comparisonItems.length >= MAX_VENDORS) return false;
    return comparisonItems[0].category === category;
  }, [comparisonItems]);

  return {
    comparisonItems,
    comparisonCount: comparisonItems.length,
    addToComparison,
    removeFromComparison,
    isInComparison,
    clearComparison,
    goToComparison,
    canAddToComparison,
    maxVendors: MAX_VENDORS,
  };
};
