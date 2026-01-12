import { Download, Trash2, Loader2, Folder, FolderOpen, Eye, GripVertical, Check, FolderInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileIcon } from "./FileIcon";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FileInfo {
  name: string;
  size: number;
  createdAt: string;
  type: string;
  isDirectory: boolean;
  path: string;
}

interface FileListProps {
  files: FileInfo[];
  loading?: boolean;
  selectedFiles: Set<string>;
  onDownload: (path: string) => void;
  onDelete: (path: string) => Promise<void>;
  onNavigate: (path: string) => void;
  onPreview: (file: FileInfo) => void;
  onToggleSelect: (path: string) => void;
  onMoveFile?: (file: FileInfo) => void;
  onDragStart?: (file: FileInfo) => void;
  onDrop?: (targetPath: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "-";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FileList({
  files,
  loading,
  selectedFiles,
  onDownload,
  onDelete,
  onNavigate,
  onPreview,
  onToggleSelect,
  onMoveFile,
  onDragStart,
  onDrop,
}: FileListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="size-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary-foreground" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="size-20 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Folder className="size-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-medium mb-1">No files yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Upload some files or create a folder to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <FileItem
          key={file.path}
          file={file}
          index={index}
          isSelected={selectedFiles.has(file.path)}
          onDownload={onDownload}
          onDelete={onDelete}
          onNavigate={onNavigate}
          onPreview={onPreview}
          onToggleSelect={onToggleSelect}
          onMoveFile={onMoveFile}
          onDragStart={onDragStart}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}

function FileItem({
  file,
  index,
  isSelected,
  onDownload,
  onDelete,
  onNavigate,
  onPreview,
  onToggleSelect,
  onMoveFile,
  onDragStart,
  onDrop,
}: {
  file: FileInfo;
  index: number;
  isSelected: boolean;
  onDownload: (path: string) => void;
  onDelete: (path: string) => Promise<void>;
  onNavigate: (path: string) => void;
  onPreview: (file: FileInfo) => void;
  onToggleSelect: (path: string) => void;
  onMoveFile?: (file: FileInfo) => void;
  onDragStart?: (file: FileInfo) => void;
  onDrop?: (targetPath: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = () => {
    if (file.isDirectory) {
      onNavigate(file.path);
    } else {
      onPreview(file);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${file.name}"?`)) {
      await onDelete(file.path);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(file.path);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(file.path);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", file.path);
    onDragStart?.(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (file.isDirectory) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (file.isDirectory && onDrop) {
      onDrop(file.path);
    }
  };

  return (
    <div
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ animationDelay: `${index * 30}ms` }}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-1",
        isSelected
          ? "bg-primary/10 border-primary/50 shadow-sm"
          : "bg-card hover:bg-muted/50 border-transparent hover:border-border",
        file.isDirectory && "hover:bg-amber-500/5 hover:border-amber-500/30",
        isDragOver && "bg-primary/20 border-primary scale-[1.02] shadow-lg"
      )}
    >
      {/* Drag handle */}
      <GripVertical className="size-4 text-muted-foreground opacity-0 group-hover:opacity-40 cursor-grab shrink-0 transition-opacity" />

      {/* Selection checkbox */}
      <button
        onClick={handleSelect}
        className={cn(
          "shrink-0 size-5 rounded-md border-2 flex items-center justify-center transition-all",
          isSelected
            ? "bg-primary border-primary text-primary-foreground scale-105"
            : "border-muted-foreground/30 hover:border-primary hover:scale-105"
        )}
      >
        {isSelected && <Check className="size-3" />}
      </button>

      {/* Icon */}
      <div className={cn(
        "shrink-0 size-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105",
        file.isDirectory ? "bg-amber-500/10" : "bg-muted"
      )}>
        {file.isDirectory ? (
          isDragOver ? (
            <FolderOpen className="size-6 text-amber-500" />
          ) : (
            <Folder className="size-6 text-amber-500" />
          )
        ) : (
          <FileIcon type={file.type} className="size-5" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate group-hover:text-primary transition-colors" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
          <span>{file.isDirectory ? "Folder" : formatBytes(file.size)}</span>
          <span className="size-1 rounded-full bg-muted-foreground/30" />
          <span>{formatDate(file.createdAt)}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!file.isDirectory && (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => { e.stopPropagation(); onPreview(file); }}
              title="Preview"
              className="hover:bg-primary/10 hover:text-primary"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDownload}
              title="Download"
              className="hover:bg-primary/10 hover:text-primary"
            >
              <Download className="size-4" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => { e.stopPropagation(); onMoveFile?.(file); }}
          title="Move to folder"
          className="hover:bg-blue-500/10 hover:text-blue-500"
        >
          <FolderInput className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDelete}
          className="hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
