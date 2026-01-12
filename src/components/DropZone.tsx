import { useState, useCallback, useRef } from "react";
import { Upload, Loader2, Cloud, ArrowUpFromLine } from "lucide-react";
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
        "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden group",
        isDragging
          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 scale-[1.02] shadow-lg shadow-primary/10"
          : "border-muted-foreground/20 hover:border-primary/40 hover:bg-gradient-to-br hover:from-muted/80 hover:to-muted/40",
        (disabled || isUploading) && "opacity-50 cursor-not-allowed",
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary blur-3xl" />
        <div className="absolute -left-8 -bottom-8 size-24 rounded-full bg-primary blur-3xl" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="relative flex flex-col items-center gap-4">
        {isUploading ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="size-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Loader2 className="size-8 text-primary-foreground animate-spin" />
            </div>
          </div>
        ) : isDragging ? (
          <div className="relative animate-bounce">
            <div className="size-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <ArrowUpFromLine className="size-8 text-primary-foreground" />
            </div>
          </div>
        ) : (
          <div className="relative group-hover:scale-110 transition-transform duration-300">
            <Cloud className="size-16 text-muted-foreground/40 absolute -top-2 left-1/2 -translate-x-1/2" />
            <Upload className="size-8 text-muted-foreground relative top-3 group-hover:text-primary transition-colors" />
          </div>
        )}

        <div className="space-y-1">
          <p className={cn(
            "text-lg font-semibold transition-colors",
            isDragging ? "text-primary" : "text-foreground"
          )}>
            {isUploading
              ? "Uploading..."
              : isDragging
                ? "Drop to upload!"
                : "Drag & drop files here"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isUploading ? "Please wait..." : "or click anywhere to browse"}
          </p>
        </div>
      </div>
    </div>
  );
}
