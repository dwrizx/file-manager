import { useState, useEffect, useRef } from "react";
import ePub, { Book, Rendition } from "epubjs";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  List,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
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
  const [retryCount, setRetryCount] = useState(0);

  const cleanup = () => {
    if (renditionRef.current) {
      try {
        renditionRef.current.destroy();
      } catch {
        // Ignore cleanup errors
      }
      renditionRef.current = null;
    }
    if (bookRef.current) {
      try {
        bookRef.current.destroy();
      } catch {
        // Ignore cleanup errors
      }
      bookRef.current = null;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;

    const loadBook = async () => {
      try {
        setLoading(true);
        setError(null);

        // Clean up previous book
        cleanup();

        // Clear the container
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }

        // Fetch the book as array buffer
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch EPUB file (${response.status})`);
        }
        const arrayBuffer = await response.arrayBuffer();

        if (!isMounted) return;

        // Create book from array buffer
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        // Wait for book to be ready
        await book.ready;

        if (!isMounted) return;

        // Get metadata
        try {
          const metadata = await book.loaded.metadata;
          setTitle(metadata.title || fileName);
          setAuthor(metadata.creator || "Unknown Author");
        } catch (metaErr) {
          console.warn("Could not load metadata:", metaErr);
          setTitle(fileName);
          setAuthor("Unknown Author");
        }

        // Get table of contents
        let navigation: any = null;
        try {
          navigation = await book.loaded.navigation;
          setToc((navigation?.toc as TocItem[]) || []);
        } catch (navErr) {
          console.warn("Could not load navigation:", navErr);
          setToc([]);
        }

        if (!isMounted || !containerRef.current) return;

        // Create rendition with scrolled flow (more reliable than paginated)
        const rendition = book.renderTo(containerRef.current, {
          width: "100%",
          height: "100%",
          spread: "none",
          flow: "scrolled-doc", // Use scrolled mode for better compatibility
          manager: "continuous",
        });

        renditionRef.current = rendition;

        // Apply theme styles
        rendition.themes.default({
          body: {
            "font-family": "Georgia, serif",
            "line-height": "1.8",
            padding: "20px 40px",
            "max-width": "800px",
            margin: "0 auto",
          },
          p: {
            "margin-bottom": "1em",
          },
          "h1, h2, h3": {
            "font-family": "system-ui, sans-serif",
          },
          img: {
            "max-width": "100%",
            height: "auto",
          },
        });

        // Try different display strategies
        let displaySuccess = false;

        // Strategy 1: Try to display using spine
        try {
          const spine = await book.loaded.spine;
          if (
            spine &&
            (spine as any).items &&
            (spine as any).items.length > 0
          ) {
            const firstItem = (spine as any).items[0];
            const href = firstItem.href || firstItem.url || firstItem.idref;
            if (href) {
              await rendition.display(href);
              displaySuccess = true;
            }
          }
        } catch (e) {
          console.warn("Strategy 1 (spine) failed:", e);
        }

        // Strategy 2: Try to display first TOC item
        if (!displaySuccess && navigation?.toc && navigation.toc.length > 0) {
          try {
            await rendition.display(navigation.toc[0].href);
            displaySuccess = true;
          } catch (e) {
            console.warn("Strategy 2 (TOC) failed:", e);
          }
        }

        // Strategy 3: Try to display by index
        if (!displaySuccess) {
          try {
            await rendition.display(0);
            displaySuccess = true;
          } catch (e) {
            console.warn("Strategy 3 (index 0) failed:", e);
          }
        }

        // Strategy 4: Try empty display
        if (!displaySuccess) {
          try {
            await rendition.display();
            displaySuccess = true;
          } catch (e) {
            console.warn("Strategy 4 (empty) failed:", e);
          }
        }

        if (!displaySuccess) {
          throw new Error("Could not display any section of the EPUB");
        }

        if (!isMounted) return;

        // Generate locations for pagination (optional, don't fail if it doesn't work)
        try {
          await book.locations.generate(2048);
          setTotalPages(book.locations.length());
        } catch (locErr) {
          console.warn("Could not generate locations:", locErr);
          setTotalPages(0);
        }

        // Handle relocation
        rendition.on("relocated", (location: any) => {
          if (location?.start?.location !== undefined) {
            setCurrentPage(location.start.location + 1);
          }
        });

        setLoading(false);
      } catch (err) {
        console.error("Error loading EPUB:", err);
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load EPUB file. The file may be corrupted or in an unsupported format.",
          );
          setLoading(false);
        }
      }
    };

    loadBook();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [url, fileName, retryCount]);

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

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
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
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium mb-2">Unable to load EPUB</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-4">{error}</p>
        <Button onClick={handleRetry} variant="outline" className="gap-2">
          <RefreshCw className="size-4" />
          Try Again
        </Button>
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
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowToc(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {toc.length > 0 ? (
                toc.map((item, index) => (
                  <TocEntry key={index} item={item} onSelect={goToChapter} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No table of contents available
                </p>
              )}
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
              "flex-1 h-full mx-12 bg-background overflow-auto",
              loading && "flex items-center justify-center",
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

function TocEntry({
  item,
  onSelect,
  depth = 0,
}: {
  item: TocItem;
  onSelect: (href: string) => void;
  depth?: number;
}) {
  return (
    <>
      <button
        onClick={() => onSelect(item.href)}
        className={cn(
          "w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors truncate",
          depth > 0 && "pl-6",
        )}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        {item.label}
      </button>
      {item.subitems?.map((subitem, index) => (
        <TocEntry
          key={index}
          item={subitem}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </>
  );
}
