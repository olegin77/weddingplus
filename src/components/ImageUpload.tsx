import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  bucket: 'avatars' | 'portfolio';
  userId: string;
  currentImage?: string;
  onUploadComplete: (url: string) => void;
  maxSize?: number; // in MB
  multiple?: boolean;
}

const ImageUpload = ({ 
  bucket, 
  userId, 
  currentImage, 
  onUploadComplete,
  maxSize = 5,
  multiple = false 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Файл слишком большой",
        description: `Максимальный размер: ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Неверный тип файла",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onUploadComplete(publicUrl);

      toast({
        title: "Успешно",
        description: "Изображение загружено"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить изображение",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImage) return;

    try {
      // Extract path from URL
      const path = currentImage.split('/').slice(-2).join('/');
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      setPreview(null);
      onUploadComplete('');

      toast({
        title: "Удалено",
        description: "Изображение удалено"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить изображение",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>Изображение</Label>
      
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Выберите изображение для загрузки
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Максимальный размер: {maxSize}MB
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="cursor-pointer"
          multiple={multiple}
        />
        {uploading && (
          <Button disabled size="icon">
            <Loader2 className="h-4 w-4 animate-spin" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;