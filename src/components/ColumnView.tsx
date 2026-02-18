import { useState, useEffect, useRef } from "react";
import { Folder, FolderOpen, ChevronRight, Check } from "lucide-react";
import { FileIcon } from "./FileIcon";
import { cn } from "@/lib/utils";

interface FileInfo {
  name: string;
  size: number;
  createdAt: string;
  type: string;
  isDirectory: boolean;
  path: string;
}

interface ColumnViewProps {
  files: FileInfo[];
  selectedFiles: Set<string>;
  focusedFile: FileInfo | null;
  currentPath: string;
  onSelect: (file: FileInfo) => void;
  onToggleSelect: (path: string) => void;
  onNavigate: (path: string) => void;
  onPreview: (file: FileInfo) => void;
}

interface Column {
  path: string;
  files: FileInfo[];
  selectedPath: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "-";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ColumnView({
  files,
  selectedFiles,
  focusedFile,
  currentPath,
  onSelect,
  onToggleSelect,
  onNavigate,
  onPreview,
}: ColumnViewProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize columns based on current path
  useEffect(() => {
    const pathParts = currentPath.split("/").filter(Boolean);
    const newColumns: Column[] = [];

    // Add root column
    newColumns.push({
      path: "",
      files: [],
      selectedPath: pathParts.length > 0 ? pathParts[0] : null,
    });

    // Add intermediate path columns
    for (let i = 0; i < pathParts.length; i++) {
      const path = pathParts.slice(0, i + 1).join("/");
      newColumns.push({
        path,
        files: [],
        selectedPath: pathParts.length > i + 1 ? pathParts.slice(0, i + 2).join("/") : null,
      });
    }

    setSelectedPaths(pathParts.map((_, i) => pathParts.slice(0, i + 1).join("/")));
    setColumns(newColumns);
  }, [currentPath]);

  // Update the current path column with files
  useEffect(() => {
    if (columns.length > 0) {
      const lastColumn = columns[columns.length - 1];
      if (lastColumn.path === currentPath || (lastColumn.path === "" && currentPath === "")) {
        setColumns(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...lastColumn,
            files,
          };
          return updated;
        });
      }
    }
  }, [files, currentPath]);

  // Scroll to show new column
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [columns.length]);

  const handleFileClick = (file: FileInfo, columnIndex: number) => {
    if (file.isDirectory) {
      // Navigate into folder - this will update columns
      onNavigate(file.path);
    } else {
      // Select file
      onSelect(file);
    }
  };

  const handleFileDoubleClick = (file: FileInfo) => {
    if (!file.isDirectory) {
      onPreview(file);
    }
  };

  // If we only have one column, show the current files
  const displayColumns = columns.length > 0 ? columns : [{
    path: currentPath,
    files,
    selectedPath: null,
  }];

  return (
    <div
      ref={containerRef}
      className="flex h-full overflow-x-auto"
    >
      {displayColumns.map((column, index) => (
        <div
          key={column.path || "root"}
          className={cn(
            "flex-shrink-0 w-[220px] h-full border-r last:border-r-0 overflow-y-auto bg-card/50",
            index === displayColumns.length - 1 && "bg-card"
          )}
        >
          {column.files.length === 0 && index === displayColumns.length - 1 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center p-4">
              <Folder className="size-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">Empty folder</p>
            </div>
          ) : (
            <div className="py-1">
              {column.files.map((file) => (
                <ColumnItem
                  key={file.path}
                  file={file}
                  isSelected={selectedFiles.has(file.path)}
                  isFocused={focusedFile?.path === file.path}
                  isInPath={selectedPaths.includes(file.path)}
                  onClick={() => handleFileClick(file, index)}
                  onDoubleClick={() => handleFileDoubleClick(file)}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ColumnItem({
  file,
  isSelected,
  isFocused,
  isInPath,
  onClick,
  onDoubleClick,
  onToggleSelect,
}: {
  file: FileInfo;
  isSelected: boolean;
  isFocused: boolean;
  isInPath: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onToggleSelect: (path: string) => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onToggleSelect(file.path);
    } else {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors group",
        isSelected && "bg-primary/15",
        isInPath && !isSelected && "bg-primary/10",
        isFocused && !isSelected && !isInPath && "bg-muted",
        !isSelected && !isFocused && !isInPath && "hover:bg-muted/50"
      )}
    >
      {/* Checkbox for selection */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(file.path);
        }}
        className={cn(
          "shrink-0 size-4 rounded border flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
          isSelected && "bg-primary border-primary opacity-100"
        )}
      >
        {isSelected && <Check className="size-2.5 text-primary-foreground" />}
      </button>

      {/* Icon */}
      <div className="shrink-0">
        {file.isDirectory ? (
          isInPath ? (
            <FolderOpen className="size-4 text-amber-500" />
          ) : (
            <Folder className="size-4 text-amber-500" />
          )
        ) : (
          <FileIcon type={file.type} className="size-4" />
        )}
      </div>

      {/* Name */}
      <span className={cn(
        "flex-1 text-sm truncate",
        (isSelected || isInPath) && "font-medium"
      )}>
        {file.name}
      </span>

      {/* Size or arrow */}
      {file.isDirectory ? (
        <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
      ) : (
        <span className="text-xs text-muted-foreground shrink-0">
          {formatBytes(file.size)}
        </span>
      )}
    </div>
  );
}
