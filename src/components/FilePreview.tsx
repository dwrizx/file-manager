import { useState, useEffect } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileIcon } from "./FileIcon";

interface FilePreviewProps {
  file: {
    name: string;
    path: string;
    type: string;
    size: number;
  } | null;
  onClose: () => void;
  onDownload: (path: string) => void;
}

export function FilePreview({ file, onClose, onDownload }: FilePreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setContent(null);
      return;
    }

    const loadPreview = async () => {
      if (file.type === "image") {
        setContent(`/api/files/${encodeURIComponent(file.path)}`);
        return;
      }

      if (file.type === "document" && file.name.endsWith(".txt")) {
        setLoading(true);
        try {
          const response = await fetch(`/api/files/${encodeURIComponent(file.path)}`);
          const text = await response.text();
          setContent(text);
        } catch {
          setContent("Failed to load preview");
        }
        setLoading(false);
        return;
      }

      setContent(null);
    };

    loadPreview();
  }, [file]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3 min-w-0">
            <FileIcon type={file.type} className="size-6 shrink-0" />
            <span className="font-medium truncate">{file.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDownload(file.path)}
              title="Download"
            >
              <Download className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              title="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : file.type === "image" && content ? (
            <img
              src={content}
              alt={file.name}
              className="max-w-full max-h-[60vh] mx-auto rounded-lg object-contain"
            />
          ) : file.type === "document" && content ? (
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[60vh]">
              {content}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileIcon type={file.type} className="size-16 mb-4" />
              <p>Preview not available for this file type</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => onDownload(file.path)}
              >
                <Download className="size-4 mr-2" />
                Download to view
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
