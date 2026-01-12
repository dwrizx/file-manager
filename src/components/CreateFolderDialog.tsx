import { useState } from "react";
import { FolderPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => Promise<void>;
}

export function CreateFolderDialog({ isOpen, onClose, onCreateFolder }: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Folder name is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onCreateFolder(name.trim());
      setName("");
      onClose();
    } catch (err) {
      setError("Failed to create folder");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border rounded-xl shadow-2xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FolderPlus className="size-5" />
            <h2 className="font-semibold">New Folder</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={loading}
            />
            {error && (
              <p className="text-destructive text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
