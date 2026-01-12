import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileIconProps {
  type: string;
  className?: string;
}

export function FileIcon({ type, className }: FileIconProps) {
  const iconClass = cn("size-8", className);

  switch (type) {
    case "document":
      return <FileText className={cn(iconClass, "text-blue-500")} />;
    case "image":
      return <FileImage className={cn(iconClass, "text-green-500")} />;
    case "video":
      return <FileVideo className={cn(iconClass, "text-purple-500")} />;
    case "audio":
      return <FileAudio className={cn(iconClass, "text-orange-500")} />;
    case "archive":
      return <FileArchive className={cn(iconClass, "text-yellow-500")} />;
    default:
      return <File className={cn(iconClass, "text-gray-500")} />;
  }
}
