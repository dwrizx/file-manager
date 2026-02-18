import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  HardDrive,
  Folder,
  Download,
  FileText,
  Image,
  Music,
  Video,
  Home,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  folders: { name: string; path: string }[];
}

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, defaultOpen = true, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 w-full px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
        {title}
      </button>
      {isOpen && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  color?: string;
}

function SidebarItem({ icon, label, isActive, onClick, color }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-sm transition-all",
        isActive
          ? "bg-primary/15 text-primary font-medium"
          : "text-foreground/80 hover:bg-muted hover:text-foreground"
      )}
    >
      <span className={color}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

export function Sidebar({ currentPath, onNavigate, folders }: SidebarProps) {
  const favorites = [
    { icon: <Home className="size-4" />, label: "Home", path: "" },
    { icon: <FileText className="size-4" />, label: "Documents", path: "Documents" },
    { icon: <Download className="size-4" />, label: "Downloads", path: "Downloads" },
    { icon: <Image className="size-4" />, label: "Pictures", path: "Pictures" },
    { icon: <Music className="size-4" />, label: "Music", path: "Music" },
    { icon: <Video className="size-4" />, label: "Videos", path: "Videos" },
  ];

  const locations = [
    { icon: <HardDrive className="size-4" />, label: "Root", path: "" },
    { icon: <Database className="size-4" />, label: "Data", path: "" },
  ];

  const tags = [
    { label: "Red", color: "bg-red-500" },
    { label: "Orange", color: "bg-orange-500" },
    { label: "Yellow", color: "bg-yellow-500" },
    { label: "Green", color: "bg-green-500" },
    { label: "Blue", color: "bg-blue-500" },
    { label: "Purple", color: "bg-purple-500" },
  ];

  return (
    <div className="h-full flex flex-col bg-muted/30 border-r">
      {/* Traffic lights decoration */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <div className="size-3 rounded-full bg-red-500/80" />
        <div className="size-3 rounded-full bg-yellow-500/80" />
        <div className="size-3 rounded-full bg-green-500/80" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Favorites */}
        <Section title="Favorites" defaultOpen={true}>
          {favorites.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={currentPath === item.path}
              onClick={() => onNavigate(item.path)}
              color="text-blue-500"
            />
          ))}
        </Section>

        {/* Locations */}
        <Section title="Locations" defaultOpen={true}>
          {locations.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={false}
              onClick={() => onNavigate(item.path)}
              color="text-muted-foreground"
            />
          ))}
        </Section>

        {/* Folders in current path */}
        {folders.length > 0 && (
          <Section title="Folders" defaultOpen={true}>
            {folders.map((folder) => (
              <SidebarItem
                key={folder.path}
                icon={<Folder className="size-4" />}
                label={folder.name}
                isActive={currentPath === folder.path}
                onClick={() => onNavigate(folder.path)}
                color="text-amber-500"
              />
            ))}
          </Section>
        )}

        {/* Tags */}
        <Section title="Tags" defaultOpen={false}>
          {tags.map((tag) => (
            <SidebarItem
              key={tag.label}
              icon={<div className={cn("size-3 rounded-full", tag.color)} />}
              label={tag.label}
              onClick={() => {}}
            />
          ))}
        </Section>
      </div>

      {/* Storage info */}
      <div className="p-3 border-t bg-muted/20">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <HardDrive className="size-3.5" />
          <span>Local Storage</span>
        </div>
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-primary rounded-full" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Used: ~1 GB</p>
      </div>
    </div>
  );
}
