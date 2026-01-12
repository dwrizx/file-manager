import { useState } from "react";
import { HardDrive, RefreshCw, FolderPlus, Trash2, CheckSquare, XSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropZone } from "./DropZone";
import { FileList } from "./FileList";
import { Breadcrumb } from "./Breadcrumb";
import { SearchBar } from "./SearchBar";
import { FilePreview } from "./FilePreview";
import { CreateFolderDialog } from "./CreateFolderDialog";
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader className="pb-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <HardDrive className="size-6 text-primary" />
              <CardTitle className="text-2xl">File Magnet</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="icon-sm"
                onClick={refresh}
                disabled={loading}
                title="Refresh"
              >
                <RefreshCw className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          <Breadcrumb path={currentPath} onNavigate={navigateToFolder} />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Upload zone */}
          <DropZone onUpload={uploadFiles} disabled={loading} />

          {/* Search and actions bar */}
          <div className="flex flex-col gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              filterType={filterType}
              onFilterChange={setFilterType}
            />

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateFolder(true)}
                className="gap-2"
              >
                <FolderPlus className="size-4" />
                New Folder
              </Button>

              {selectedFiles.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedFiles.size} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                  >
                    <CheckSquare className="size-4 mr-1" />
                    All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                  >
                    <XSquare className="size-4 mr-1" />
                    None
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (confirm(`Delete ${selectedFiles.size} items?`)) {
                        await deleteSelected();
                      }
                    }}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* File list */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {filteredFiles.length} items
            </h3>
            <FileList
              files={filteredFiles}
              loading={loading}
              selectedFiles={selectedFiles}
              onDownload={downloadFile}
              onDelete={deleteFile}
              onNavigate={navigateToFolder}
              onPreview={setPreviewFile}
              onToggleSelect={toggleSelect}
              onDragStart={setDraggedFile}
              onDrop={handleDrop}
            />
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
