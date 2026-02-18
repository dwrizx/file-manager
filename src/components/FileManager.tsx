import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Toolbar, ViewMode } from "./Toolbar";
import { IconView } from "./IconView";
import { ColumnView } from "./ColumnView";
import { FileList } from "./FileList";
import { PreviewPanel } from "./PreviewPanel";
import { DropZone } from "./DropZone";
import { Breadcrumb } from "./Breadcrumb";
import { FilePreview } from "./FilePreview";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { MoveFileDialog } from "./MoveFileDialog";
import { ThemeToggle } from "./ThemeToggle";
import { useFiles } from "@/hooks/useFiles";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
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
  const [moveFileTarget, setMoveFileTarget] = useState<FileInfo | null>(null);
  const [draggedFile, setDraggedFile] = useState<FileInfo | null>(null);

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
    if (selectedFiles.size > 0 && confirm(`Delete ${selectedFiles.size} items?`)) {
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
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between px-3 py-2 border-b bg-card/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="size-5" />
          </Button>
          <h1 className="font-semibold text-sm">File Magnet</h1>
          <ThemeToggle />
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobile && showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar */}
        {(showSidebar || !isMobile) && showSidebar && (
          <div className={cn(
            "shrink-0 animate-in duration-200",
            isMobile
              ? "fixed inset-y-0 left-0 z-50 w-[280px] slide-in-from-left shadow-2xl"
              : "w-[220px] slide-in-from-left"
          )}>
            {isMobile && (
              <div className="absolute top-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowSidebar(false)}
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <X className="size-4" />
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
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Toolbar - hide on mobile, show simplified version */}
          {!isMobile && (
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
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              loading={loading}
              sortField={sortField}
              sortOrder={sortOrder}
              onToggleSort={toggleSort}
            />
          )}

          {/* Header with breadcrumb and theme toggle */}
          <div className={cn(
            "flex items-center justify-between border-b bg-card/50",
            isMobile ? "px-3 py-2" : "px-4 py-2"
          )}>
            <Breadcrumb path={currentPath} onNavigate={navigateToFolder} />
            {!isMobile && <ThemeToggle />}
          </div>

          {/* Mobile Actions Bar */}
          {isMobile && (
            <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 overflow-x-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={goBack}
                disabled={!canGoBack}
                className="shrink-0"
              >
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateFolder(true)}
                className="shrink-0"
              >
                New Folder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="shrink-0"
              >
                Refresh
              </Button>
              {selectedFiles.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="shrink-0"
                >
                  Delete ({selectedFiles.size})
                </Button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* File Browser */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Drop zone - compact on mobile/tablet */}
              <div className={cn(
                "border-b",
                isMobile ? "px-3 py-2" : "px-4 py-3"
              )}>
                <DropZone
                  onUpload={uploadFiles}
                  disabled={loading}
                  compact={isMobile || isTablet}
                />
              </div>

              {/* Mobile Search */}
              {isMobile && (
                <div className="px-3 py-2 border-b">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files..."
                    className="w-full h-9 px-3 text-sm bg-muted/50 border-0 rounded-lg placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className={cn(
                  "mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2",
                  isMobile ? "mx-3" : "mx-4"
                )}>
                  <span className="size-2 rounded-full bg-destructive animate-pulse" />
                  {error}
                </div>
              )}

              {/* Files content */}
              <div className="flex-1 overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : viewMode === "icon" || isMobile ? (
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

              {/* Status bar */}
              <div className={cn(
                "py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between",
                isMobile ? "px-3" : "px-4"
              )}>
                <span>{filteredFiles.length} {filteredFiles.length === 1 ? "item" : "items"}</span>
                {searchQuery && <span className="hidden sm:inline">Searching: "{searchQuery}"</span>}
                {selectedFiles.size > 0 && <span>{selectedFiles.size} selected</span>}
              </div>
            </div>

            {/* Preview Panel - Desktop only or mobile overlay */}
            {showPreview && !isMobile && (
              <div className="w-[280px] shrink-0 animate-in slide-in-from-right duration-200">
                <PreviewPanel
                  file={focusedFile}
                  onClose={() => setShowPreview(false)}
                  onDownload={downloadFile}
                  onDelete={handleDeleteFile}
                  onMove={setMoveFileTarget}
                  onPreview={setPreviewFile}
                />
              </div>
            )}

            {/* Mobile Preview Overlay */}
            {isMobile && showPreview && focusedFile && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                  onClick={() => setShowPreview(false)}
                />
                <div className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] animate-in slide-in-from-bottom duration-200">
                  <PreviewPanel
                    file={focusedFile}
                    onClose={() => setShowPreview(false)}
                    onDownload={downloadFile}
                    onDelete={handleDeleteFile}
                    onMove={setMoveFileTarget}
                    onPreview={setPreviewFile}
                  />
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
    </div>
  );
}
