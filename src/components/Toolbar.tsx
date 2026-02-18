import { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  List,
  Columns,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FolderPlus,
  Trash2,
  SidebarClose,
  SidebarOpen,
  PanelRightClose,
  PanelRightOpen,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SortField, SortOrder } from "@/hooks/useFiles";

export type ViewMode = "icon" | "list" | "column";

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onNewFolder: () => void;
  onDeleteSelected: () => void;
  selectedCount: number;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading?: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  onToggleSort: (field: SortField) => void;
}

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "name", label: "Name" },
  { field: "size", label: "Size" },
  { field: "createdAt", label: "Date" },
  { field: "type", label: "Type" },
];

export function Toolbar({
  viewMode,
  onViewModeChange,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onRefresh,
  onNewFolder,
  onDeleteSelected,
  selectedCount,
  showSidebar,
  onToggleSidebar,
  showPreview,
  onTogglePreview,
  searchQuery,
  onSearchChange,
  loading,
  sortField,
  sortOrder,
  onToggleSort,
}: ToolbarProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.field === sortField)?.label || "Name";

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
      {/* Sidebar toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggleSidebar}
        title={showSidebar ? "Hide sidebar" : "Show sidebar"}
        className="shrink-0"
      >
        {showSidebar ? (
          <SidebarClose className="size-4" />
        ) : (
          <SidebarOpen className="size-4" />
        )}
      </Button>

      <div className="w-px h-5 bg-border" />

      {/* Navigation */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          disabled={!canGoBack}
          title="Go back"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onForward}
          disabled={!canGoForward}
          title="Go forward"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="w-px h-5 bg-border" />

      {/* View mode toggle */}
      <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
        <ViewModeButton
          active={viewMode === "icon"}
          onClick={() => onViewModeChange("icon")}
          title="Icon view"
        >
          <LayoutGrid className="size-4" />
        </ViewModeButton>
        <ViewModeButton
          active={viewMode === "list"}
          onClick={() => onViewModeChange("list")}
          title="List view"
        >
          <List className="size-4" />
        </ViewModeButton>
        <ViewModeButton
          active={viewMode === "column"}
          onClick={() => onViewModeChange("column")}
          title="Column view"
        >
          <Columns className="size-4" />
        </ViewModeButton>
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Sort dropdown */}
      <div className="relative" ref={sortMenuRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSortMenu(!showSortMenu)}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          title="Sort files"
        >
          <ArrowUpDown className="size-3.5" />
          <span className="hidden sm:inline">{currentSortLabel}</span>
          {sortOrder === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )}
        </Button>

        {/* Sort dropdown menu */}
        {showSortMenu && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-popover border rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.field}
                onClick={() => {
                  onToggleSort(option.field);
                  if (option.field !== sortField) {
                    setShowSortMenu(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-muted transition-colors",
                  option.field === sortField && "text-primary font-medium"
                )}
              >
                <span>{option.label}</span>
                {option.field === sortField && (
                  <span className="flex items-center gap-1">
                    {sortOrder === "asc" ? (
                      <ArrowUp className="size-3" />
                    ) : (
                      <ArrowDown className="size-3" />
                    )}
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Actions */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onNewFolder}
        title="New folder"
      >
        <FolderPlus className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRefresh}
        disabled={loading}
        title="Refresh"
      >
        <RefreshCw className={cn("size-4", loading && "animate-spin")} />
      </Button>

      {selectedCount > 0 && (
        <>
          <div className="w-px h-5 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteSelected}
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            Delete ({selectedCount})
          </Button>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative max-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full h-8 pl-8 pr-8 text-sm bg-muted/50 border-0 rounded-lg placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 flex items-center justify-center transition-colors"
          >
            <X className="size-2.5" />
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Preview toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onTogglePreview}
        title={showPreview ? "Hide preview" : "Show preview"}
        className="shrink-0"
      >
        {showPreview ? (
          <PanelRightClose className="size-4" />
        ) : (
          <PanelRightOpen className="size-4" />
        )}
      </Button>
    </div>
  );
}

function ViewModeButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "size-7 rounded-md flex items-center justify-center transition-all",
        active
          ? "bg-background shadow-sm text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
