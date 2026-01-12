import { useState } from "react";
import { HardDrive, RefreshCw, FolderPlus, Trash2, CheckSquare, XSquare, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropZone } from "./DropZone";
import { FileList } from "./FileList";
import { Breadcrumb } from "./Breadcrumb";
import { SearchBar } from "./SearchBar";
import { FilePreview } from "./FilePreview";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { MoveFileDialog } from "./MoveFileDialog";
import { ThemeToggle } from "./ThemeToggle";
import { useFiles } from "@/hooks/useFiles";

interface FileInfo {
  name: string;
  size: number;
  createdAt: string;
  type: string;
  isDirectory: boolean;
  path: string;
}

export function FileManager() {
  const {
    filteredFiles,
    loading,
    error,
    currentPath,
    searchQuery,
    filterType,
    selectedFiles,
    setSearchQuery,
    setFilterType,
    refresh,
    uploadFiles,
    deleteFile,
    deleteSelected,
    downloadFile,
    createFolder,
    moveFile,
    toggleSelect,
    selectAll,
    clearSelection,
    navigateToFolder,
  } = useFiles();

  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [moveFileTarget, setMoveFileTarget] = useState<FileInfo | null>(null);
  const [draggedFile, setDraggedFile] = useState<FileInfo | null>(null);

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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500">
      {/* Header Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-card to-card/80">
        <CardHeader className="pb-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <HardDrive className="size-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  File Magnet
                </CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="size-3" />
                  Drag, drop, preview, organize
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={refresh}
                disabled={loading}
                title="Refresh"
                className="hover:bg-primary/10"
              >
                <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="mt-4">
            <Breadcrumb path={currentPath} onNavigate={navigateToFolder} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload zone */}
          <DropZone onUpload={uploadFiles} disabled={loading} />

          {/* Search and actions bar */}
          <div className="space-y-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              filterType={filterType}
              onFilterChange={setFilterType}
            />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateFolder(true)}
                className="gap-2 hover:bg-primary/10 hover:border-primary/50"
              >
                <FolderPlus className="size-4" />
                New Folder
              </Button>

              {selectedFiles.size > 0 && (
                <div className="flex items-center gap-2 animate-in slide-in-from-right duration-200">
                  <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded-md">
                    {selectedFiles.size} selected
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      className="gap-1"
                    >
                      <CheckSquare className="size-4" />
                      All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="gap-1"
                    >
                      <XSquare className="size-4" />
                      Clear
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (confirm(`Delete ${selectedFiles.size} items?`)) {
                          await deleteSelected();
                        }
                      }}
                      className="gap-1"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <span className="size-2 rounded-full bg-destructive animate-pulse" />
              {error}
            </div>
          )}

          {/* File list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                {filteredFiles.length} {filteredFiles.length === 1 ? "item" : "items"}
              </h3>
              {searchQuery && (
                <span className="text-xs text-muted-foreground">
                  Searching: "{searchQuery}"
                </span>
              )}
            </div>
            <FileList
              files={filteredFiles}
              loading={loading}
              selectedFiles={selectedFiles}
              onDownload={downloadFile}
              onDelete={deleteFile}
              onNavigate={navigateToFolder}
              onPreview={setPreviewFile}
              onToggleSelect={toggleSelect}
              onMoveFile={setMoveFileTarget}
              onDragStart={setDraggedFile}
              onDrop={handleDrop}
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        File Magnet • Built with Bun + React
      </p>

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
