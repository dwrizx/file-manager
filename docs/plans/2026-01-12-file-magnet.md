# File Magnet - File Manager Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modern file manager website with drag-and-drop upload, file listing, and download capabilities storing files in a local `data` folder.

**Architecture:** Bun.serve backend handles file API endpoints (list, upload, download, delete). React frontend with drag-and-drop zone component using native HTML5 drag events. Files stored in `./data` directory with metadata.

**Tech Stack:** Bun, React 19, TailwindCSS 4, lucide-react icons, existing shadcn/ui components

---

## Task 1: Create Data Directory & File Utilities

**Files:**
- Create: `src/utils/files.ts`
- Create: `data/.gitkeep`

**Step 1: Create data directory**

```bash
mkdir -p data && touch data/.gitkeep
```

**Step 2: Write file utility functions**

Create `src/utils/files.ts`:

```typescript
import { readdir, stat, mkdir } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(import.meta.dir, "../../data");

export interface FileInfo {
  name: string;
  size: number;
  createdAt: string;
  type: string;
}

export async function ensureDataDir(): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory exists
  }
}

export async function listFiles(): Promise<FileInfo[]> {
  await ensureDataDir();
  const entries = await readdir(DATA_DIR);
  const files: FileInfo[] = [];

  for (const entry of entries) {
    if (entry === ".gitkeep") continue;
    const filePath = join(DATA_DIR, entry);
    const stats = await stat(filePath);
    if (stats.isFile()) {
      files.push({
        name: entry,
        size: stats.size,
        createdAt: stats.birthtime.toISOString(),
        type: getFileType(entry),
      });
    }
  }

  return files.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function saveFile(name: string, data: Uint8Array): Promise<FileInfo> {
  await ensureDataDir();
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = join(DATA_DIR, safeName);
  await Bun.write(filePath, data);
  const stats = await stat(filePath);
  return {
    name: safeName,
    size: stats.size,
    createdAt: stats.birthtime.toISOString(),
    type: getFileType(safeName),
  };
}

export async function getFile(name: string): Promise<Bun.BunFile | null> {
  await ensureDataDir();
  const filePath = join(DATA_DIR, name);
  const file = Bun.file(filePath);
  if (await file.exists()) {
    return file;
  }
  return null;
}

export async function deleteFile(name: string): Promise<boolean> {
  await ensureDataDir();
  const filePath = join(DATA_DIR, name);
  const file = Bun.file(filePath);
  if (await file.exists()) {
    await Bun.write(filePath, ""); // Clear content
    const { unlink } = await import("node:fs/promises");
    await unlink(filePath);
    return true;
  }
  return false;
}

function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const types: Record<string, string> = {
    pdf: "document",
    doc: "document",
    docx: "document",
    txt: "document",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    webp: "image",
    svg: "image",
    mp4: "video",
    webm: "video",
    mov: "video",
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
    zip: "archive",
    rar: "archive",
    "7z": "archive",
    tar: "archive",
    gz: "archive",
  };
  return types[ext] || "file";
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export { DATA_DIR };
```

**Step 3: Verify file compiles**

```bash
bun build src/utils/files.ts --outdir=/tmp/test-build
```

Expected: Build succeeds without errors

**Step 4: Commit**

```bash
git add data/.gitkeep src/utils/files.ts
git commit -m "feat: add file utility functions for data directory operations"
```

---

## Task 2: Create File API Endpoints

**Files:**
- Modify: `src/index.ts`

**Step 1: Update server with file API routes**

Replace `src/index.ts` content:

