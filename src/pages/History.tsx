import React from 'react';
import { useDownloadStore } from '@/store/useDownloadStore';
import { Button } from '@/components/ui/Button';
import { Trash2, Music, Clock } from 'lucide-react';

export const History: React.FC = () => {
  const { history, removeFromHistory, clearHistory } = useDownloadStore();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Clock className="h-8 w-8 text-purple-500" />
          Download History
        </h1>
        {history.length > 0 && (
          <Button variant="ghost" onClick={clearHistory} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-zinc-800/30 rounded-2xl border border-zinc-700/30">
          <Music className="mx-auto h-16 w-16 text-zinc-600 mb-4" />
          <h3 className="text-xl font-medium text-zinc-300">No downloads yet</h3>
          <p className="text-zinc-500 mt-2">Start downloading your favorite music to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="bg-zinc-800/50 backdrop-blur border border-zinc-700/50 rounded-xl p-4 flex items-center gap-4 hover:bg-zinc-800/80 transition-colors group"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-medium text-white truncate">{item.title}</h4>
                <p className="text-zinc-400 truncate">{item.artist}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                  <span className="uppercase bg-zinc-700/50 px-1.5 py-0.5 rounded">{item.quality}</span>
                  <span>{formatDate(item.timestamp)}</span>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => removeFromHistory(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-400"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
