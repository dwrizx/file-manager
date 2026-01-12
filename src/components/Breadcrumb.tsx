import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center gap-1 text-sm overflow-x-auto pb-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate("")}
        className="shrink-0 gap-1"
      >
        <Home className="size-4" />
        <span>Home</span>
      </Button>

      {parts.map((part, index) => (
        <div key={index} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="size-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleClick(index)}
            className={index === parts.length - 1 ? "font-medium" : ""}
          >
            {part}
          </Button>
        </div>
      ))}
    </div>
  );
}
