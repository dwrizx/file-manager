import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  filterType: string;
  onFilterChange: (type: string) => void;
}

const FILE_TYPES = [
  { value: "", label: "All" },
  { value: "folder", label: "Folders" },
  { value: "document", label: "Documents" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "audio", label: "Audio" },
  { value: "archive", label: "Archives" },
];

export function SearchBar({ value, onChange, filterType, onFilterChange }: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {value && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange("")}
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        <Button
          variant={showFilters || filterType ? "secondary" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          title="Filter by type"
        >
          <Filter className="size-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {FILE_TYPES.map((type) => (
            <Button
              key={type.value}
              variant={filterType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
