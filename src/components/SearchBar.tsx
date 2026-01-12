import { useState } from "react";
import { Search, X, SlidersHorizontal, Folder, FileText, Image, Video, Music, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  filterType: string;
  onFilterChange: (type: string) => void;
}

const FILE_TYPES = [
  { value: "", label: "All", icon: null },
  { value: "folder", label: "Folders", icon: Folder },
  { value: "document", label: "Docs", icon: FileText },
  { value: "image", label: "Images", icon: Image },
  { value: "video", label: "Videos", icon: Video },
  { value: "audio", label: "Audio", icon: Music },
  { value: "archive", label: "Archives", icon: Archive },
];

export function SearchBar({ value, onChange, filterType, onFilterChange }: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground">
            <Search className="size-4" />
          </div>
          <Input
            type="text"
            placeholder="Search files and folders..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-xl bg-muted/50 border-transparent focus:border-primary/50 focus:bg-background transition-colors"
          />
          {value && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        <Button
          variant={showFilters || filterType ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          title="Filter by type"
          className={cn(
            "h-11 w-11 rounded-xl shrink-0 transition-all",
            (showFilters || filterType) && "shadow-md"
          )}
        >
          <SlidersHorizontal className="size-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-xl animate-in slide-in-from-top-2 duration-200">
          {FILE_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = filterType === type.value;
            return (
              <button
                key={type.value}
                onClick={() => onFilterChange(type.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background hover:bg-muted border border-border hover:border-primary/30"
                )}
              >
                {Icon && <Icon className="size-3.5" />}
                {type.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
