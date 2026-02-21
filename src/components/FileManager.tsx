import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import type { ViewMode } from "./Toolbar";
import { IconView } from "./IconView";
import { ColumnView } from "./ColumnView";
import { FileList } from "./FileList";
import { PreviewPanel } from "./PreviewPanel";
import { DropZone } from "./DropZone";
import { Breadcrumb } from "./Breadcrumb";
import { FilePreview } from "./FilePreview";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { MoveFileDialog } from "./MoveFileDialog";
import { SettingsDialog } from "./SettingsDialog";
import { ThemeToggle } from "./ThemeToggle";
import { useFiles } from "@/hooks/useFiles";
import { cn } from "@/lib/utils";
import { Menu, X, Settings, ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileInfo {
  name: string;
  size: number;
  createdAt: string;
  type: string;
  isDirectory: boolean;
  path: string;
}

// Custom hook for responsive breakpoints
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export function FileManager() {
  const {
    files,
    filteredFiles,
    loading,
    error,
    currentPath,
    searchQuery,
    showHidden,
    toggleShowHidden,
    selectedFiles,
    canGoBack,
    canGoForward,
    sortField,
    sortOrder,
    setSearchQuery,
    toggleSort,
    refresh,
    uploadFiles,
    deleteFile,
    deleteSelected,
    downloadFile,
    createFolder,
    moveFile,
    toggleSelect,
    clearSelection,
    navigateToFolder,
    goBack,
    goForward,
    locations,
    activeLocationIndex,
    switchLocation,
  } = useFiles();

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // UI state - responsive defaults
  const [viewMode, setViewMode] = useState<ViewMode>("icon");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [focusedFile, setFocusedFile] = useState<FileInfo | null>(null);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [moveFileTarget, setMoveFileTarget] = useState<FileInfo | null>(null);
  const [draggedFile, setDraggedFile] = useState<FileInfo | null>(null);
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const windowDragCounter = useRef(0);

  // Adjust UI based on screen size
  useEffect(() => {
    if (isDesktop) {
      setShowSidebar(true);
      setShowPreview(true);
    } else if (isTablet) {
      setShowSidebar(true);
      setShowPreview(false);
    } else {
      setShowSidebar(false);
      setShowPreview(false);
    }
  }, [isDesktop, isTablet, isMobile]);

  // Global drag handling
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      windowDragCounter.current++;

      // Only show overlay if dragging actual files from outside the window
      const items = e.dataTransfer?.items;
      if (items && items.length > 0 && items[0]?.kind === "file") {
        setIsWindowDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      windowDragCounter.current--;
      if (windowDragCounter.current === 0) {
        setIsWindowDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsWindowDragging(false);
      windowDragCounter.current = 0;

      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) {
        uploadFiles(files);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [uploadFiles]);

  // Get folders for sidebar
  const folders = files.filter((f) => f.isDirectory);

  const handleDrop = async (targetPath: string) => {
    if (draggedFile && draggedFile.path !== targetPath) {
      const fileName = draggedFile.path.split("/").pop();
      const newPath = targetPath ? `${targetPath}/${fileName}` : fileName;
      if (newPath) {
        await moveFile(draggedFile.path, newPath);
      }
    }
    setDraggedFile(null);
  };

  const handleMoveFile = async (source: string, destination: string) => {
    await moveFile(source, destination);
  };

  const handleSelectFile = (file: FileInfo) => {
    setFocusedFile(file);
    clearSelection();
    toggleSelect(file.path);
    // On mobile, show preview panel when file is selected
    if (isMobile && !file.isDirectory) {
      setShowPreview(true);
    }
  };

  const handleDeleteSelected = async () => {
    if (
      selectedFiles.size > 0 &&
      confirm(`Delete ${selectedFiles.size} items?`)
    ) {
      await deleteSelected();
      setFocusedFile(null);
    }
  };

  const handleDeleteFile = async (path: string) => {
    await deleteFile(path);
    if (focusedFile?.path === path) {
      setFocusedFile(null);
    }
  };

  const closeMobileOverlays = () => {
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Global Drop Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-[100] bg-primary/10 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl aspect-video border-4 border-dashed border-primary rounded-[3rem] bg-background/80 flex flex-col items-center justify-center gap-6 shadow-2xl animate-in zoom-in duration-500">
            <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
              <ArrowUpFromLine className="size-12 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-gradient">
                Drop to Upload
              </h2>
              <p className="text-muted-foreground font-medium">
                Your files will be uploaded to the current folder
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b glass z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
            className="hover:bg-primary/10"
          >
            <Menu className="size-5" />
          </Button>
          <h1 className="font-bold text-lg tracking-tight text-gradient">
            File Magnet
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="hover:bg-primary/10"
          >
            <Settings className="size-5" />
          </Button>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Mobile Sidebar Overlay */}
        {isMobile && showSidebar && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar */}
        {(showSidebar || !isMobile) && showSidebar && (
          <div
            className={cn(
              "shrink-0 transition-all duration-300 ease-in-out",
              isMobile
                ? "fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl glass border-r-0"
                : "w-[240px] border-r bg-card/30 backdrop-blur-xl",
            )}
          >
            {isMobile && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-5" />
                </Button>
              </div>
            )}
            <Sidebar
              currentPath={currentPath}
              onNavigate={(path) => {
                navigateToFolder(path);
                closeMobileOverlays();
              }}
              folders={folders}
              locations={locations}
              activeLocationIndex={activeLocationIndex}
              onSwitchLocation={switchLocation}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-background/20">
          {/* Toolbar */}
          {!isMobile && (
            <div className="glass-card mx-4 mt-4 rounded-2xl shadow-sm border border-border/40">
              <Toolbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                onBack={goBack}
                onForward={goForward}
                onRefresh={refresh}
                onNewFolder={() => setShowCreateFolder(true)}
                onDeleteSelected={handleDeleteSelected}
                selectedCount={selectedFiles.size}
                showSidebar={showSidebar}
                onToggleSidebar={() => setShowSidebar(!showSidebar)}
                showPreview={showPreview}
                onTogglePreview={() => setShowPreview(!showPreview)}
                showHidden={showHidden}
                onToggleHidden={toggleShowHidden}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                loading={loading}
                sortField={sortField}
                sortOrder={sortOrder}
                onToggleSort={toggleSort}
                onSettings={() => setShowSettings(true)}
              />
            </div>
          )}

          {/* Header with breadcrumb and theme toggle */}
          <div
            className={cn(
              "flex items-center justify-between mx-4 mt-4 mb-2",
              isMobile ? "px-0" : "",
            )}
          >
            <div className="glass-card px-4 py-2 rounded-xl flex-1 mr-4 overflow-hidden border border-border/40">
              <Breadcrumb path={currentPath} onNavigate={navigateToFolder} />
            </div>
            {!isMobile && (
              <div className="glass-card p-1 rounded-xl border border-border/40">
                <ThemeToggle />
              </div>
            )}
          </div>

          {/* Mobile Actions Bar */}
          {isMobile && (
            <div className="flex items-center gap-2 px-4 py-2 mb-2 overflow-x-auto no-scrollbar">
              <Button
                variant="secondary"
                size="sm"
                onClick={goBack}
                disabled={!canGoBack}
                className="shrink-0 rounded-full glass"
              >
                Back
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCreateFolder(true)}
                className="shrink-0 rounded-full glass"
              >
                New Folder
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="shrink-0 rounded-full glass"
              >
                Refresh
              </Button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex overflow-hidden px-4 pb-4">
            <div className="glass-card flex-1 flex flex-col min-w-0 overflow-hidden rounded-2xl border border-border/40 shadow-sm relative">
              {/* Drop zone */}
              <div
                className={cn(
                  "border-b border-border/40",
                  isMobile ? "px-3 py-2" : "px-4 py-3",
                )}
              >
                <DropZone
                  onUpload={uploadFiles}
                  disabled={loading}
                  compact={isMobile || isTablet}
                />
              </div>

              {/* Mobile Search */}
              {isMobile && (
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search files..."
                      className="w-full h-10 px-4 py-2 text-sm bg-background/50 border border-border/40 rounded-xl placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="m-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                  <span className="size-2 rounded-full bg-destructive animate-pulse" />
                  {error}
                </div>
              )}

              {/* Files content */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">
                      Loading your files...
                    </p>
                  </div>
                ) : (
                  <div className="p-1">
                    {viewMode === "icon" || isMobile ? (
                      <IconView
                        files={filteredFiles}
                        selectedFiles={selectedFiles}
                        focusedFile={focusedFile}
                        onSelect={handleSelectFile}
                        onToggleSelect={toggleSelect}
                        onNavigate={navigateToFolder}
                        onPreview={setPreviewFile}
                        onDownload={downloadFile}
                        onDelete={handleDeleteFile}
                        onMove={setMoveFileTarget}
                        onDragStart={setDraggedFile}
                        onDrop={handleDrop}
                      />
                    ) : viewMode === "column" ? (
                      <ColumnView
                        files={filteredFiles}
                        selectedFiles={selectedFiles}
                        focusedFile={focusedFile}
                        currentPath={currentPath}
                        onSelect={handleSelectFile}
                        onToggleSelect={toggleSelect}
                        onNavigate={navigateToFolder}
                        onPreview={setPreviewFile}
                      />
                    ) : (
                      <FileList
                        files={filteredFiles}
                        loading={false}
                        selectedFiles={selectedFiles}
                        onDownload={downloadFile}
                        onDelete={handleDeleteFile}
                        onNavigate={navigateToFolder}
                        onPreview={setPreviewFile}
                        onToggleSelect={toggleSelect}
                        onMoveFile={setMoveFileTarget}
                        onDragStart={setDraggedFile}
                        onDrop={handleDrop}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div
                className={cn(
                  "py-2.5 border-t border-border/40 bg-muted/10 text-[11px] font-medium text-muted-foreground flex items-center justify-between",
                  isMobile ? "px-4" : "px-6",
                )}
              >
                <div className="flex items-center gap-4">
                  <span>
                    {filteredFiles.length}{" "}
                    {filteredFiles.length === 1 ? "item" : "items"}
                  </span>
                  {selectedFiles.size > 0 && (
                    <span className="text-primary">
                      {selectedFiles.size} selected
                    </span>
                  )}
                </div>
                {searchQuery && (
                  <span className="hidden sm:inline opacity-70">
                    Searching: "{searchQuery}"
                  </span>
                )}
              </div>
            </div>

            {/* Preview Panel - Desktop only or mobile overlay */}
            {showPreview && !isMobile && (
              <div className="w-[300px] shrink-0 ml-4 animate-in slide-in-from-right duration-500 ease-out">
                <div className="glass-card h-full rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                  <PreviewPanel
                    file={focusedFile}
                    onClose={() => setShowPreview(false)}
                    onDownload={downloadFile}
                    onDelete={handleDeleteFile}
                    onMove={setMoveFileTarget}
                    onPreview={setPreviewFile}
                  />
                </div>
              </div>
            )}

            {/* Mobile Preview Overlay */}
            {isMobile && showPreview && focusedFile && (
              <>
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 animate-in fade-in duration-300"
                  onClick={() => setShowPreview(false)}
                />
                <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] animate-in slide-in-from-bottom duration-500 ease-out overflow-hidden">
                  <div className="bg-background rounded-t-3xl border-t border-border/50 h-full">
                    <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3" />
                    <PreviewPanel
                      file={focusedFile}
                      onClose={() => setShowPreview(false)}
                      onDownload={downloadFile}
                      onDelete={handleDeleteFile}
                      onMove={setMoveFileTarget}
                      onPreview={setPreviewFile}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FilePreview
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={downloadFile}
      />

      <CreateFolderDialog
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={createFolder}
      />

      <MoveFileDialog
        isOpen={moveFileTarget !== null}
        file={moveFileTarget}
        currentPath={currentPath}
        onClose={() => setMoveFileTarget(null)}
        onMove={handleMoveFile}
      />

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onConfigChanged={refresh}
      />
    </div>
  );
}
