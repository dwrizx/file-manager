import { useState, useEffect, useCallback } from "react";
import { getSetting, setSetting } from "@/lib/db";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Get system preference
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((resolved: "light" | "dark") => {
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setResolvedTheme(resolved);
  }, []);

  // Set theme
  const setTheme = useCallback(
    async (newTheme: Theme) => {
      setThemeState(newTheme);
      await setSetting("theme", newTheme);

      const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
      applyTheme(resolved);
    },
    [getSystemTheme, applyTheme],
  );

  // Initialize
  useEffect(() => {
    const init = async () => {
      const saved = await getSetting("theme");
      const initialTheme = (saved as Theme) || "system";
      setThemeState(initialTheme);

      const resolved =
        initialTheme === "system" ? getSystemTheme() : initialTheme;
      applyTheme(resolved);
    };
    init();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme(getSystemTheme());
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, getSystemTheme, applyTheme]);

  return { theme, setTheme, resolvedTheme };
}
