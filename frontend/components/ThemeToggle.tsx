import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={`hover:bg-gray-700 focus:bg-gray-700 ${theme === 'light' ? 'bg-gray-700' : ''}`}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span className="text-gray-300">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={`hover:bg-gray-700 focus:bg-gray-700 ${theme === 'dark' ? 'bg-gray-700' : ''}`}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span className="text-gray-300">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={`hover:bg-gray-700 focus:bg-gray-700 ${theme === 'system' ? 'bg-gray-700' : ''}`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span className="text-gray-300">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}