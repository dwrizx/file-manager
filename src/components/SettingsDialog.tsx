import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, AlertTriangle } from "lucide-react";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export function SettingsDialog({ isOpen, onClose, onConfigChanged }: SettingsDialogProps) {
  const [dataDir, setDataDir] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to load config");
      const config = await res.json();
      setDataDir(config.dataDir);
    } catch (err) {
      setError("Could not load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataDir }),
      });

      if (!res.ok) throw new Error("Failed to save config");
      
      onConfigChanged();
      onClose();
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-background rounded-xl shadow-2xl border animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Settings</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataDir">Root Directory Path</Label>
            <Input
              id="dataDir"
              value={dataDir}
              onChange={(e) => setDataDir(e.target.value)}
              placeholder="/path/to/files"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Absolute path to the directory where files will be stored.
              If it doesn't exist, it will be created automatically.
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg flex items-center gap-2">
              <AlertTriangle className="size-4" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Saving..." : "Save Changes"}
              {!loading && <Save className="size-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
