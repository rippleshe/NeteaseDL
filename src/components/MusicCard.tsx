import React, { useState } from 'react';
import { useMusicStore } from '@/store/useMusicStore';
import { Button } from './ui/Button';
import { Download, Music2, AlertCircle, Lock } from 'lucide-react';
import axios from 'axios';

export const MusicCard: React.FC = () => {
  const { musicInfo } = useMusicStore();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!musicInfo) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Get download URL
      const res = await axios.post('/api/music/download', {
        id: musicInfo.id,
        quality: 'standard' // Default to standard
      });

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to get download URL');
      }

      // Check for Playable Flag from backend
      if (res.data.data.playable === false) {
        throw new Error(res.data.data.reason || 'VIP/Copyright restriction');
      }

      const { url, type } = res.data.data;
      
      // 2. Download file via proxy
      const proxyUrl = `/api/music/proxy?url=${encodeURIComponent(url)}`;
      
      const fileRes = await axios.get(proxyUrl, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        }
      });

      // 3. Save file
      const blob = new Blob([fileRes.data], { type: type || 'audio/mpeg' });
      const filename = `${musicInfo.title} - ${musicInfo.artist}.${type || 'mp3'}`;
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

    } catch (err: any) {
      console.error(err);
      const serverMsg = err.response?.data?.error;
      setError(serverMsg || err.message || 'Download failed');
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-zinc-800/50 overflow-hidden shadow-2xl">
        <div className="relative p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Cover Art */}
          <div className="relative group shrink-0">
            <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl relative z-10">
              <img 
                src={musicInfo.cover} 
                alt={musicInfo.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info & Controls */}
          <div className="flex-1 text-center md:text-left space-y-6 w-full relative z-10">
            <div>
              <h2 className="text-3xl font-bold text-white leading-tight mb-2">
                {musicInfo.title}
              </h2>
              <p className="text-xl text-zinc-400 font-medium">
                {musicInfo.artist}
              </p>
              <p className="text-sm text-zinc-600 mt-1 uppercase tracking-wider">
                {musicInfo.album}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-4">
              {error && (
                 <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                   {error.includes('VIP') ? <Lock className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                   {error}
                 </div>
              )}
              
              <Button 
                onClick={handleDownload}
                loading={downloading}
                className="w-full h-12 rounded-xl text-base font-semibold bg-white text-black hover:bg-zinc-200"
                size="lg"
              >
                {downloading ? `Downloading ${progress}%` : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download MP3
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
