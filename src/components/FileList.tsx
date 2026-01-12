import { Download, Trash2, Loader2, Folder, Eye, GripVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileIcon } from "./FileIcon";

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
  onDragStart,
  onDrop,
}: FileListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Folder className="size-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No files yet</p>
        <p className="text-sm mt-1">Upload some files or create a folder to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {files.map((file) => (
        <FileItem
          key={file.path}
          file={file}
          isSelected={selectedFiles.has(file.path)}
          onDownload={onDownload}
          onDelete={onDelete}
          onNavigate={onNavigate}
          onPreview={onPreview}
          onToggleSelect={onToggleSelect}
          onDragStart={onDragStart}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}

function FileItem({
  file,
  isSelected,
  onDownload,
  onDelete,
  onNavigate,
  onPreview,
  onToggleSelect,
  onDragStart,
  onDrop,
}: {
  file: FileInfo;
  isSelected: boolean;
  onDownload: (path: string) => void;
  onDelete: (path: string) => Promise<void>;
  onNavigate: (path: string) => void;
  onPreview: (file: FileInfo) => void;
  onToggleSelect: (path: string) => void;
  onDragStart?: (file: FileInfo) => void;
  onDrop?: (targetPath: string) => void;
}) {
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
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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
      onDrop={handleDrop}
      className={`group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
        ${isSelected ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted/50 border-transparent hover:border-border"}
        ${file.isDirectory ? "hover:bg-primary/5" : ""}
      `}
    >
      {/* Drag handle */}
      <GripVertical className="size-4 text-muted-foreground opacity-0 group-hover:opacity-50 cursor-grab shrink-0" />

      {/* Selection checkbox */}
      <button
        onClick={handleSelect}
        className={`shrink-0 size-5 rounded border-2 flex items-center justify-center transition-colors
          ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary"}
        `}
      >
        {isSelected && <Check className="size-3" />}
      </button>

      {/* Icon */}
      {file.isDirectory ? (
        <Folder className="size-8 text-amber-500 shrink-0" />
      ) : (
        <FileIcon type={file.type} className="shrink-0" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {file.isDirectory ? "Folder" : formatBytes(file.size)} • {formatDate(file.createdAt)}
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
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="size-4" />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
