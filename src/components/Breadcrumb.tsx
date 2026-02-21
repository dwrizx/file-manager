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
    <div className="flex items-center gap-1 text-sm overflow-x-auto no-scrollbar py-0.5">
      <button
        onClick={() => onNavigate("")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 shrink-0",
          parts.length === 0
            ? "bg-primary/10 text-primary font-bold shadow-xs"
            : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
        )}
      >
        <Home className="size-4" />
        <span className="font-medium tracking-tight">Home</span>
      </button>

      {parts.map((part, index) => (
        <div
          key={index}
          className="flex items-center gap-1 shrink-0 animate-in slide-in-from-left-2 duration-300"
        >
          <ChevronRight className="size-3.5 text-muted-foreground/30 mx-0.5" />
          <button
            onClick={() => handleClick(index)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200",
              index === parts.length - 1
                ? "bg-primary/10 text-primary font-bold shadow-xs"
                : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
            )}
          >
            <Folder
              className={cn(
                "size-3.5",
                index === parts.length - 1
                  ? "text-primary"
                  : "text-amber-500/70",
              )}
            />
            <span className="max-w-[150px] truncate font-medium tracking-tight">
              {part}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
