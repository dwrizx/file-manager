import { ChevronRight, Home, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const parts = path ? path.split("/").filter(Boolean) : [];

  const handleClick = (index: number) => {
    const newPath = parts.slice(0, index + 1).join("/");
    onNavigate(newPath);
  };

  return (
    <div className="flex items-center gap-1.5 text-sm overflow-x-auto py-2 px-1 -mx-1 scrollbar-thin">
      <button
        onClick={() => onNavigate("")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0",
          parts.length === 0
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        <Home className="size-4" />
        <span>Home</span>
      </button>

      {parts.map((part, index) => (
        <div key={index} className="flex items-center gap-1.5 shrink-0">
          <ChevronRight className="size-4 text-muted-foreground/50" />
          <button
            onClick={() => handleClick(index)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
              index === parts.length - 1
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Folder className="size-3.5" />
            <span className="max-w-[120px] truncate">{part}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
