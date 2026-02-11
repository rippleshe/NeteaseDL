// @ts-ignore
import NeteaseCloudMusicApi from 'NeteaseCloudMusicApi';
import axios from 'axios';

type ResourceType = 'song' | 'playlist' | 'album' | 'user' | 'unknown';

interface ParsedResource {
  type: ResourceType;
  id: string;
}

export class NeteaseProvider {
  name = 'netease';
  private anonymousCookie: string = '';

  /**
   * Extracts the first valid HTTP/HTTPS URL from a string.
   */
  private extractUrlFromText(text: string): string | null {
    // 1. Try to match standard http/https links
    // Use [^\s]+ to match non-whitespace, then manually clean trailing punctuation
    const match = text.match(/(https?:\/\/[^\s]+)/);
    if (match) {
      let url = match[1];
      // Remove trailing punctuation often found in shared text (.,;)>)
      url = url.replace(/[.,;\])>)]+$/, '');
      return url;
    }

    // 2. Try to match short links without protocol (e.g. 163cn.tv/xxx)
    const shortLinkMatch = text.match(/((?:163cn\.tv|163\.cn|y\.music\.163\.com)\/[a-zA-Z0-9]+)/);
    if (shortLinkMatch) {
      return `http://${shortLinkMatch[1]}`;
    }

    return null;
  }

  /**
   * Resolves short links (e.g., 163.cn) to their canonical URL.
   */
  private async resolveShortLink(url: string): Promise<string> {
    const shortDomains = ['163.cn', 'y.music.163.com', '163cn.tv'];
    const isShort = shortDomains.some(d => url.includes(d));

    if (!isShort) return url;

    try {
      // Follow redirects to get the final URL
      const response = await axios.get(url, {
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });
      
      // Get the final URL from the response
      if (response.request && response.request.res && response.request.res.responseUrl) {
        return response.request.res.responseUrl;
      }
      return url;
    } catch (e) {
      console.warn('Error resolving short link, using original:', e);
      return url;
    }
  }

  /**
   * Determines the resource type and extracts ID.
   */
  private extractResource(url: string): ParsedResource | null {
    try {
      // 1. User Profile: /user/home?id=...
      if (url.includes('/user/home')) {
        const match = url.match(/[?&]id=(\d+)/);
        if (match) return { type: 'user', id: match[1] };
      }

      // 2. Playlist: /playlist?id=... or /playlist/123
      if (url.includes('/playlist')) {
        const match = url.match(/[?&]id=(\d+)/) || url.match(/\/playlist\/(\d+)/);
        if (match) return { type: 'playlist', id: match[1] };
      }

      // 3. Album: /album?id=... or /album/123
      if (url.includes('/album')) {
        const match = url.match(/[?&]id=(\d+)/) || url.match(/\/album\/(\d+)/);
        if (match) return { type: 'album', id: match[1] };
      }

      // 4. Song: /song?id=... or /song/123 (Default fallback for numeric ID match if no other type detected)
      // Check specific song patterns first
      if (url.includes('/song')) {
        const match = url.match(/[?&]id=(\d+)/) || url.match(/\/song\/(\d+)/);
        if (match) return { type: 'song', id: match[1] };
      }

      // 5. Generic ID match (fallback, assume song)
      const idMatch = url.match(/[?&]id=(\d+)/);
      if (idMatch) return { type: 'song', id: idMatch[1] };

      return null;
    } catch (e) {
      return null;
    }
  }

  private async getCookie(): Promise<string> {
    const envCookie = process.env.NETEASE_COOKIE || '';
    if (envCookie) return envCookie;

    if (this.anonymousCookie) return this.anonymousCookie;

    try {
      console.log('No NETEASE_COOKIE found, attempting anonymous login...');
      const result = await NeteaseCloudMusicApi.register_anonimous();
      if (result.status === 200 && result.body && result.body.cookie) {
        this.anonymousCookie = typeof result.body.cookie === 'string' 
          ? result.body.cookie 
          : (result.body.cookie as string[]).join('; ');
        console.log('Anonymous login successful.');
        return this.anonymousCookie;
      }
    } catch (e) {
      console.error('Anonymous login failed:', e);
    }
    return '';
  }

  async parse(input: string) {
    // Step 1: Extract URL
    let url = this.extractUrlFromText(input);
    
    // Handle pure ID input
    if (!url) {
      if (/^\d+$/.test(input.trim())) {
        url = `https://music.163.com/song?id=${input.trim()}`;
      } else {
        throw new Error('No valid URL or ID found');
      }
    }

    // Step 2: Resolve short links
    const resolvedUrl = await this.resolveShortLink(url);

    // Step 3: Extract Resource Info
    const resource = this.extractResource(resolvedUrl);
    if (!resource) throw new Error('Invalid Netease URL: Could not identify resource type');

    const cookie = await this.getCookie();
    const realIP = process.env.REAL_IP || '';

    // Step 4: Handle different types
    if (resource.type === 'user') {
      return this.handleUserLink(resource.id, cookie, realIP);
    } else if (resource.type === 'playlist') {
       return this.handlePlaylistLink(resource.id, cookie, realIP);
    } else if (resource.type === 'song') {
      return this.handleSongLink(resource.id, cookie, realIP);
    } else {
      throw new Error(`Unsupported resource type: ${resource.type}`);
    }
  }

  private async handleSongLink(id: string, cookie: string, realIP: string) {
    const detailRes = await NeteaseCloudMusicApi.song_detail({ ids: id, cookie, realIP });
    
    if (detailRes.body.code !== 200 || !detailRes.body.songs || detailRes.body.songs.length === 0) {
      throw new Error('Song not found');
    }

    const song = detailRes.body.songs[0];
    return this.formatSong(song);
  }

  private async handleUserLink(userId: string, cookie: string, realIP: string) {
    // 1. Fetch user's playlists
    const playlistRes = await NeteaseCloudMusicApi.user_playlist({ uid: userId, limit: 1, cookie, realIP });
    
    if (playlistRes.body.code !== 200 || !playlistRes.body.playlist || playlistRes.body.playlist.length === 0) {
      throw new Error('User has no public playlists');
    }

    // 2. Get the first playlist (usually "Favorite Music" or created playlist)
    const firstPlaylistId = playlistRes.body.playlist[0].id;
    
    // 3. Delegate to playlist handler
    return this.handlePlaylistLink(String(firstPlaylistId), cookie, realIP);
  }

  private async handlePlaylistLink(playlistId: string, cookie: string, realIP: string) {
    // 1. Fetch playlist details
    const playlistRes = await NeteaseCloudMusicApi.playlist_detail({ id: playlistId, cookie, realIP });
    
    if (playlistRes.body.code !== 200 || !playlistRes.body.playlist) {
      throw new Error('Playlist not found');
    }

    const playlist = playlistRes.body.playlist;
    if (!playlist.tracks || playlist.tracks.length === 0) {
       if (playlist.trackIds && playlist.trackIds.length > 0) {
          return this.handleSongLink(String(playlist.trackIds[0].id), cookie, realIP);
       }
       throw new Error('Playlist is empty');
    }

    // Return the first song
    return this.formatSong(playlist.tracks[0]);
  }

  private formatSong(song: any) {
    return {
      type: 'song',
      id: String(song.id),
      title: song.name,
      artist: song.ar ? song.ar.map((a: any) => a.name).join(', ') : 'Unknown',
      album: song.al ? song.al.name : 'Unknown',
      cover: song.al ? song.al.picUrl : '',
      duration: song.dt / 1000,
      quality: ['standard', 'high', 'lossless'],
      provider: 'netease'
    };
  }

  async getDownloadUrl(id: string, quality?: string) {
    let level: any = 'standard';
    if (quality === 'high') level = 'exhigh';
    if (quality === 'lossless') level = 'lossless';

    const cookie = await this.getCookie();
    const realIP = process.env.REAL_IP || '';

    let urlRes = await NeteaseCloudMusicApi.song_url_v1({ id, level, cookie, realIP } as any);

    const data = (urlRes.body as any).data as any[] | undefined;
    if ((!data || !data[0] || !data[0].url) && level !== 'standard') {
      console.log(`Fallback to standard quality for ID: ${id}`);
      urlRes = await NeteaseCloudMusicApi.song_url_v1({ id, level: 'standard', cookie, realIP } as any);
    }

    const data2 = (urlRes.body as any).data as any[] | undefined;
    if (urlRes.body.code !== 200 || !data2 || data2.length === 0) {
      throw new Error('Audio URL not found');
    }

    const songData = data2[0];
    if (!songData.url) {
       console.warn(`No URL found for ID ${id}. Likely VIP/Copyright restriction.`);
       return {
          url: '',
          size: 0,
          type: 'mp3',
          quality: 'standard',
          playable: false,
          reason: 'VIP or Copyright restriction. Please verify your cookie.'
       };
    }

    return {
      url: songData.url,
      size: songData.size,
      type: songData.type,
      quality: songData.level,
      playable: true
    };
  }
}
