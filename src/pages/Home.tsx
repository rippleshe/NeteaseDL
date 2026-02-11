import React from 'react';
import { LinkInput } from '@/components/LinkInput';
import { MusicCard } from '@/components/MusicCard';
import { useMusicStore } from '@/store/useMusicStore';

export const Home: React.FC = () => {
  const { error } = useMusicStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl filter mix-blend-screen animate-blob"></div>
         <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-3xl filter mix-blend-screen animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-600 rounded-full blur-3xl filter mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full">
        <LinkInput />
        
        {error && (
          <div className="mt-8 text-center text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/50 max-w-md mx-auto">
            {error}
          </div>
        )}

        <MusicCard />
      </div>
    </div>
  );
};
