import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length] || 'system';
    setTheme(nextTheme);
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="size-4" />;
    }
    return resolvedTheme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />;
  };

  const getTitle = () => {
    if (theme === 'system') return 'Theme: System';
    return theme === 'dark' ? 'Theme: Dark' : 'Theme: Light';
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={cycleTheme}
      title={getTitle()}
    >
      {getIcon()}
    </Button>
  );
}
