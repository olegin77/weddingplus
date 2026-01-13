import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Eye, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SortablePortfolioItemProps {
  id: string;
  url: string;
  index: number;
  isCover: boolean;
  onRemove: (url: string) => void;
  onPreview: (url: string) => void;
  onSetCover: (url: string) => void;
}

export const SortablePortfolioItem = ({
  id,
  url,
  index,
  isCover,
  onRemove,
  onPreview,
  onSetCover,
}: SortablePortfolioItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-lg overflow-hidden border-2 transition-all",
        isDragging
          ? "border-primary shadow-lg z-50 opacity-90"
          : "border-transparent hover:border-primary/50",
        isCover && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Image */}
      <img
        src={url}
        alt={`Portfolio ${index + 1}`}
        className="w-full h-40 object-cover"
        loading="lazy"
      />

      {/* Cover Badge */}
      {isCover && (
        <Badge className="absolute top-2 left-2 bg-primary">
          Обложка
        </Badge>
      )}

      {/* Index Badge */}
      <Badge
        variant="secondary"
        className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        #{index + 1}
      </Badge>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-md p-1"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Actions Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onPreview(url)}
          className="h-9 w-9"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant={isCover ? "default" : "secondary"}
          size="icon"
          onClick={() => onSetCover(url)}
          className="h-9 w-9"
          title={isCover ? "Текущая обложка" : "Сделать обложкой"}
        >
          {isCover ? (
            <Star className="h-4 w-4 fill-current" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onRemove(url)}
          className="h-9 w-9"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