```typescript
import { serve } from "bun";
import index from "./index.html";
import { listFiles, saveFile, getFile, deleteFile } from "./utils/files";

const server = serve({
  port: 1945,
  routes: {
    "/*": index,

    "/api/files": {
      async GET() {
        const files = await listFiles();
        return Response.json({ files });
      },

      async POST(req) {
        const formData = await req.formData();
        const uploadedFiles: Array<{ name: string; size: number; type: string }> = [];

        for (const [_, value] of formData.entries()) {
          if (value instanceof File) {
            const buffer = await value.arrayBuffer();
            const fileInfo = await saveFile(value.name, new Uint8Array(buffer));
            uploadedFiles.push(fileInfo);
          }
        }

        return Response.json({
          success: true,
          files: uploadedFiles,
          message: `${uploadedFiles.length} file(s) uploaded successfully`
        });
      },
    },

    "/api/files/:filename": {
      async GET(req) {
        const filename = req.params.filename;
        const file = await getFile(filename);

        if (!file) {
          return Response.json({ error: "File not found" }, { status: 404 });
        }

        return new Response(file, {
          headers: {
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Type": file.type || "application/octet-stream",
          },
        });
      },

      async DELETE(req) {
        const filename = req.params.filename;
        const deleted = await deleteFile(filename);

        if (!deleted) {
          return Response.json({ error: "File not found" }, { status: 404 });
        }

        return Response.json({ success: true, message: "File deleted" });
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 File Magnet running at ${server.url}`);
```

**Step 2: Test server starts**

```bash
timeout 3 bun run dev || true
```

Expected: Server starts without errors, shows "File Magnet running at http://localhost:1945"

**Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add file upload, download, list, and delete API endpoints"
```

---

## Task 3: Create File Type Icon Component

**Files:**
- Create: `src/components/FileIcon.tsx`

**Step 1: Write FileIcon component**

Create `src/components/FileIcon.tsx`:

```tsx
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
```

**Step 2: Commit**

```bash
git add src/components/FileIcon.tsx
git commit -m "feat: add FileIcon component with type-based icons"
```

---

## Task 4: Create DropZone Component

**Files:**
- Create: `src/components/DropZone.tsx`

**Step 1: Write DropZone component with drag-and-drop**

Create `src/components/DropZone.tsx`:

```tsx
import { useState, useCallback, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  disabled?: boolean;
}

export function DropZone({ onUpload, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(files);
      } finally {
        setIsUploading(false);
      }
    }
  }, [onUpload, disabled, isUploading]);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(files);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        (disabled || isUploading) && "opacity-50 cursor-not-allowed",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="flex flex-col items-center gap-3">
        {isUploading ? (
          <Loader2 className="size-12 text-primary animate-spin" />
        ) : (
          <Upload className={cn(
            "size-12 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
        )}

        <div>
          <p className="text-lg font-medium">
            {isUploading
              ? "Uploading..."
              : isDragging
                ? "Drop files here"
                : "Drag & drop files here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/DropZone.tsx
git commit -m "feat: add DropZone component with drag-and-drop upload"
```

---

## Task 5: Create FileList Component

**Files:**
- Create: `src/components/FileList.tsx`

**Step 1: Write FileList component**

Create `src/components/FileList.tsx`:

```tsx
import { Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileIcon } from "./FileIcon";
import { cn } from "@/lib/utils";

interface FileInfo {
  name: string;
  size: number;
  createdAt: string;
  type: string;
}

interface FileListProps {
  files: FileInfo[];
  loading?: boolean;
  onDownload: (filename: string) => void;
  onDelete: (filename: string) => Promise<void>;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FileList({ files, loading, onDownload, onDelete }: FileListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No files yet</p>
        <p className="text-sm mt-1">Upload some files to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <FileItem
          key={file.name}
          file={file}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function FileItem({
  file,
  onDownload,
  onDelete,
}: {
  file: FileInfo;
  onDownload: (filename: string) => void;
  onDelete: (filename: string) => Promise<void>;
}) {
  const handleDelete = async () => {
    if (confirm(`Delete "${file.name}"?`)) {
      await onDelete(file.name);
    }
  };

  return (
    <div className="group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <FileIcon type={file.type} />

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatBytes(file.size)} • {formatDate(file.createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDownload(file.name)}
          title="Download"
        >
          <Download className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/FileList.tsx
git commit -m "feat: add FileList component with download and delete actions"
```

---

## Task 6: Create useFiles Hook

**Files:**
- Create: `src/hooks/useFiles.ts`

**Step 1: Write useFiles custom hook**

Create `src/hooks/useFiles.ts`:

