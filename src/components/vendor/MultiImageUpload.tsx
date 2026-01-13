import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiImageUploadProps {
  bucket: "avatars" | "portfolio";
  userId: string;
  onUploadComplete: (urls: string[]) => void;
  maxSize?: number; // in MB
  maxFiles?: number;
  existingCount?: number;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  url?: string;
}

export const MultiImageUpload = ({
  bucket,
  userId,
  onUploadComplete,
  maxSize = 10,
  maxFiles = 20,
  existingCount = 0,
}: MultiImageUploadProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const remainingSlots = maxFiles - existingCount;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      // Validate file count
      if (fileArray.length > remainingSlots) {
        toast({
          variant: "destructive",
          title: "Слишком много файлов",
          description: `Можно загрузить ещё ${remainingSlots} изображений`,
        });
        return;
      }

      // Validate each file
      const validFiles: UploadingFile[] = [];
      for (const file of fileArray) {
        if (file.size > maxSize * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: `${file.name}`,
            description: `Файл превышает ${maxSize}MB`,
          });
          continue;
        }
        if (!file.type.startsWith("image/")) {
          toast({
            variant: "destructive",
            title: `${file.name}`,
            description: "Неверный формат файла",
          });
          continue;
        }

        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "pending",
        });
      }

      if (validFiles.length === 0) return;

      setUploadingFiles(validFiles);

      // Upload files
      const uploadedUrls: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const uploadFile = validFiles[i];
        try {
          setUploadingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "uploading", progress: 10 } : f
            )
          );

          const fileExt = uploadFile.file.name.split(".").pop();
          const fileName = `${userId}/${Date.now()}-${i}.${fileExt}`;

          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, uploadFile.file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) throw error;

          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(data.path);

          uploadedUrls.push(publicUrl);

          setUploadingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: "done", progress: 100, url: publicUrl }
                : f
            )
          );
        } catch (error) {
          console.error("Upload error:", error);
          setUploadingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "error", progress: 0 } : f
            )
          );
        }
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls);
        toast({
          title: "Загружено",
          description: `${uploadedUrls.length} изображений добавлено`,
        });
      }

      // Clear after short delay
      setTimeout(() => {
        setUploadingFiles([]);
      }, 2000);
    },
    [bucket, userId, maxSize, remainingSlots, onUploadComplete, toast]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    e.target.value = "";
  };

  const removePreview = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isUploading = uploadingFiles.some((f) => f.status === "uploading");

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-50"
        )}
        onClick={() => !isUploading && document.getElementById("multi-upload")?.click()}
      >
        <ImagePlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-1">
          Перетащите изображения сюда
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          или нажмите для выбора
        </p>
        <p className="text-xs text-muted-foreground">
          Макс. {maxSize}MB • Осталось мест: {remainingSlots}
        </p>
        <input
          id="multi-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Upload Previews */}
      {uploadingFiles.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {uploadingFiles.map((file, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border"
            >
              <img
                src={file.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Progress Overlay */}
              {file.status === "uploading" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}

              {/* Done Overlay */}
              {file.status === "done" && (
                <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                  <div className="bg-green-500 rounded-full p-1">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {file.status === "error" && (
                <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                  <X className="h-6 w-6 text-white" />
                </div>
              )}

              {/* Progress Bar */}
              {file.status === "uploading" && (
                <Progress
                  value={file.progress}
                  className="absolute bottom-0 left-0 right-0 h-1"
                />
              )}

              {/* Remove Button */}
              {file.status === "pending" && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreview(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
