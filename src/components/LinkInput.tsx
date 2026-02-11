import React, { useState } from 'react';
import axios from 'axios';
import { useMusicStore } from '@/store/useMusicStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Search, Link as LinkIcon } from 'lucide-react';

export const LinkInput: React.FC = () => {
  const [url, setUrl] = useState('');
  const { setMusicInfo, setLoading, setError, isLoading } = useMusicStore();

  const handleParse = async () => {
    if (!url.trim()) return;

    // Removed strict http check to allow mixed text/share content
    
    setLoading(true);
    setMusicInfo(null);
    setError(null);

    try {
      const response = await axios.post('/api/music/parse', { url });
      if (response.data.success) {
        setMusicInfo(response.data.data);
      } else {
        setError(response.data.error || 'Failed to parse music');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Music <span className="text-red-500">Downloader</span>
        </h1>
        <p className="text-lg text-zinc-400">
          Paste a Netease Cloud Music link, ID, or share text to start.
        </p>
      </div>

      <div className="relative">
        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste link or share text (e.g. https://music.163.com/...)"
          className="pl-12 pr-32 h-14 text-lg bg-zinc-900/50 border-zinc-800 focus:border-red-500/50"
          onKeyDown={(e) => e.key === 'Enter' && handleParse()}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button 
            onClick={handleParse} 
            loading={isLoading}
            className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            <Search className="mr-2 h-4 w-4" />
            Parse
          </Button>
        </div>
      </div>
    </div>
  );
};