```typescript
import { useState, useEffect, useCallback } from "react";

interface FileInfo {
  name: string;
  size: number;
  createdAt: string;
  type: string;
}

interface UseFilesReturn {
  files: FileInfo[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  uploadFiles: (files: File[]) => Promise<void>;
  deleteFile: (filename: string) => Promise<void>;
  downloadFile: (filename: string) => void;
}

export function useFiles(): UseFilesReturn {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/files");
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFiles = useCallback(async (filesToUpload: File[]) => {
    const formData = new FormData();
    for (const file of filesToUpload) {
      formData.append("files", file);
    }

    const response = await fetch("/api/files", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    await refresh();
  }, [refresh]);

  const deleteFile = useCallback(async (filename: string) => {
    const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    await refresh();
  }, [refresh]);

  const downloadFile = useCallback((filename: string) => {
    const link = document.createElement("a");
    link.href = `/api/files/${encodeURIComponent(filename)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    files,
    loading,
    error,
    refresh,
    uploadFiles,
    deleteFile,
    downloadFile,
  };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useFiles.ts
git commit -m "feat: add useFiles hook for file operations state management"
```

---

## Task 7: Create FileManager Component

**Files:**
- Create: `src/components/FileManager.tsx`

**Step 1: Write main FileManager component**

Create `src/components/FileManager.tsx`:

```tsx
import { HardDrive, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropZone } from "./DropZone";
import { FileList } from "./FileList";
import { useFiles } from "@/hooks/useFiles";

export function FileManager() {
  const { files, loading, error, refresh, uploadFiles, deleteFile, downloadFile } = useFiles();

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <HardDrive className="size-6 text-primary" />
            <CardTitle className="text-2xl">File Magnet</CardTitle>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={refresh}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <DropZone onUpload={uploadFiles} disabled={loading} />

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-3">
              Files ({files.length})
            </h3>
            <FileList
              files={files}
              loading={loading}
              onDownload={downloadFile}
              onDelete={deleteFile}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/FileManager.tsx
git commit -m "feat: add FileManager main component combining all file UI"
```

---

## Task 8: Update App Component

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.html`

**Step 1: Update App.tsx to use FileManager**

Replace `src/App.tsx` content:

```tsx
import { FileManager } from "./components/FileManager";
import "./index.css";

export function App() {
  return (
    <div className="container mx-auto p-6 min-h-screen">
      <FileManager />
    </div>
  );
}

export default App;
```

**Step 2: Update index.html title**

Replace `src/index.html` content:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="./logo.svg" />
    <title>File Magnet</title>
    <script type="module" src="./frontend.tsx" async></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**Step 3: Commit**

```bash
git add src/App.tsx src/index.html
git commit -m "feat: integrate FileManager into main App"
```

---

## Task 9: Update Styles for Dark Mode

**Files:**
- Modify: `src/index.css`

**Step 1: Update CSS for cleaner file manager look**

Replace `src/index.css` content:

```css
@import "../styles/globals.css";

@layer base {
  :root {
    @apply font-sans;
  }

  body {
    @apply min-w-[320px] min-h-screen m-0 bg-background text-foreground;
  }
}
```

**Step 2: Commit**

```bash
git add src/index.css
git commit -m "style: simplify body styles for file manager"
```

---

## Task 10: Delete Unused Files

**Files:**
- Delete: `src/APITester.tsx`
- Delete: `src/logo.svg` (optional, keep if wanted)
- Delete: `src/react.svg` (optional, keep if wanted)

**Step 1: Remove unused APITester component**

```bash
rm src/APITester.tsx
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove unused APITester component"
```

---

## Task 11: Final Testing

**Step 1: Start server**

```bash
bun run dev
```

**Step 2: Open browser and test**

- Navigate to `http://localhost:1945`
- Verify drop zone appears
- Drag and drop a file - should upload
- File should appear in list
- Click download button - should download
- Click delete button - should remove
- Check `data/` folder contains uploaded files

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete File Magnet file manager implementation"
```

---

## Summary

Fitur yang diimplementasikan:
1. **Upload file** - via drag & drop atau click to browse
2. **Download file** - tombol download di setiap file
3. **Delete file** - tombol hapus dengan konfirmasi
4. **File listing** - menampilkan semua file dengan icon, ukuran, dan tanggal
5. **Responsive design** - tampilan modern dengan TailwindCSS
6. **Real-time refresh** - tombol refresh untuk update daftar file

Files disimpan di folder `data/` di root project.
