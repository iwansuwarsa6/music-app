import { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, Search as SearchIcon, Library as LibraryIcon, User, 
  Play, SkipBack, SkipForward, Heart, Pause, 
  ChevronDown, Cast, MoreVertical, ListPlus, Shuffle, Repeat, Repeat1, Mic2, Music, Film, Target,
  History, Trash2, X, Loader2, Minus, Plus, Radio, ListVideo, Bookmark, ThumbsUp, Download, DownloadCloud, Disc3, Users, Import, LogIn
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

// 🔥 KUNCI PINTU MASUK GOOGLE LU 🔥
const CLIENT_ID = "1062485226707-a0eqjr4d0j0hfinfiio1085d3k71vei6.apps.googleusercontent.com";

// 🔥 FILTER KETAT ANTI RINGTONE, PODCAST & DJ ANEH 🔥
const isNonMusic = (title) => {
  if (!title) return false;
  const t = title.toLowerCase();
  const badWords = [
      'podcast', 'vlog', 'tutorial', 'review', 'unboxing', 'reaction',
      'trailer', 'movie', 'episode', 'berita', 'gameplay', 'how to', 'cara ',
      'ceramah', 'pengajian', 'talkshow', 'interview', 'parody', 'parodi',
      'ringtone', 'nada dering', 'sound effect'
  ];
  return badWords.some(w => t.includes(w));
};

const isBadMix = (title) => {
  if (!title) return false;
  if (isNonMusic(title)) return true;
  const t = title.toLowerCase();
  const badMixWords = [
      'full album', 'kompilasi', 'compilation', '1 jam', '2 jam', ' hours', ' hour',
      'karaoke', 'instrumental', 'tanpa vokal', 'live at', 'live in', 
      'konser', 'short', 'shorts', '8d', '8 d', 'sped up', 'slowed', 'reverb',
      'kumpulan', 'terbaik', 'pilihan', 'nonstop', 'non stop', '2023', '2024', '2025', '2026', '2027', 
      'hits tiktok', 'viral', 'dj ', 'remix', 'type beat', 'chords', 'lirik lagu'
  ];
  return badMixWords.some(w => t.includes(w));
};

function LibraryContent() {
  const { currentSong, isPlaying, playSong, togglePlay, queue, currentIndex } = usePlayerStore();
  
  const [activeTab, setActiveTab] = useState('Daftar putar');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); 

  const [likedSongs, setLikedSongs] = useState([]);
  const [historySongs, setHistorySongs] = useState([]);
  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const [customPlaylists, setCustomPlaylists] = useState([]);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  
  const [isSyncing, setIsSyncing] = useState(false);

  const API_BASE = "https://music-app-production-278c.up.railway.app";
  const tabs = ['Daftar putar', 'Lagu', 'Album', 'Artis', 'Podcasts'];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  useEffect(() => {
    const loadData = () => {
      setLikedSongs(JSON.parse(localStorage.getItem('ytm_liked_songs') || '[]'));
      setHistorySongs(JSON.parse(localStorage.getItem('ytm_play_history') || '[]'));
      setDownloadedSongs(JSON.parse(localStorage.getItem('ytm_downloaded_songs') || '[]'));
      setCustomPlaylists(JSON.parse(localStorage.getItem('ytm_custom_playlists') || '[]'));
    };
    
    loadData();
    window.addEventListener('likedSongsUpdated', loadData);
    window.addEventListener('historyUpdated', loadData);
    window.addEventListener('downloadedSongsUpdated', loadData); 
    
    return () => {
      window.removeEventListener('likedSongsUpdated', loadData);
      window.removeEventListener('historyUpdated', loadData);
      window.removeEventListener('downloadedSongsUpdated', loadData);
    }
  }, []);

  const playlists = [
    { 
        id: 'disukai', 
        title: 'Disukai', 
        desc: `${likedSongs.length} lagu`, 
        icon: <Heart fill="white" size={28} className="text-white" />, 
        data: likedSongs 
    },
    { 
        id: 'diunduh', 
        title: 'Tersimpan (Offline)', 
        desc: `${downloadedSongs.length} lagu`, 
        icon: <DownloadCloud size={28} className="text-white" />, 
        data: downloadedSongs 
    },
    { 
        id: 'history', 
        title: 'Teratas Saya 50', 
        desc: 'Diperbarui hari ini', 
        icon: <TrendingUp size={28} className="text-white" />, 
        data: historySongs 
    }
  ];

  const handlePlayAll = (songs) => {
    if (songs.length === 0) return;
    playSong({ ...songs[0], url: `${API_BASE}/api/audio?id=${songs[0].id}` }, songs, 0);
    window.dispatchEvent(new CustomEvent('openFullScreenPlayer'));
  };

  const handlePlaySong = (song, list, index) => {
    if (currentSong?.id === song.id) {
      if (window.saklarPusat) {
          window.saklarPusat(null);
      } else {
          togglePlay();
      }
      window.dispatchEvent(new CustomEvent('openFullScreenPlayer'));
      return;
    }
    
    // Siapkan antrean yang bersih
    let cleanQueue = [];
    let usedTitles = new Set();
    let baseTitle = (song.title || '').toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();
    usedTitles.add(baseTitle);
    cleanQueue.push(song); 

    if (Array.isArray(list)) {
      list.forEach(t => {
          if (t.id === song.id) return; 
          let tTitle = (t.title || '').toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();
          let isDup = false;
          if (tTitle.length > 3) {
              isDup = Array.from(usedTitles).some(seen => seen.includes(tTitle) || tTitle.includes(seen));
          }
          if (!isDup) {
              cleanQueue.push(t);
              if (tTitle.length > 3) usedTitles.add(tTitle);
          }
      });
    }

    if (cleanQueue.length <= 3) {
        playSong({ ...song, url: `${API_BASE}/api/audio?id=${song.id}` }, cleanQueue, 0);
        generateRadioMix(song);
    } else {
        playSong({ ...song, url: `${API_BASE}/api/audio?id=${song.id}` }, cleanQueue, 0);
    }

    window.dispatchEvent(new CustomEvent('openFullScreenPlayer'));
  };

  const openMenu = (e, song) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('openSongMenu', { detail: { event: e, song: song } }));
  };

  const handleDeleteCustomPlaylist = (e, id) => {
      e.stopPropagation();
      const confirmDelete = window.confirm("Yakin mau hapus playlist ini selamanya?");
      if(confirmDelete) {
          const updated = customPlaylists.filter(pl => pl.id !== id);
          setCustomPlaylists(updated);
          localStorage.setItem('ytm_custom_playlists', JSON.stringify(updated));
          showToast("Playlist berhasil dihapus.");
      }
  };

  const handleDeleteDownload = async (e, songId) => {
    e.stopPropagation(); 
    if(!window.confirm("Yakin mau hapus lagu ini dari perangkat?")) return;
    const updated = downloadedSongs.filter(s => s.id !== songId);
    setDownloadedSongs(updated);
    localStorage.setItem('ytm_downloaded_songs', JSON.stringify(updated));
    window.dispatchEvent(new Event('downloadedSongsUpdated'));

    try {
        const cache = await caches.open('rncmusic-offline-audio');
        const audioUrl = `${API_BASE}/api/audio?id=${songId}`;
        await cache.delete(audioUrl);
    } catch (err) {
        console.error("Gagal hapus file dari memori cache:", err);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSyncing(true);
      showToast("⏳ Berhasil masuk! Sedang menyedot isi YouTube lu...");
      try {
        const token = tokenResponse.access_token;
        const res = await fetch(`https://youtube.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&maxResults=50&mine=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.items && data.items.length > 0) {
          let newPlaylists = [];
          for (let pl of data.items) {
            const plRes = await fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${pl.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const plData = await plRes.json();
            
            let tracks = [];
            if (plData.items) {
              tracks = plData.items.map(item => {
                const snippet = item.snippet;
                let cleanTitle = snippet.title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
                if (cleanTitle.includes('-')) cleanTitle = cleanTitle.split('-')[1].trim();

                return {
                  id: snippet.resourceId.videoId,
                  title: cleanTitle,
                  artist: snippet.videoOwnerChannelTitle ? snippet.videoOwnerChannelTitle.replace(/ - Topic/gi, '') : 'YouTube',
                  image: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url
                };
              }).filter(t => t.title && t.title !== 'Private video' && t.title !== 'Deleted video');
            }
            
            if(tracks.length > 0) {
                newPlaylists.push({
                  id: pl.id,
                  title: pl.snippet.title,
                  desc: `${tracks.length} lagu (Sinkronisasi YouTube)`,
                  data: tracks
                });
            }
          }

          const updatedPlaylists = [...newPlaylists, ...customPlaylists];
          const uniquePlaylists = Array.from(new Map(updatedPlaylists.map(item => [item.id, item])).values());

          setCustomPlaylists(uniquePlaylists);
          localStorage.setItem('ytm_custom_playlists', JSON.stringify(uniquePlaylists));
          showToast(`✅ Berhasil menyedot ${newPlaylists.length} Playlist dari akun lu!`);
        } else {
          showToast("❌ Lu belum punya satupun playlist di YouTube.");
        }
      } catch(e) {
        showToast("❌ Gagal terhubung ke server YouTube.");
      } finally {
        setIsSyncing(false);
      }
    },
    onError: () => {
       showToast("❌ Batal Login Google.");
    },
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
  });

  const handleImportLink = async (e) => {
    e.preventDefault();
    let url = importUrl.trim();
    if (!url) return;

    if (!navigator.onLine) {
        showToast("🔴 Mode Offline aktif, ga bisa tarik lagu dari link!");
        return;
    }

    setIsImporting(true);
    setImportProgress("Menganalisa link playlist...");

    try {
        let extractedTitles = [];
        const ytMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
        if (ytMatch) {
            const playlistId = ytMatch[1];
            setImportProgress("Menembus API Alternatif YouTube...");
            const ytApis = [
                `https://pipedapi.kavin.rocks/playlists/${playlistId}`, 
                `https://pipedapi.moomoo.me/playlists/${playlistId}`,
                `https://vid.puffyan.us/api/v1/playlists/${playlistId}`,
                `https://inv.tux.pizza/api/v1/playlists/${playlistId}`
            ];

            let successApi = false;
            for (let api of ytApis) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 6000);
                    const res = await fetch(api, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (res.ok) {
                        const data = await res.json();
                        if (data.relatedStreams && data.relatedStreams.length > 0) {
                            extractedTitles = data.relatedStreams.map(v => v.title);
                            successApi = true;
                            break;
                        } 
                        else if (data.videos && data.videos.length > 0) {
                            extractedTitles = data.videos.map(v => v.title);
                            successApi = true;
                            break;
                        }
                    }
                } catch(e) { }
            }
            if (!successApi) throw new Error("Semua server API YouTube sedang sibuk atau Playlist Private.");
        } 
        else if (url.includes('spotify.com/playlist/')) {
            setImportProgress("Membongkar brankas Spotify...");
            const spotMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
            if (!spotMatch) throw new Error("Link Spotify tidak valid");
            
            const spotId = spotMatch[1];
            const embedUrl = `https://open.spotify.com/embed/playlist/${spotId}`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(embedUrl)}`;
            
            const res = await fetch(proxyUrl);
            const data = await res.json();
            const html = data.contents;
            
            if (!html) throw new Error("Gagal mengambil data Spotify");

            const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">({.*?})<\/script>/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    const spotData = JSON.parse(jsonMatch[1]);
                    const tracks = spotData?.props?.pageProps?.state?.data?.entity?.trackList || [];
                    extractedTitles = tracks.map(t => t.title || t.name).filter(Boolean);
                } catch(e) {}
            }

            if (extractedTitles.length === 0) {
               const trackMatches = html.match(/"name":"([^"]+)"/g);
               if (trackMatches) {
                   const rawNames = trackMatches.map(m => m.split('":"')[1]).filter(n => n.length > 3 && !n.includes("Spotify") && !n.includes("Playlist"));
                   extractedTitles = [...new Set(rawNames)];
               }
            }

            if (extractedTitles.length === 0) {
                const descMatch = html.match(/<meta name="description" content="([^"]+)"/i);
                if (descMatch && descMatch[1]) {
                    const rawDesc = descMatch[1].replace(/·/g, '').replace(/Playlist/gi, '').replace(/[0-9]+\s+songs/gi, '').replace(/[0-9]+\s+likes/gi, '');
                    extractedTitles = rawDesc.split(',').map(s => s.trim()).filter(s => s.length > 3);
                }
            }
        } else {
            showToast("❌ Hanya mendukung link YouTube Playlist (ada '?list=') dan Spotify Playlist!");
            setIsImporting(false);
            return;
        }

        extractedTitles = [...new Set(extractedTitles)]
            .filter(t => t && t !== "Hapus" && t !== "Simpan" && t !== "Private video" && t !== "Deleted video")
            .slice(0, 15);

        if (extractedTitles.length === 0) {
            showToast("❌ Playlist terkunci (Private), kosong, atau sistem diblokir.");
            setIsImporting(false);
            return;
        }

        let newTracks = [];
        let successCount = 0;

        for (let i = 0; i < extractedTitles.length; i++) {
            setImportProgress(`Meracik audio: ${i + 1}/${extractedTitles.length}...`);
            try {
                const res = await fetch(`https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(extractedTitles[i] + ' official audio')}`);
                const searchData = await res.json();
                
                if (searchData?.status && searchData?.data) {
                    const track = searchData.data.find(t => t.type === 'video');
                    if (track) {
                        const validId = track.id || track.videoId || (track.url ? track.url.split('v=')[1] : null);
                        if (validId) {
                            let cleanT = track.title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
                            if (cleanT.includes('-')) cleanT = cleanT.split('-')[1];
                            
                            newTracks.push({
                                id: validId,
                                title: cleanT.trim(),
                                artist: track.author?.name || 'YouTube',
                                image: track.thumbnail
                            });
                            successCount++;
                        }
                    }
                }
            } catch (e) { }
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (newTracks.length > 0) {
            let plName = window.prompt("Berhasil ditarik! Kasih nama buat Playlist ini Bang:", "Koleksi Baru");
            if (!plName) plName = "Playlist Import";

            const newPlaylist = {
                id: 'custom_' + Date.now(),
                title: plName,
                desc: `${newTracks.length} lagu (Sumber External)`,
                data: newTracks
            };

            const updatedPlaylists = [newPlaylist, ...customPlaylists];
            setCustomPlaylists(updatedPlaylists);
            localStorage.setItem('ytm_custom_playlists', JSON.stringify(updatedPlaylists));

            showToast(`✅ Mantap! "${plName}" udah tersimpan permanen di Pustaka lu.`);
            setShowImportModal(false);
            setImportUrl("");
        } else {
            showToast("❌ Gagal mencocokkan audio dari playlist tersebut.");
        }

    } catch (error) {
        showToast("❌ Server sumber ngambek. Pastikan link lu bener atau coba lagi nanti!");
    } finally {
        setIsImporting(false);
    }
  };

  // ===========================================================================
  // 🔥 LOGIKA BARU: RADIO MIX PERSONAL (BACA HISTORY & LIKES USER) 🔥
  // ===========================================================================
  const generateRadioMix = async (baseSong) => {
    if(!baseSong) return;
    let cleanArtist = (baseSong.artist || 'Official').split(/feat\.|ft\.| x |,|\||-/i)[0].replace(/vevo|official|topic|music|lyric|video/gi, '').trim();
    
    // Ganti nama cache biar reset
    const cacheKey = `algomix_personal_v1_${cleanArtist}`;
    const cachedMix = sessionStorage.getItem(cacheKey);
    
    if (cachedMix) {
        const parsedMix = JSON.parse(cachedMix);
        usePlayerStore.setState(state => {
            const existingIds = new Set(state.queue.map(q => q.id));
            const newUnique = parsedMix.filter(m => !existingIds.has(m.id));
            if (newUnique.length === 0) return state; 
            return { queue: [...state.queue, ...newUnique] }; 
        });
        return;
    }

    // 1. Tarik Data Seleranya User (History & Liked)
    const history = JSON.parse(localStorage.getItem('ytm_play_history') || '[]');
    const liked = JSON.parse(localStorage.getItem('ytm_liked_songs') || '[]');
    const personalPool = [...history, ...liked];

    // 2. Kumpulin Artis yang sering dia denger (selain artis yang lagi diputer)
    let personalArtists = [...new Set(personalPool.map(s => {
        return (s.artist || '').split(/feat\.|ft\.| x |,|\||-/i)[0].replace(/vevo|official|topic|music|lyric|video/gi, '').trim();
    }))].filter(a => a && a.toLowerCase() !== cleanArtist.toLowerCase() && a.toLowerCase() !== 'youtube');

    // 3. Acak biar ga itu-itu aja yang keluar
    personalArtists = personalArtists.sort(() => 0.5 - Math.random());

    // Wajib masukin lagu dari artis yang lagi diputar
    let queryPool = [`"${cleanArtist}" official music video`, `"${cleanArtist}" official audio`]; 

    if (personalArtists.length >= 2) {
        // Kalo ada history, racik pake selera dia
        queryPool.push(`"${personalArtists[0]}" official audio`);
        queryPool.push(`"${personalArtists[1]}" official music video`);
    } else if (personalArtists.length === 1) {
        queryPool.push(`"${personalArtists[0]}" official audio`);
        queryPool.push(`"${cleanArtist}" live performance`);
    } else {
        // Fallback kalo bener-bener user baru (belum punya history)
        queryPool.push(`"Mahalini" official audio`);
        queryPool.push(`"Taylor Swift" official audio`);
    }

    try {
        const responses = await Promise.all(queryPool.map(q => fetch(`https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(q)}`)));
        const datasets = await Promise.all(responses.map(r => r.json()));
        let combined = [];
        
        datasets.forEach(d => { 
            if(d.status && d.data) {
                combined = [...combined, ...d.data.sort(() => 0.5 - Math.random())]; 
            }
        });
        
        let mix = [];
        let usedIds = new Set([baseSong.id]); 
        
        let baseTitleCheck = baseSong.title.toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/(official|lyric|audio|video|music|8d|cover|remix|live|sped up|slowed|reverb)/gi, '').trim();
        let usedTitles = new Set([baseTitleCheck]);

        // 🔥 FILTERNYA GUA BIKIN MAKIN GALAK BUAT NANGKIS RINGTONE & DJ 🔥
        combined.filter(t => t.type === 'video' && !isBadMix(t.title)).forEach(t => {
            const validId = t.id || t.videoId || (t.url ? t.url.split('v=')[1] : null);
            if (!validId || usedIds.has(validId)) return;
            
            let cleanTitle = t.title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
            if (cleanTitle.includes('-')) cleanTitle = cleanTitle.split('-')[1];
            cleanTitle = cleanTitle.trim();

            let titleCheck = cleanTitle.toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/(official|lyric|audio|video|music|8d|cover|remix|live|sped up|slowed|reverb)/gi, '').trim();
            if (titleCheck.length > 3) {
                let isDup = Array.from(usedTitles).some(seen => seen.includes(titleCheck) || titleCheck.includes(seen));
                if (isDup) return; 
                usedTitles.add(titleCheck);
            }

            mix.push({
                id: validId, title: cleanTitle, artist: t.author?.name || 'YouTube', image: t.thumbnail
            });
            usedIds.add(validId);
        });

        mix = mix.slice(0, 25);
        if (mix.length > 0) {
            sessionStorage.setItem(cacheKey, JSON.stringify(mix)); 
            usePlayerStore.setState(state => {
                const existingIds = new Set(state.queue.map(q => q.id));
                const newUnique = mix.filter(m => !existingIds.has(m.id));
                return { queue: [...state.queue, ...newUnique] }; 
            });
        }
    } catch (e) {}
  };

  if (selectedPlaylist) {
    const pl = playlists.find(p => p.id === selectedPlaylist) || customPlaylists.find(p => p.id === selectedPlaylist);
    
    return (
      <div className="pt-4 pb-24 px-4 md:px-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setSelectedPlaylist(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors p-2 -ml-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={24} /> <span className="font-bold hidden md:inline">Kembali</span>
        </button>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-8 items-center md:items-start">
          <div className={`w-48 h-48 md:w-64 md:h-64 rounded-xl flex items-center justify-center shadow-2xl flex-shrink-0 ${pl.icon ? 'bg-zinc-800' : 'bg-gradient-to-br from-[#ff0000] to-red-900'}`}>
            {pl.icon ? pl.icon : <ListMusic size={64} className="text-white opacity-80" />}
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left mt-4 md:mt-10">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">{pl.title}</h1>
            <p className="text-zinc-400 text-sm md:text-base font-medium mb-8">{pl.desc}</p>
            
            <div className="flex items-center gap-4">
              <button onClick={() => handlePlayAll(pl.data)} className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-xl">
                <Play fill="currentColor" size={20} className="ml-1" /> Putar
              </button>
              <button className="flex items-center gap-2 bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-md">
                <Shuffle size={20} /> Acak
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col border-t border-white/10 pt-4">
          {pl.data.length > 0 ? pl.data.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-4 py-2 px-3 md:px-4 rounded-lg cursor-pointer group transition-colors ${isCurrent ? 'bg-white/10' : 'hover:bg-white/5'}`} 
                onClick={() => handlePlaySong(song, pl.data, idx)}
              >
                <div className="text-zinc-500 font-bold w-6 text-center hidden md:block">
                    {isPlaying && isCurrent ? <Pause size={16} fill="currentColor" className="text-white inline" /> : (isCurrent ? <Play size={16} fill="currentColor" className="text-white inline" /> : idx + 1)}
                </div>
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img loading="lazy" src={song.image} className="w-full h-full object-cover rounded shadow-md" alt="cover" />
                  <div className={`absolute inset-0 bg-black/50 rounded flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {isPlaying && isCurrent ? <Pause fill="white" size={16} /> : <Play fill="white" size={16} className="ml-0.5" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`text-base font-bold line-clamp-1 ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>{song.title}</p>
                  <p className="text-sm text-zinc-400 truncate mt-0.5">{song.artist}</p>
                </div>
                
                <div className="flex items-center gap-1 md:gap-3">
                  {/* 🔥 TOMBOL HAPUS WARNA PUTIH KALEM 🔥 */}
                  {pl.id === 'diunduh' && (
                    <button 
                      onClick={(e) => handleDeleteDownload(e, song.id)}
                      className="p-3 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-all"
                      title="Hapus dari HP"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button onClick={(e) => openMenu(e, song)} className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-2">
                      <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            )
          }) : (
            <div className="text-zinc-500 text-center py-20 font-medium">Belum ada lagu di daftar putar ini.</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 pb-20 px-4 md:px-8 animate-in fade-in duration-300 max-w-5xl mx-auto relative">
      
      <div className="flex overflow-x-auto gap-3 pb-4 pr-4 hide-scrollbar sticky top-0 bg-[#0f0f0f] z-30 pt-2">
        {tabs.map((tab, idx) => (
          <button 
             key={idx} 
             onClick={() => setActiveTab(tab)} 
             className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors border border-white/10 ${activeTab === tab ? 'bg-white text-black font-bold' : 'bg-transparent hover:bg-zinc-800 text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 mb-4 gap-4">
        <div className="text-sm font-bold text-zinc-400 tracking-wide">
          Pustaka Playlist Lu
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => loginWithGoogle()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-[#ff0000]/10 hover:bg-[#ff0000]/20 text-[#ff4444] px-4 py-2 rounded-full text-xs font-black transition-colors border border-[#ff0000]/30 shadow-md disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {isSyncing ? "Menyinkronkan..." : "Sync YouTube"}
          </button>

          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 bg-[#3ea6ff]/10 hover:bg-[#3ea6ff]/20 text-[#3ea6ff] px-4 py-2 rounded-full text-xs font-black transition-colors border border-[#3ea6ff]/30 shadow-md"
          >
            <Import size={16} /> Import Link
          </button>
        </div>
      </div>
      
      {activeTab === 'Daftar putar' && (
        <div className="flex flex-col gap-2 animate-in fade-in duration-300">
          
          {customPlaylists.map(pl => (
            <div 
               key={pl.id} 
               onClick={() => setSelectedPlaylist(pl.id)} 
               className="flex items-center gap-5 p-3 -mx-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group relative"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#ff0000] to-red-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <ListMusic size={28} className="text-white opacity-80" />
              </div>
              <div className="flex flex-col justify-center flex-1 pr-10">
                <h3 className="text-lg font-bold text-white leading-tight mb-1">{pl.title}</h3>
                <p className="text-sm text-zinc-400 font-medium leading-none">{pl.desc}</p>
              </div>
              
              {/* 🔥 TOMBOL HAPUS WARNA PUTIH KALEM 🔥 */}
              <button 
                onClick={(e) => handleDeleteCustomPlaylist(e, pl.id)} 
                className="absolute right-4 p-2 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 rounded-full"
                title="Hapus Playlist"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          {playlists.map(pl => (
            <div 
               key={pl.id} 
               onClick={() => setSelectedPlaylist(pl.id)} 
               className="flex items-center gap-5 p-3 -mx-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-700 transition-colors shadow-md">
                {pl.icon}
              </div>
              <div className="flex flex-col justify-center flex-1">
                <h3 className="text-lg font-bold text-white leading-tight mb-1">{pl.title}</h3>
                <p className="text-sm text-zinc-400 font-medium leading-none">{pl.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Lagu' && (
        <div className="flex flex-col border-t border-white/10 pt-2 mt-2 animate-in fade-in duration-300">
          {likedSongs.length > 0 ? likedSongs.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div 
                key={idx} 
                className={`flex items-center gap-4 py-2.5 px-3 md:px-4 -mx-3 md:-mx-4 rounded-lg cursor-pointer group transition-colors ${isCurrent ? 'bg-white/10' : 'hover:bg-white/5'}`} 
                onClick={() => handlePlaySong(song, likedSongs, idx)}
              >
                <div className="text-zinc-500 font-bold w-6 text-center hidden md:block">
                    {isPlaying && isCurrent ? <Pause size={16} fill="currentColor" className="text-white inline" /> : (isCurrent ? <Play size={16} fill="currentColor" className="text-white inline" /> : idx + 1)}
                </div>
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img src={song.image} className="w-full h-full object-cover rounded shadow-md" alt="cover" />
                  <div className={`absolute inset-0 bg-black/50 rounded flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {isPlaying && isCurrent ? <Pause fill="white" size={16} /> : <Play fill="white" size={16} className="ml-0.5" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`text-base font-bold line-clamp-1 ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>{song.title}</p>
                  <p className="text-sm text-zinc-400 truncate mt-0.5">{song.artist}</p>
                </div>
                <button onClick={(e) => openMenu(e, song)} className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <MoreVertical size={20} />
                </button>
              </div>
            )
          }) : (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
               <Heart size={48} className="mb-4 opacity-20" />
               <p className="text-lg font-bold text-white mb-2">Belum ada lagu yang disukai</p>
               <p className="text-sm text-center">Lagu yang Anda sukai akan muncul di sini.</p>
            </div>
          )}
        </div>
      )}

      {['Album', 'Artis', 'Podcasts'].includes(activeTab) && (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-500 animate-in fade-in duration-300">
           {activeTab === 'Album' && <Disc3 size={64} className="mb-6 opacity-20" />}
           {activeTab === 'Artis' && <Users size={64} className="mb-6 opacity-20" />}
           {activeTab === 'Podcasts' && <Mic2 size={64} className="mb-6 opacity-20" />}
           
           <p className="text-xl font-bold text-white mb-2">Tidak ada {activeTab.toLowerCase()}</p>
           <p className="text-sm text-center max-w-xs">Anda belum menyimpan {activeTab.toLowerCase()} apa pun ke pustaka lokal Anda.</p>
        </div>
      )}
      
      {showImportModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#181818] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LinkIcon className="text-[#3ea6ff]" /> Tarik Playlist (Permanen)
              </h2>
              <button onClick={() => !isImporting && setShowImportModal(false)} className="text-zinc-400 hover:text-white transition-colors bg-black/20 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                Males masukin lagu satu-satu? *Paste* link (URL) dari Playlist <b>Spotify</b> atau <b>YouTube</b> lu di mari. Sistem bakal nyedot otomatis dan nyimpen playlist-nya permanen di web lu!
              </p>

              <form onSubmit={handleImportLink} className="relative mb-6">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-zinc-500" />
                </div>
                <input 
                  type="url" 
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  disabled={isImporting}
                  placeholder="https://open.spotify.com/playlist/..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-32 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff] transition-all shadow-inner"
                  required
                />
                {!isImporting && (
                  <button type="submit" disabled={!importUrl.trim()} className="absolute inset-y-2 right-2 bg-[#3ea6ff] hover:bg-blue-500 text-black font-bold px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50">
                    Sedot!
                  </button>
                )}
              </form>

              {isImporting && (
                <div className="flex flex-col items-center justify-center p-4 bg-[#3ea6ff]/10 rounded-xl border border-[#3ea6ff]/20">
                  <Loader2 className="animate-spin text-[#3ea6ff] mb-2" size={32} />
                  <p className="text-sm font-bold text-white text-center">{importProgress}</p>
                  <p className="text-xs text-zinc-400 mt-1 text-center">Tahan napas bentar Bang...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#282828] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-2xl z-[9999] animate-in slide-in-from-bottom-5 border border-white/10 whitespace-nowrap flex items-center gap-2">
              {toastMsg}
          </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// 🔥 BUNGKUS KOMPONEN UTAMA PAKE PROVIDER LOGIN GOOGLE 🔥
export default function Library() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <LibraryContent />
    </GoogleOAuthProvider>
  );
}