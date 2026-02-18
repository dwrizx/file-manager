import { serve } from "bun";
import index from "./index.html";
import { listFiles, saveFile, getFile, deleteFile, createFolder, moveFile } from "./utils/files";
import { loadConfig, saveConfig } from "./lib/config";

const server = serve({
  port: 1945,
  routes: {
    "/*": index,

    "/api/config": {
      async GET() {
        const config = await loadConfig();
        return Response.json(config);
      },
      async POST(req) {
        const body = await req.json();
        const config = await saveConfig(body);
        return Response.json(config);
      }
    },

    "/api/files": {
      async GET(req) {
        const url = new URL(req.url);
        const path = url.searchParams.get("path") || "";
        const files = await listFiles(path);
        return Response.json({ files, currentPath: path });
      },

      async POST(req) {
        const url = new URL(req.url);
        const path = url.searchParams.get("path") || "";
        const formData = await req.formData();
        const uploadedFiles: Array<{ name: string; size: number; type: string; path: string }> = [];

        for (const [_, value] of formData.entries()) {
          if (value && typeof value !== "string") {
            const file = value as File;
            const buffer = await file.arrayBuffer();
            const fileInfo = await saveFile(file.name, new Uint8Array(buffer), path);
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

    "/api/files/:path": {
      async GET(req) {
        const filePath = decodeURIComponent(req.params.path);
        const file = await getFile(filePath);

        if (!file) {
          return Response.json({ error: "File not found" }, { status: 404 });
        }

        const filename = filePath.split('/').pop() || filePath;
        return new Response(file, {
          headers: {
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Type": file.type || "application/octet-stream",
          },
        });
      },

      async DELETE(req) {
        const filePath = decodeURIComponent(req.params.path);
        const deleted = await deleteFile(filePath);

        if (!deleted) {
          return Response.json({ error: "File not found" }, { status: 404 });
        }

        return Response.json({ success: true, message: "File deleted" });
      },
    },

    "/api/folders": {
      async POST(req) {
        const body = await req.json();
        const { name, path = "" } = body;

        if (!name) {
          return Response.json({ error: "Folder name is required" }, { status: 400 });
        }

        const folder = await createFolder(name, path);
        return Response.json({ success: true, folder });
      },
    },

    "/api/move": {
      async POST(req) {
        const body = await req.json();
        const { source, destination } = body;

        if (!source || !destination) {
          return Response.json({ error: "Source and destination are required" }, { status: 400 });
        }

        const success = await moveFile(source, destination);
        if (!success) {
          return Response.json({ error: "Move failed" }, { status: 500 });
        }

        return Response.json({ success: true, message: "File moved" });
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 File Magnet running at ${server.url}`);
