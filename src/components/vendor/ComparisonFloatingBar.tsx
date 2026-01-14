import { X, GitCompare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

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
  if (items.length === 0) return null;

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
