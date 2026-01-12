import { useState, useEffect, useRef } from "react";
import ePub, { Book, Rendition } from "epubjs";
import { ChevronLeft, ChevronRight, BookOpen, Loader2, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EpubReaderProps {
  url: string;
  fileName: string;
}

interface TocItem {
  label: string;
  href: string;
  subitems?: TocItem[];
}

export function EpubReader({ url, fileName }: EpubReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;

    const loadBook = async () => {
      try {
        setLoading(true);
        setError(null);

        // Clean up previous book
        if (bookRef.current) {
          bookRef.current.destroy();
        }

        // Fetch the book as array buffer
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        // Create book from array buffer
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        await book.ready;

        // Get metadata
        const metadata = await book.loaded.metadata;
        setTitle(metadata.title || fileName);
        setAuthor(metadata.creator || "Unknown Author");

        // Get table of contents
        const navigation = await book.loaded.navigation;
        setToc(navigation.toc as TocItem[]);

        // Create rendition
        const rendition = book.renderTo(containerRef.current!, {
          width: "100%",
          height: "100%",
          spread: "none",
          flow: "paginated",
        });

        renditionRef.current = rendition;

        // Apply theme styles
        rendition.themes.default({
          body: {
            "font-family": "Georgia, serif",
            "line-height": "1.7",
            "padding": "20px",
          },
          "p": {
            "margin-bottom": "1em",
          },
          "h1, h2, h3": {
            "font-family": "system-ui, sans-serif",
          },
        });

        // Display the book
        await rendition.display();

        // Generate locations for pagination
        await book.locations.generate(1024);
        setTotalPages(book.locations.length());

        // Handle relocation
        rendition.on("relocated", (location: { start: { location: number } }) => {
          if (location.start) {
            setCurrentPage(location.start.location + 1);
          }
        });

        setLoading(false);
      } catch (err) {
        console.error("Error loading EPUB:", err);
        setError("Failed to load EPUB file. The file may be corrupted or in an unsupported format.");
        setLoading(false);
      }
    };

    loadBook();

    return () => {
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [url, fileName]);

  const goNext = () => {
    renditionRef.current?.next();
  };

  const goPrev = () => {
    renditionRef.current?.prev();
  };

  const goToChapter = (href: string) => {
    renditionRef.current?.display(href);
    setShowToc(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8 text-center">
        <BookOpen className="size-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Unable to load EPUB</h3>
        <p className="text-sm text-muted-foreground max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowToc(!showToc)}
            title="Table of Contents"
          >
            <List className="size-4" />
          </Button>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{title}</p>
            <p className="text-xs text-muted-foreground truncate">{author}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {totalPages > 0 && (
            <span className="hidden sm:inline">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Table of Contents Sidebar */}
        {showToc && (
          <div className="absolute inset-y-0 left-0 w-72 bg-card border-r z-10 flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-medium">Contents</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowToc(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {toc.map((item, index) => (
                <TocEntry key={index} item={item} onSelect={goToChapter} />
              ))}
            </div>
          </div>
        )}

        {/* Book Content */}
        <div className="flex-1 flex items-center relative">
          {/* Previous button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            className="absolute left-2 z-10 h-16 w-8 hover:bg-muted/80"
            disabled={loading}
          >
            <ChevronLeft className="size-6" />
          </Button>

          {/* Content container */}
          <div
            ref={containerRef}
            className={cn(
              "flex-1 h-full mx-12 bg-background",
              loading && "flex items-center justify-center"
            )}
          >
            {loading && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading book...</p>
              </div>
            )}
          </div>

          {/* Next button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            className="absolute right-2 z-10 h-16 w-8 hover:bg-muted/80"
            disabled={loading}
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {totalPages > 0 && (
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

function TocEntry({ item, onSelect, depth = 0 }: { item: TocItem; onSelect: (href: string) => void; depth?: number }) {
  return (
    <>
      <button
        onClick={() => onSelect(item.href)}
        className={cn(
          "w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors truncate",
          depth > 0 && "pl-6"
        )}
        style={{ paddingLeft: `${(depth * 12) + 12}px` }}
      >
        {item.label}
      </button>
      {item.subitems?.map((subitem, index) => (
        <TocEntry key={index} item={subitem} onSelect={onSelect} depth={depth + 1} />
      ))}
    </>
  );
}
