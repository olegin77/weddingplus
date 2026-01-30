import { X, GitCompare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface ComparisonItem {
  id: string;
  category: string;
  name: string;
}

interface ComparisonFloatingBarProps {
  items: ComparisonItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  maxVendors: number;
}

export const ComparisonFloatingBar = ({
  items,
  onRemove,
  onClear,
  onCompare,
  maxVendors,
}: ComparisonFloatingBarProps) => {
  const isMobile = useIsMobile();

  if (items.length === 0) return null;

  // Mobile layout
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
        >
          <div className="bg-background border-t-2 border-primary/20 shadow-xl p-3 space-y-2">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Сравнение</span>
                <Badge variant="secondary" className="text-xs">{items.length}/{maxVendors}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={onCompare}
                  disabled={items.length < 2}
                  className="h-8 gap-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Сравнить
                </Button>
              </div>
            </div>

            {/* Items row - scrollable */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0"
                >
                  <span className="max-w-[80px] truncate">{item.name}</span>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Desktop layout
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-background border-2 border-primary/20 shadow-xl rounded-xl p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            <span className="font-medium text-sm">Сравнение</span>
            <Badge variant="secondary">{items.length}/{maxVendors}</Badge>
          </div>

          <div className="flex items-center gap-2 border-l pl-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm"
              >
                <span className="max-w-[100px] truncate">{item.name}</span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-l pl-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={onCompare}
              disabled={items.length < 2}
              className="gap-2"
            >
              <GitCompare className="w-4 h-4" />
              Сравнить
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};