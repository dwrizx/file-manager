import { useState, useCallback, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  disabled?: boolean;
}

export function DropZone({ onUpload, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(files);
      } finally {
        setIsUploading(false);
      }
    }
  }, [onUpload, disabled, isUploading]);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(files);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        (disabled || isUploading) && "opacity-50 cursor-not-allowed",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="flex flex-col items-center gap-3">
        {isUploading ? (
          <Loader2 className="size-12 text-primary animate-spin" />
        ) : (
          <Upload className={cn(
            "size-12 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
        )}

        <div>
          <p className="text-lg font-medium">
            {isUploading
              ? "Uploading..."
              : isDragging
                ? "Drop files here"
                : "Drag & drop files here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse
          </p>
        </div>
      </div>
    </div>
  );
}
