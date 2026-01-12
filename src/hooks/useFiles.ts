import { useState, useEffect, useCallback } from "react";

interface FileInfo {
  name: string;
  size: number;
  createdAt: string;
  type: string;
  isDirectory: boolean;
  path: string;
}

interface UseFilesReturn {
  files: FileInfo[];
  filteredFiles: FileInfo[];
  loading: boolean;
  error: string | null;
  currentPath: string;
  searchQuery: string;
  filterType: string;
  selectedFiles: Set<string>;
  setCurrentPath: (path: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: string) => void;
  refresh: () => Promise<void>;
  uploadFiles: (files: File[]) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  deleteSelected: () => Promise<void>;
  downloadFile: (path: string) => void;
  createFolder: (name: string) => Promise<void>;
  moveFile: (source: string, destination: string) => Promise<void>;
  toggleSelect: (path: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  navigateToFolder: (path: string) => void;
}

export function useFiles(): UseFilesReturn {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Filter files based on search and type
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data.files);
      setSelectedFiles(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  const uploadFiles = useCallback(async (filesToUpload: File[]) => {
    const formData = new FormData();
    for (const file of filesToUpload) {
      formData.append("files", file);
    }

    const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    await refresh();
  }, [currentPath, refresh]);

  const deleteFile = useCallback(async (filePath: string) => {
    const response = await fetch(`/api/files/${encodeURIComponent(filePath)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    await refresh();
  }, [refresh]);

  const deleteSelected = useCallback(async () => {
    for (const path of selectedFiles) {
      await fetch(`/api/files/${encodeURIComponent(path)}`, {
        method: "DELETE",
      });
    }
    await refresh();
  }, [selectedFiles, refresh]);

  const downloadFile = useCallback((filePath: string) => {
    const link = document.createElement("a");
    link.href = `/api/files/${encodeURIComponent(filePath)}`;
    link.download = filePath.split("/").pop() || filePath;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const createFolder = useCallback(async (name: string) => {
    const response = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, path: currentPath }),
    });

    if (!response.ok) {
      throw new Error("Failed to create folder");
    }

    await refresh();
  }, [currentPath, refresh]);

  const moveFile = useCallback(async (source: string, destination: string) => {
    const response = await fetch("/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, destination }),
    });

    if (!response.ok) {
      throw new Error("Move failed");
    }

    await refresh();
  }, [refresh]);

  const toggleSelect = useCallback((path: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedFiles(new Set(files.map((f) => f.path)));
  }, [files]);

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  const navigateToFolder = useCallback((path: string) => {
    setCurrentPath(path);
    setSearchQuery("");
    setFilterType("");
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    files,
    filteredFiles,
    loading,
    error,
    currentPath,
    searchQuery,
    filterType,
    selectedFiles,
    setCurrentPath,
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
  };
}
