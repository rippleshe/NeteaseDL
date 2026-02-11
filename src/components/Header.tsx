import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, History, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
              <Music className="h-5 w-5 text-white" />
            </div>
            <span>Netease<span className="text-purple-500">DL</span></span>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-white",
              isActive('/') ? "text-white" : "text-zinc-400"
            )}
          >
            Home
          </Link>
          <Link 
            to="/history" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-white flex items-center gap-2",
              isActive('/history') ? "text-white" : "text-zinc-400"
            )}
          >
            <History className="h-4 w-4" />
            History
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
        </nav>
      </div>
    </header>
  );
};
