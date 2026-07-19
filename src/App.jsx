import { useRef, useEffect, useState, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, Search as SearchIcon, Library, User, 
  Play, SkipBack, SkipForward, Heart, Pause, 
  ChevronDown, Cast, MoreVertical, ListPlus, Shuffle, Repeat, Repeat1, Mic2, Music, Film, Target,
  History, Trash2, X, Loader2, Minus, Plus, Radio, ListVideo, Bookmark, ThumbsUp, Download
} from 'lucide-react';
import { usePlayerStore } from './store/usePlayerStore';

import Home from './pages/Home';
import Search from './pages/Search';
import Artist from './pages/Artist';
import LibraryPage from './pages/Library';
import Developer from './pages/Developer';

import rndLogo from './store/rndigital.jpg';

const MosqueIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2c-1.5 2-2.5 3.5-2.5 5.5V10h5V7.5C14.5 5.5 13.5 4 12 2z"/>
    <path d="M9 21v-4a3 3 0 0 1 6 0v4"/>
    <path d="M4 12v9"/>
    <path d="M20 12v9"/>
    <path d="M2 21h20"/>
    <path d="M5 12h14"/>
  </svg>
);

const MosqueOffIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2c-1.5 2-2.5 3.5-2.5 5.5V10h5V7.5C14.5 5.5 13.5 4 12 2z"/>
    <path d="M9 21v-4a3 3 0 0 1 6 0v4"/>
    <path d="M4 12v9"/>
    <path d="M20 12v9"/>
    <path d="M2 21h20"/>
    <path d="M5 12h14"/>
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);

export default function App() {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, playSong, queue, currentIndex } = usePlayerStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('upnext'); 
  const [mediaMode, setMediaMode] = useState('audio'); 
  const [lyricsMode, setLyricsMode] = useState('synced'); 

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const [textSuggestions, setTextSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('ytm_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  const iframeRef = useRef(null);
  const audioRef = useRef(null);
  const ghostAudioRef = useRef(null); 
  const adzanAudioRef = useRef(null); 
  
  const API_BASE = `http://${window.location.hostname}:5000`;

  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeRef = useRef(0);
  const [duration, setDuration] = useState(0); 
  const [isDragging, setIsDragging] = useState(false);
  
  const [audioStreamUrl, setAudioStreamUrl] = useState(null);
  const [preloadedNextUrl, setPreloadedNextUrl] = useState(null); 
  const [isBuffering, setIsBuffering] = useState(false);

  const [lyrics, setLyrics] = useState([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const lyricsContainerRef = useRef(null);
  
  const activeQueueRef = useRef(null);
  const [lyricOffset, setLyricOffset] = useState(0);
  const [lrclibDuration, setLrclibDuration] = useState(0); 
  const [isSyncMode, setIsSyncMode] = useState(false);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const repeatMode = usePlayerStore(state => state.repeatMode || 'off'); 

  const [toastMsg, setToastMsg] = useState("");
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, song: null });

  const [adzanMode, setAdzanMode] = useState(() => JSON.parse(localStorage.getItem('ytm_adzan_mode') || 'false'));
  const [isAdzanPlaying, setIsAdzanPlaying] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState([]);
  const lastAdzanTriggered = useRef("");
  const wasPlayingBeforeAdzan = useRef(false);

  const [relatedSongs, setRelatedSongs] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  const showToast = (msg) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(""), 3500);
  };

  // =========================================================================
  // 🔥 TOMBOL KONTROL YANG LEBIH SINKRON DENGAN STATE BAWAAN STORE LU 🔥
  // =========================================================================
  const handleNextLocal = (e) => {
      if (e) e.stopPropagation();
      if (isAdzanPlaying) return showToast("🕌 Sedang Adzan, harap tunggu sebentar...");
      
      // Pancingan Unlock Audio iOS sebelum React muter lagunya
      if (audioRef.current && audioRef.current.paused) audioRef.current.play().catch(()=>{});
      usePlayerStore.getState().playNext(isShuffle);
  };

  const handlePrevLocal = (e) => {
      if (e) e.stopPropagation();
      if (isAdzanPlaying) return showToast("🕌 Sedang Adzan, harap tunggu sebentar...");

      if (currentTime > 3) {
          handleSeek({ target: { value: 0 } });
      } else {
          if (audioRef.current && audioRef.current.paused) audioRef.current.play().catch(()=>{});
          playPrev();
      }
  };

  const handleTogglePlayLocal = (e) => {
      if (e) e.stopPropagation();
      if (isAdzanPlaying) return showToast("🕌 Sedang Adzan, harap tunggu sebentar...");

      if (isPlaying) {
          audioRef.current?.pause();
          if (mediaMode === 'video') iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
          togglePlay();
      } else {
          audioRef.current?.play().catch(()=>{});
          if (mediaMode === 'video') iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
          togglePlay();
      }
  };

  const handlePlayClick = (e, song, list, idx) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (isAdzanPlaying) return showToast("🕌 Sedang Adzan, harap tunggu sebentar...");
      
      if (audioRef.current && audioRef.current.paused) audioRef.current.play().catch(()=>{});
      playSong(song, list, idx); 
  };
  // =========================================================================

  useEffect(() => {
    const nextSong = queue[currentIndex + 1];
    if (nextSong && nextSong.id) {
        const nextUrl = `${API_BASE}/api/audio?id=${nextSong.id}`;
        if (ghostAudioRef.current) {
            ghostAudioRef.current.src = nextUrl;
            ghostAudioRef.current.load(); 
        }
    }
  }, [queue, currentIndex, API_BASE]);

  useEffect(() => {
    const unlockAudioContext = () => {
      if (audioRef.current && audioRef.current.paused && !currentSong?.id) {
         audioRef.current.src = "data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
         audioRef.current.play().then(() => {
             audioRef.current.pause();
             audioRef.current.src = '';
         }).catch(() => {});
      }
      if (adzanAudioRef.current && adzanAudioRef.current.paused) {
          adzanAudioRef.current.load(); // Pemanasan audio adzan
      }
      document.removeEventListener('click', unlockAudioContext);
      document.removeEventListener('touchstart', unlockAudioContext);
    };
    document.addEventListener('click', unlockAudioContext);
    document.addEventListener('touchstart', unlockAudioContext);
    return () => {
      document.removeEventListener('click', unlockAudioContext);
      document.removeEventListener('touchstart', unlockAudioContext);
    };
  }, [currentSong]);

  useEffect(() => {
    localStorage.setItem('ytm_adzan_mode', JSON.stringify(adzanMode));
    if (adzanMode) {
        fetch('https://api.aladhan.com/v1/timingsByCity?city=Jakarta&country=Indonesia&method=11')
        .then(res => res.json())
        .then(data => {
            const timings = data.data.timings;
            setPrayerTimes([timings.Fajr, timings.Dhuhr, timings.Asr, timings.Maghrib, timings.Isha]);
        }).catch(e => console.error("Gagal menarik jadwal adzan", e));
    }
  }, [adzanMode]);

  useEffect(() => {
    if (!adzanMode || prayerTimes.length === 0) return;
    const interval = setInterval(() => {
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        if (prayerTimes.includes(timeStr) && lastAdzanTriggered.current !== timeStr) {
            lastAdzanTriggered.current = timeStr;
            
            wasPlayingBeforeAdzan.current = usePlayerStore.getState().isPlaying;
            setIsAdzanPlaying(true);
            
            if (wasPlayingBeforeAdzan.current) {
                usePlayerStore.setState({ isPlaying: false });
                if (mediaMode === 'video') iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
                audioRef.current?.pause();
            }

            showToast('🕌 Waktu Adzan tiba! Mendengarkan panggilan...');
            
            if (adzanAudioRef.current) {
                adzanAudioRef.current.play().catch(e => {
                    console.log("Auto-play Adzan diblokir browser, pindah ke mode Timer", e);
                    setTimeout(() => {
                        setIsAdzanPlaying(false);
                        if (wasPlayingBeforeAdzan.current) {
                            usePlayerStore.setState({ isPlaying: true });
                            if (mediaMode === 'video') iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
                            audioRef.current?.play().catch(()=>{});
                            showToast('▶️ Adzan selesai. Melanjutkan musik...');
                        }
                    }, 240000); 
                });
            }
        }
    }, 10000); 
    return () => clearInterval(interval);
  }, [adzanMode, prayerTimes, mediaMode]);

  useEffect(() => {
    const handleOpenMenu = (e) => {
        const { event, song } = e.detail;
        let x = event.clientX;
        let y = event.clientY;
        
        const menuWidth = 260;
        const menuHeight = 320; 

        if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
        if (y + menuHeight > window.innerHeight) {
            y = event.clientY - menuHeight;
            if (y < 10) y = 10;
        }

        setContextMenu({ isOpen: true, x, y, song });
    };

    const handleCloseMenu = () => setContextMenu(prev => ({ ...prev, isOpen: false }));
    
    window.addEventListener('openSongMenu', handleOpenMenu);
    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('scroll', handleCloseMenu, true);
    
    return () => {
        window.removeEventListener('openSongMenu', handleOpenMenu);
        window.removeEventListener('click', handleCloseMenu);
        window.removeEventListener('scroll', handleCloseMenu, true);
    };
  }, []);

  const handleMenuPlayNext = () => {
      const st = usePlayerStore.getState();
      if (st.queue[st.currentIndex + 1]?.id !== contextMenu.song.id) {
          const newQ = [...st.queue];
          newQ.splice(st.currentIndex + 1, 0, contextMenu.song);
          usePlayerStore.setState({ queue: newQ });
          showToast("Lagu akan diputar selanjutnya");
      }
      setContextMenu(p => ({...p, isOpen: false}));
  };

  const handleMenuAddToQueue = () => {
      const st = usePlayerStore.getState();
      usePlayerStore.setState({ queue: [...st.queue, contextMenu.song] });
      showToast("Ditambahkan ke antrean");
      setContextMenu(p => ({...p, isOpen: false}));
  };

  const handleMenuLike = () => {
      const likedSongs = JSON.parse(localStorage.getItem('ytm_liked_songs') || '[]');
      if (!likedSongs.some(s => s.id === contextMenu.song.id)) {
          likedSongs.unshift(contextMenu.song);
          localStorage.setItem('ytm_liked_songs', JSON.stringify(likedSongs));
          window.dispatchEvent(new Event('likedSongsUpdated'));
          showToast("Berhasil ditambahkan ke Lagu yang Disukai");
      }
      setContextMenu(p => ({...p, isOpen: false}));
  };

  const handleMenuSaveGallery = () => {
      showToast("Tersimpan ke galeri perpustakaan");
      setContextMenu(p => ({...p, isOpen: false}));
  };

  useEffect(() => {
    if (!currentSong || !currentSong.id) return;
    let playHistory = JSON.parse(localStorage.getItem('ytm_play_history') || '[]');
    playHistory = playHistory.filter(s => s.id !== currentSong.id);
    const songToSave = {
        id: currentSong.id, title: currentSong.title, artist: currentSong.artist,
        image: currentSong.image, url: `https://www.youtube.com/watch?v=${currentSong.id}`
    };
    playHistory.unshift(songToSave);
    playHistory = playHistory.slice(0, 24); 
    localStorage.setItem('ytm_play_history', JSON.stringify(playHistory));
    window.dispatchEvent(new Event('historyUpdated'));
  }, [currentSong?.id]);

  const toggleLike = (e) => {
    if (e) e.stopPropagation();
    if (!currentSong?.id) return;
    const likedSongs = JSON.parse(localStorage.getItem('ytm_liked_songs') || '[]');
    let newLikedSongs;
    if (isLiked) {
        newLikedSongs = likedSongs.filter(song => song.id !== currentSong.id);
        showToast("Dihapus dari Lagu Disukai");
    } else {
        const songToSave = { id: currentSong.id, title: currentSong.title, artist: currentSong.artist, image: currentSong.image };
        if (!likedSongs.some(s => s.id === currentSong.id)) newLikedSongs = [songToSave, ...likedSongs];
        else newLikedSongs = likedSongs;
        showToast("Ditambahkan ke Lagu Disukai");
    }
    localStorage.setItem('ytm_liked_songs', JSON.stringify(newLikedSongs));
    setIsLiked(!isLiked);
    window.dispatchEvent(new Event('likedSongsUpdated'));
  };

  const generateRadioMix = async (baseSong) => {
    if(!baseSong) return;
    let cleanArtist = (baseSong.artist || 'Official').split('-')[0].trim();
    cleanArtist = cleanArtist.replace(/vevo|official|topic|music|lyric|video/gi, '').trim();
    let queryPool = [`${cleanArtist} official music video`, `${cleanArtist} pop hits official audio`];

    try {
        const responses = await Promise.all(queryPool.map(q => fetch(`https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(q)}`)));
        const datasets = await Promise.all(responses.map(r => r.json()));
        let combined = [];
        datasets.forEach(d => { if(d.status && d.data) combined = [...combined, ...d.data.sort(() => 0.5 - Math.random())]; });
        let mix = [];
        let usedIds = new Set([baseSong.id]); 

        combined.filter(t => t.type === 'video').forEach(t => {
            const validId = t.id || t.videoId || (t.url ? t.url.split('v=')[1] : null);
            if (!validId || usedIds.has(validId)) return;
            let cleanTitle = t.title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
            if (cleanTitle.includes('-')) cleanTitle = cleanTitle.split('-')[1];
            mix.push({
                id: validId, title: cleanTitle.trim(), artist: t.author?.name || 'YouTube', image: t.thumbnail
            });
            usedIds.add(validId);
        });

        mix = mix.sort(() => Math.random() - 0.5).slice(0, 25);
        if (mix.length > 0) usePlayerStore.setState(state => ({ queue: [baseSong, ...mix] }));
    } catch (e) {}
  };

  useEffect(() => {
    if (!currentSong || queue.length === 0) return;
    let cleanArtist = (currentSong.artist || 'Official').split('-')[0].trim();
    cleanArtist = cleanArtist.replace(/vevo|official|topic|music|lyric|video/gi, '').trim();

    let isMonotonous = false;
    if (queue.length > 2) {
        let pureTitle = currentSong.title.toLowerCase().replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/[^a-z0-9\s]/gi, ' ').trim();
        const firstWord = pureTitle.split(' ').filter(w => w.length >= 4)[0];
        if (firstWord && queue[1]?.title.toLowerCase().includes(firstWord)) isMonotonous = true;
    }
    
    if (queue.length <= 1 || isMonotonous) {
        usePlayerStore.setState({ queue: [currentSong] });
        generateRadioMix(currentSong);
    }
  }, [currentSong?.id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setSearchQuery(q);
  }, [location.search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsFetchingSuggestions(true);
        try {
          const queryPintar = encodeURIComponent(searchQuery.trim());
          const response = await fetch(`https://api.siputzx.my.id/api/s/youtube?query=${queryPintar}`);
          const resData = await response.json();
          if (resData.status && resData.data) {
            let formattedResults = resData.data.filter(item => item.type === 'video').map(track => {
                const validId = track.id || track.videoId || (track.url ? track.url.split('v=')[1] : null);
                return { id: validId, title: track.title, artist: track.author?.name || 'YouTube', image: track.thumbnail };
              }).filter(track => track.id != null);

            const qLower = searchQuery.trim().toLowerCase();
            const uniqueTexts = new Set();
            formattedResults.forEach(track => {
              let cleanT = track.title.toLowerCase().replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/(official|music video|lyrics?|audio|hd|hq)/gi, '').replace(/[^a-z0-9\s-]/gi, '').trim();
              if (cleanT.length > 2) uniqueTexts.add(cleanT);
            });
            setTextSuggestions([qLower, ...Array.from(uniqueTexts).filter(t => t !== qLower)].slice(0, 6));
            setLiveSuggestions(formattedResults.slice(0, 4)); 
          }
        } catch (error) {} finally { setIsFetchingSuggestions(false); }
      } else { setLiveSuggestions([]); setTextSuggestions([]); }
    }, 500); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const executeSearch = (query) => {
    const q = query.trim();
    if (!q) return;
    setSearchQuery(q); 
    const newHistory = [q, ...searchHistory.filter(item => item !== q)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('ytm_search_history', JSON.stringify(newHistory));
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setShowSearchHistory(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    executeSearch(searchQuery);
    if (document.activeElement) document.activeElement.blur(); 
  };

  const removeSearchHistory = (itemToRemove) => {
    const newHistory = searchHistory.filter(item => item !== itemToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem('ytm_search_history', JSON.stringify(newHistory));
  };

  const displayTitle = useMemo(() => {
    if (!currentSong?.title) return "Pilih Lagu";
    let t = currentSong.title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
    if (t.includes('-')) t = t.split('-')[1]; 
    return t.trim();
  }, [currentSong?.title]);

  const displayArtist = useMemo(() => {
    if (!currentSong?.title) return "Artis";
    if (currentSong.title.includes('-')) {
      let a = currentSong.title.split('-')[0].replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
      return a.trim();
    }
    return currentSong.artist || "Artis";
  }, [currentSong]);

  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
      if (mediaMode === 'audio') {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
      } else {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
          if (isPlaying && !isAdzanPlaying) iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
      }
    }
  };

  useEffect(() => {
      const syncMedia = () => {
          if (!iframeRef.current?.contentWindow) return;
          if (isAdzanPlaying) return; 

          if (mediaMode === 'audio') {
              if (audioRef.current) audioRef.current.muted = false;
              iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
              iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
          } else {
              if (audioRef.current) audioRef.current.muted = true;
              if (audioRef.current) {
                  iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [audioRef.current.currentTime, true] }), '*');
              }
              iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
              if (isPlaying) {
                  iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
              } else {
                  iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
              }
          }
      };

      syncMedia();
      const t1 = setTimeout(syncMedia, 500);
      return () => { clearTimeout(t1); };
  }, [mediaMode, isPlaying, currentSong?.id, isAdzanPlaying]);

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'infoDelivery' && data.info) {
          if (mediaMode === 'video') {
              if (data.info.currentTime !== undefined && !isDragging) {
                 setCurrentTime(data.info.currentTime);
                 currentTimeRef.current = data.info.currentTime;
              }
              if (data.info.duration !== undefined) setDuration(data.info.duration);
              
              if (data.info.playerState !== undefined) {
                 const state = data.info.playerState;
                 if (state === 1 && !usePlayerStore.getState().isPlaying && !isAdzanPlaying) {
                     usePlayerStore.setState({ isPlaying: true }); 
                 } else if (state === 2 && usePlayerStore.getState().isPlaying) {
                     usePlayerStore.setState({ isPlaying: false }); 
                 } else if (state === 0) {
                     const currentRepeat = usePlayerStore.getState().repeatMode;
                     if (currentRepeat === 'one') {
                         handleSeek({ target: { value: 0 } });
                         iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
                     } else {
                         handleNextLocal(null);
                     }
                 }
              }
          } else if (mediaMode === 'audio') {
              if (data.info.playerState === 1) {
                  iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
              }
          }
        }
      } catch (e) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isDragging, mediaMode, isAdzanPlaying]);

  useEffect(() => {
      if (activeTab === 'artist' && displayArtist && displayArtist !== "Artis") {
          setIsLoadingRelated(true);
          fetch(`https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(displayArtist + " official audio")}`)
              .then(res => res.json())
              .then(data => {
                  if (data?.data) {
                      const tracks = data.data.filter(t => t.type === 'video').slice(0, 15).map(t => {
                          const vid = t.id || t.videoId || (t.url ? t.url.split('v=')[1] : null);
                          let cleanT = t.title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
                          if (cleanT.includes('-')) cleanT = cleanT.split('-')[1];
                          return { id: vid, title: cleanT.trim(), artist: displayArtist, image: t.thumbnail, url: `https://www.youtube.com/watch?v=${vid}` };
                      }).filter(t => t.id);
                      setRelatedSongs(tracks);
                  }
              })
              .catch(err => console.error(err))
              .finally(() => setIsLoadingRelated(false));
      }
  }, [activeTab, displayArtist]);

  useEffect(() => {
    if (!currentSong?.id) {
        setIsLiked(false);
        setAudioStreamUrl(null);
        return;
    }

    const expectedUrl = `${API_BASE}/api/audio?id=${currentSong.id}`;
    const isAlreadyPlaying = audioRef.current && (audioRef.current.src === expectedUrl || audioRef.current.src.includes(currentSong.id)) && !audioRef.current.paused;

    if (isAlreadyPlaying) {
        setMediaMode('audio');
        setIsBuffering(false);
    } else {
        setCurrentTime(0);
        currentTimeRef.current = 0;
        setDuration(0);
        setLyricOffset(0);
        setIsSyncMode(false);
        setLrclibDuration(0);
        setMediaMode('audio'); 
        setLyricsMode('synced'); 

        const likedSongs = JSON.parse(localStorage.getItem('ytm_liked_songs') || '[]');
        setIsLiked(likedSongs.some(song => song.id === currentSong.id));
        
        if (audioRef.current) {
            audioRef.current.src = expectedUrl;
            audioRef.current.load();
            setIsBuffering(true);
            if (isPlaying && !isAdzanPlaying) {
                audioRef.current.play().catch(()=>{});
            }
        }
    }

    if (currentSong?.title) {
      setIsLoadingLyrics(true);
      setLyrics([]);
      setActiveLyricIndex(-1);
      fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${displayTitle} ${displayArtist}`.trim())}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const safeTitle = displayTitle.toLowerCase().trim();
            const exactMatches = data.filter(t => t.trackName?.toLowerCase().includes(safeTitle) || safeTitle.includes(t.trackName?.toLowerCase()));
            let track = exactMatches.length > 0 ? (exactMatches.find(t => t.syncedLyrics) || exactMatches.find(t => t.plainLyrics) || exactMatches[0]) : (data.find(t => t.syncedLyrics) || data.find(t => t.plainLyrics) || data[0]);

            if (track) {
              setLrclibDuration(track.duration || 0);
              if (track.syncedLyrics) {
                const parsed = track.syncedLyrics.split('\n').map(line => {
                  const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
                  if (match && match[4].trim() !== '') return { time: parseInt(match[1]) * 60 + parseInt(match[2]), text: match[4].trim() };
                  return null;
                }).filter(item => item !== null);
                if (parsed.length > 0) { setLyrics(parsed); setLyricsMode('synced'); return; }
              }
              if (track.plainLyrics) {
                const parsed = track.plainLyrics.split('\n').map(line => ({ time: 0, text: line.trim() })).filter(item => item.text !== '');
                if (parsed.length > 0) { setLyrics(parsed); setLyricsMode('full'); }
              }
            }
          }
        }).finally(() => setIsLoadingLyrics(false));
    }
  }, [currentSong?.id, displayTitle, displayArtist, API_BASE]);

  useEffect(() => {
    if (duration > 0 && lrclibDuration > 0) {
      const selisih = Math.round(duration - lrclibDuration);
      if (selisih > 0 && selisih <= 15) setLyricOffset(selisih);
      else setLyricOffset(0);
    }
  }, [duration, lrclibDuration]);

  useEffect(() => {
    if (lyrics.length > 0 && !isSyncMode && lyricsMode === 'synced') {
      const adjustedTime = currentTime - lyricOffset;
      const currentIndex = lyrics.findIndex((l, index) => {
        const nextLyric = lyrics[index + 1];
        return adjustedTime >= l.time && (!nextLyric || adjustedTime < nextLyric.time);
      });
      if (currentIndex !== activeLyricIndex && currentIndex !== -1) {
        setActiveLyricIndex(currentIndex);
        if (lyricsContainerRef.current) {
          const activeElement = lyricsContainerRef.current.children[currentIndex];
          if (activeElement) activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, lyrics, activeLyricIndex, lyricOffset, isSyncMode, lyricsMode]);

  const handleSeek = (e) => {
    if (isAdzanPlaying) return; 
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    currentTimeRef.current = seekTime;
    if (mediaMode === 'audio' && audioRef.current) {
        audioRef.current.currentTime = seekTime;
    }
    if (mediaMode === 'video' && iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [seekTime, true] }), '*');
    }
  };

  const toggleRepeat = () => {
    usePlayerStore.setState(prev => {
      if (prev.repeatMode === 'off') return { repeatMode: 'all' };
      if (prev.repeatMode === 'all') return { repeatMode: 'one' };
      return { repeatMode: 'off' };
    });
  };

  const toggleTab = (tabName) => {
    if (tabName === 'lyrics') {
      if (activeTab === 'lyrics' || activeTab === 'lyrics_only') setActiveTab('cover');
      else setActiveTab('lyrics'); 
      return;
    }
    setActiveTab(activeTab === tabName ? 'cover' : tabName);
  };

  useEffect(() => {
    if (activeTab === 'upnext' && activeQueueRef.current) {
      activeQueueRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSong?.id, activeTab]);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: displayTitle,
        artist: displayArtist,
        album: 'RNmusic Premium',
        artwork: [{ src: currentSong.image || 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/jpeg' }]
      });
      navigator.mediaSession.setActionHandler('play', () => { handleTogglePlayLocal(null); });
      navigator.mediaSession.setActionHandler('pause', () => { handleTogglePlayLocal(null); });
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevLocal(null));
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextLocal(null));
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        handleSeek({ target: { value: details.seekTime } });
      });
    }
  }, [currentSong, displayTitle, displayArtist, isShuffle, isPlaying, isAdzanPlaying]);

  return (
    <div className="h-screen bg-gradient-to-br from-[#13151f] via-[#0f0f0f] to-[#000000] text-white flex flex-col font-sans overflow-hidden relative">
      
      {/* 🔥 AUDIO NATIVE MURNI 🔥 */}
      <audio
        ref={audioRef}
        playsInline
        preload="auto"
        onTimeUpdate={(e) => {
           if (!isDragging && mediaMode === 'audio') {
               setCurrentTime(e.target.currentTime);
               currentTimeRef.current = e.target.currentTime;
           }
        }}
        onLoadedMetadata={(e) => {
           if (mediaMode === 'audio') setDuration(e.target.duration);
        }}
        onCanPlay={() => {
           setIsBuffering(false);
           if (isPlaying && mediaMode === 'audio' && !isAdzanPlaying) audioRef.current.play().catch(() => console.log("Menunggu interaksi pengguna"));
        }}
        onEnded={() => { 
           if (mediaMode === 'audio') {
               if (usePlayerStore.getState().repeatMode === 'one') {
                   audioRef.current.currentTime = 0;
                   audioRef.current.play();
               } else {
                   handleNextLocal(null); 
               }
           }
        }}
        onError={(e) => {
           if (mediaMode === 'audio' && currentSong?.id && audioRef.current?.src) {
               console.log("Audio Error API 5000:", e);
               setIsBuffering(false);
               usePlayerStore.setState({ isPlaying: false });
               showToast("❌ File audio gagal dimuat. Pastikan backend 5000 merespon dan yt-dlp berjalan.");
           }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        className="hidden"
      />

      {/* 🔥 AUDIO KHUSUS ADZAN MAKKAH 🔥 */}
      <audio
        ref={adzanAudioRef}
        src="https://raw.githubusercontent.com/islamic-network/cdn/master/audio/adhan/makkah.mp3"
        onEnded={() => {
            setIsAdzanPlaying(false);
            if (wasPlayingBeforeAdzan.current) {
                usePlayerStore.setState({ isPlaying: true });
                if (mediaMode === 'video') iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
                audioRef.current?.play().catch(()=>{});
                showToast('▶️ Adzan selesai. Melanjutkan musik...');
            } else {
                showToast('▶️ Adzan selesai.');
            }
        }}
        className="hidden"
      />

      <audio
        ref={ghostAudioRef}
        preload="auto"
        muted
        playsInline
        className="hidden"
      />

      {toastMsg && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-2xl z-[99999] animate-in slide-in-from-bottom-5 whitespace-nowrap">
              {toastMsg}
          </div>
      )}

      {contextMenu.isOpen && contextMenu.song && (
        <div 
           className="fixed z-[9999] bg-[#282828] border border-white/10 rounded-lg shadow-2xl py-2 w-64 flex flex-col animate-in fade-in zoom-in duration-200"
           style={{ top: contextMenu.y, left: contextMenu.x }}
           onClick={(e) => e.stopPropagation()}
        >
           <button onClick={(e) => { 
               handlePlayClick(e, contextMenu.song, [contextMenu.song], 0);
               generateRadioMix(contextMenu.song); 
               showToast("Memulai Radio Mix...");
               setContextMenu(p => ({...p, isOpen: false}));
           }} className="flex items-center gap-4 px-4 py-3 hover:bg-white/10 text-sm font-medium text-white text-left transition-colors">
               <Radio size={20} className="text-zinc-400" /> Mulai mix
           </button>

           <button onClick={handleMenuPlayNext} className="flex items-center gap-4 px-4 py-3 hover:bg-white/10 text-sm font-medium text-white text-left transition-colors">
               <ListVideo size={20} className="text-zinc-400" /> Putar setelah ini
           </button>

           <button onClick={handleMenuAddToQueue} className="flex items-center gap-4 px-4 py-3 hover:bg-white/10 text-sm font-medium text-white text-left transition-colors border-b border-white/10">
               <ListPlus size={20} className="text-zinc-400" /> Tambahkan ke antrean
           </button>

           <button onClick={handleMenuSaveGallery} className="flex items-center gap-4 px-4 py-3 hover:bg-white/10 text-sm font-medium text-white text-left transition-colors">
               <Bookmark size={20} className="text-zinc-400" /> Simpan ke galeri
           </button>

           <button onClick={handleMenuLike} className="flex items-center gap-4 px-4 py-3 hover:bg-white/10 text-sm font-medium text-white text-left transition-colors border-b border-white/10">
               <ThumbsUp size={20} className="text-zinc-400" /> Tambahkan ke disukai
           </button>
           
           <button onClick={() => {
               window.open(`${API_BASE}/api/download?id=${contextMenu.song.id}`, '_blank');
               setContextMenu(p => ({...p, isOpen: false}));
           }} className="flex items-center gap-4 px-4 py-3 hover:bg-white/10 text-sm font-medium text-white text-left transition-colors">
               <Download size={20} className="text-zinc-400" /> Download MP3
           </button>
        </div>
      )}

      {/* NAVBAR ATAS */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 h-[72px] bg-[#050505]/60 backdrop-blur-xl z-[45] items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={rndLogo} alt="RNmusic logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-xl font-bold tracking-tighter">RNmusic</span>
          </div>

          <div className="flex items-center gap-8 ml-10">
            <Link to="/" className={`text-base font-bold transition-colors ${location.pathname === '/' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>Beranda</Link>
            <Link to="/library" className={`text-base font-bold transition-colors ${location.pathname === '/library' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>Pustaka</Link>
            <Link to="/developer" className={`text-base font-bold transition-colors ${location.pathname === '/developer' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>Developer</Link>
          </div>
        </div>
        
        <div className="flex-1 max-w-xl relative mx-8">
          <form onSubmit={handleSearchSubmit} className={`flex items-center bg-white/5 backdrop-blur-md border ${showSearchHistory ? 'border-white/30 rounded-t-xl' : 'border-white/10 rounded-xl'} px-4 py-2.5 transition-all w-full`}>
            <SearchIcon size={20} className="text-zinc-400 mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Telusuri lagu, album, artis, podcast" 
              className="bg-transparent border-none outline-none text-white w-full text-base placeholder:text-zinc-500 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); document.activeElement.focus(); }} 
                className="text-zinc-400 hover:text-white ml-2 transition-colors"
              >
                <X size={20} />
              </button>
            )}
            <button type="submit" className="hidden">Search</button>
          </form>
          
          {showSearchHistory && (
            <div className="absolute top-full left-0 right-0 bg-[#181818]/95 backdrop-blur-2xl border-x border-b border-white/10 rounded-b-xl shadow-2xl py-2 z-50 overflow-hidden flex flex-col max-h-[75vh]">
              {searchQuery.trim() === '' && searchHistory.length > 0 && searchHistory.map((item, idx) => (
                <div 
                  key={`hist-${idx}`} 
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/10 cursor-pointer group"
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    executeSearch(item); 
                  }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <History size={20} className="text-zinc-400 shrink-0" />
                    <span className="text-base text-zinc-200 font-semibold">{item}</span>
                  </div>
                  <button 
                    onMouseDown={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      removeSearchHistory(item); 
                    }}
                    className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {searchQuery.trim() !== '' && (
                <div className="flex flex-col overflow-y-auto hide-scrollbar pb-2">
                  {textSuggestions.map((text, idx) => (
                    <div 
                      key={`tsug-${idx}`}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-white/10 cursor-pointer group"
                      onMouseDown={(e) => { 
                        e.preventDefault(); 
                        executeSearch(text); 
                      }}
                    >
                      <SearchIcon size={20} className="text-zinc-400 shrink-0" />
                      <span className="text-base text-white font-semibold">{text}</span>
                    </div>
                  ))}

                  {isFetchingSuggestions && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="animate-spin text-zinc-400" size={24} />
                    </div>
                  )}

                  {!isFetchingSuggestions && liveSuggestions.length > 0 && (
                    <>
                      <div className="border-t border-white/10 my-2 mx-4"></div>
                      {liveSuggestions.map((song, idx) => (
                        <div 
                          key={`live-${idx}`}
                          className="flex items-center justify-between px-4 py-2 hover:bg-white/10 cursor-pointer group"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(song.title); 
                            handlePlayClick(e, song, [song], 0);
                            setShowSearchHistory(false);
                          }}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <img src={song.image} alt={song.title} className="w-10 h-10 md:w-12 md:h-12 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white line-clamp-1">{song.title}</p>
                              <p className="text-xs text-zinc-400 truncate mt-0.5">Lagu • {song.artist}</p>
                            </div>
                          </div>
                          
                          <button onClick={(e) => {
                             e.stopPropagation(); e.preventDefault();
                             window.dispatchEvent(new CustomEvent('openSongMenu', { detail: { event: e, song: song } }));
                          }} className="p-2 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                             <MoreVertical size={20} />
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-5 w-[160px]">
          <button onClick={() => {
              const newMode = !adzanMode;
              setAdzanMode(newMode);
              showToast(newMode ? "Mode Adzan Aktif 🕌" : "Mode Adzan Dimatikan");
          }} className={`transition-colors ${adzanMode ? 'text-[#3ea6ff]' : 'text-zinc-400 hover:text-white'}`} title="Mode Adzan (Auto Pause)">
            {adzanMode ? <MosqueIcon size={24} /> : <MosqueOffIcon size={24} />}
          </button>
          <Cast size={24} className="text-zinc-400 hover:text-white cursor-pointer" />
          <User size={24} className="text-zinc-400 hover:text-white cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-36 md:pb-28 pt-0 md:pt-[72px] z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/artist/:name" element={<Artist />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/developer" element={<Developer />} />
        </Routes>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-[#0a0a0a]/90 backdrop-blur-2xl flex justify-around items-center text-[10px] z-40 pb-1 border-t border-white/5 transition-transform duration-500 ${isExpanded ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-white' : 'text-zinc-400'}`}><HomeIcon size={24} /><span>Beranda</span></Link>
        <Link to="/search" className={`flex flex-col items-center gap-1 ${location.pathname === '/search' ? 'text-white' : 'text-zinc-400'}`}><SearchIcon size={24} /><span>Mencari</span></Link>
        <Link to="/library" className={`flex flex-col items-center gap-1 ${location.pathname === '/library' ? 'text-white' : 'text-zinc-400'}`}><Library size={24} /><span>Pustaka</span></Link>
        <Link to="/developer" className={`flex flex-col items-center gap-1 ${location.pathname === '/developer' ? 'text-white' : 'text-zinc-400'}`}><User size={24} /><span>Developer</span></Link>
      </div>

      {/* MINI PLAYER BAR */}
      <div 
        className={`fixed left-0 right-0 h-[64px] md:h-[72px] bg-[#212121]/95 backdrop-blur-2xl border-t border-black flex flex-col justify-center px-4 md:px-6 z-[90] cursor-pointer hover:bg-[#2a2a2a]/95 transition-all duration-500 
        ${isExpanded ? 'translate-y-[150%] opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto bottom-0' : 'translate-y-0 opacity-100 bottom-[60px] md:bottom-0'}`}
        onClick={() => { if(!isExpanded && currentSong?.id) setIsExpanded(true); }}
      >
        <div className="absolute top-[-5px] left-0 right-0 h-[10px] group/timeline items-center cursor-pointer z-50 md:flex hidden">
          <input 
             type="range" min={0} max={duration || 100} value={currentTime} 
             onMouseDown={(e) => { e.stopPropagation(); setIsDragging(true); }} 
             onMouseUp={(e) => { e.stopPropagation(); setIsDragging(false); }} 
             onChange={(e) => { e.stopPropagation(); handleSeek(e); }} 
             className="w-full h-full absolute inset-0 opacity-0 cursor-pointer z-20" 
          />
          <div className="w-full h-[2px] bg-white/10 group-hover/timeline:h-[4px] transition-all relative pointer-events-none">
             <div className="h-full bg-[#ff0000] relative transition-all duration-300" style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#ff0000] rounded-full opacity-0 group-hover/timeline:opacity-100 shadow-md"></div>
             </div>
          </div>
        </div>
        
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 md:hidden pointer-events-none">
           <div className="h-full bg-[#ff0000] transition-all duration-300" style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}></div>
        </div>

        <div className="md:hidden flex items-center justify-between w-full h-full pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 bg-white/5 rounded overflow-hidden shadow-lg relative">
              {currentSong?.image ? <img src={currentSong.image} className="w-full h-full object-cover" alt="cover" /> : <Music className="w-5 h-5 m-2.5 text-zinc-500" />}
              {isBuffering && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">{displayTitle}</span>
              <span className="text-xs text-zinc-400 truncate">{displayArtist}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            <button onClick={handleTogglePlayLocal} className="p-2">
              {isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} />}
            </button>
            <button onClick={handleNextLocal} className="p-2">
              <SkipForward fill="white" size={20} />
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center w-full h-full">
          <div className="flex items-center gap-5 w-1/3">
            <button onClick={handlePrevLocal} className="text-zinc-400 hover:text-white transition-colors">
              <SkipBack fill="currentColor" size={20} />
            </button>
            <button 
              onClick={handleTogglePlayLocal} 
              className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play className="ml-1" fill="currentColor" size={20} />}
            </button>
            <button onClick={handleNextLocal} className="text-zinc-400 hover:text-white transition-colors">
              <SkipForward fill="currentColor" size={20} />
            </button>
            <span className="text-xs text-zinc-400 font-medium ml-2 tracking-wide">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl mx-auto">
            <div className="w-[64px] h-[36px] flex-shrink-0 bg-black rounded-sm overflow-hidden relative shadow-md">
              {currentSong?.image ? (
                <img src={currentSong.image} className="absolute inset-0 w-full h-full object-cover" alt="cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                  <Music size={16} />
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate">{displayTitle}</span>
              <span className="text-[11px] text-zinc-400 truncate mt-0.5">{displayArtist} • Kualitas Premium</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-5 w-1/3 pr-2">
            <button onClick={toggleLike} className={`transition-colors ${isLiked ? 'text-[#3ea6ff]' : 'text-zinc-400 hover:text-white'}`}>
              <Heart fill={isLiked ? "currentColor" : "none"} size={20} strokeWidth={isLiked ? 0 : 2} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIsShuffle(!isShuffle); }} className={`transition-colors ${isShuffle ? 'text-[#3ea6ff]' : 'text-zinc-400 hover:text-white'}`}>
              <Shuffle size={18} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleRepeat(); }} className={`transition-colors ${repeatMode !== 'off' ? 'text-[#3ea6ff]' : 'text-zinc-400 hover:text-white'}`}>
              {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* FULLSCREEN PLAYER OVERLAY */}
      <div 
        className={`fixed top-0 left-0 right-0 bottom-0 md:bottom-[72px] bg-gradient-to-b from-[#1a1c29] to-[#0f0f0f] z-[80] flex flex-col transition-transform duration-500 ease-in-out 
        ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="h-[80px] shrink-0 flex justify-between items-center px-4 md:px-8 border-b border-white/5">
          <button onClick={() => setIsExpanded(false)} className="text-white hover:text-zinc-300 p-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronDown size={32} />
          </button>
          
          <div className="flex bg-white/10 rounded-full p-1 backdrop-blur-md">
            <button onClick={(e) => { e.stopPropagation(); setMediaMode('audio'); }} className={`flex items-center gap-1.5 px-6 py-1.5 rounded-full text-sm font-bold transition-colors ${mediaMode === 'audio' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}><Music size={16} /> Lagu</button>
            <button onClick={(e) => { e.stopPropagation(); setMediaMode('video'); }} className={`flex items-center gap-1.5 px-6 py-1.5 rounded-full text-sm font-bold transition-colors ${mediaMode === 'video' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}><Film size={16} /> Video</button>
          </div>
          
          <div className="flex gap-2 md:gap-4 text-white px-2">
            <button onClick={() => {
               const newMode = !adzanMode;
               setAdzanMode(newMode);
               showToast(newMode ? "Mode Adzan Aktif 🕌" : "Mode Adzan Dimatikan");
            }} className={`p-2 rounded-full hover:bg-white/10 transition-colors ${adzanMode ? 'text-[#3ea6ff]' : 'text-white'}`} title="Auto Pause Adzan">
               {adzanMode ? <MosqueIcon size={24} /> : <MosqueOffIcon size={24} />}
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 hidden md:block"><Cast size={24} /></button>
            <button onClick={(e) => {
               e.stopPropagation();
               if(currentSong) window.dispatchEvent(new CustomEvent('openSongMenu', { detail: { event: e, song: currentSong } }));
            }} className="p-2 rounded-full hover:bg-white/10"><MoreVertical size={24} /></button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto overflow-y-auto md:overflow-hidden hide-scrollbar">
          
          <div className="flex-1 min-w-0 flex flex-col h-full px-6 md:px-12 lg:px-20 pt-4 pb-6">
            
            <div className="flex-1 min-h-0 flex items-center justify-center w-full mx-auto relative p-2 md:p-8">
               <div className={`relative bg-black shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 flex items-center justify-center w-full h-full ${mediaMode === 'audio' ? 'aspect-square max-h-[45vh] md:max-h-[500px]' : 'aspect-video max-w-5xl max-h-full'}`}>
                  
                  {/* 🔥 THE YOUTUBE IFRAME DENGAN MUTE BAWAAN 🔥 */}
                  <iframe
                    ref={iframeRef} onLoad={handleIframeLoad}
                    width="100%" height="100%"
                    src={currentSong?.id ? `https://www.youtube.com/embed/${currentSong.id}?autoplay=1&mute=1&controls=0&disablekb=1&modestbranding=1&rel=0&iv_load_policy=3&fs=0&playsinline=1&enablejsapi=1&origin=${window.location.origin}` : ''}
                    title="YouTube Video" frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                    className={`absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-300 z-10 ${mediaMode === 'video' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  ></iframe>

                  <div className={`absolute inset-0 bg-zinc-900 flex items-center justify-center z-20 transition-opacity duration-300 ${mediaMode === 'audio' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                      {currentSong?.image && <img src={currentSong.image} className="w-full h-full object-cover opacity-60 blur-2xl absolute inset-0" alt="bg" />}
                      {currentSong?.image ? (
                        <img src={currentSong.image} className="w-full h-full object-cover shadow-2xl z-30" alt="cover" />
                      ) : (
                        <div className="w-full h-full shadow-2xl z-30 bg-white/5 flex items-center justify-center text-zinc-500 backdrop-blur-md">
                          <Music size={64} />
                        </div>
                      )}
                      
                      {isBuffering && mediaMode === 'audio' && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-40 rounded-2xl">
                              <Loader2 className="animate-spin text-white w-12 h-12 mb-2" />
                              <p className="text-sm font-bold text-white tracking-widest uppercase mt-2">Menyiapkan Audio...</p>
                          </div>
                      )}
                  </div>
                  
                  <div onClick={handleTogglePlayLocal} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 cursor-pointer">
                    {isPlaying ? <Pause fill="white" size={64} /> : <Play className="ml-2" fill="white" size={64} />}
                  </div>
               </div>
            </div>

            <div className="shrink-0 w-full max-w-3xl mx-auto flex flex-col gap-4 mt-6 md:hidden">
              <div className="flex justify-between items-end px-2">
                <div className="flex-1 pr-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-1">{displayTitle}</h1>
                  <p className="text-base md:text-xl text-zinc-400 line-clamp-1">{displayArtist}</p>
                </div>
                <div className="flex items-center gap-2 text-white pb-1">
                  <button onClick={toggleLike} className={`p-2 md:p-3 rounded-full hover:bg-white/10 transition-colors ${isLiked ? 'text-[#3ea6ff]' : 'text-white'}`}>
                    <Heart fill={isLiked ? "currentColor" : "none"} className="w-6 h-6 md:w-8 md:h-8" />
                  </button>
                </div>
              </div>

              <div className="relative flex items-center pt-2 px-2 h-6 cursor-pointer">
                <input 
                  type="range" min={0} max={duration || 100} value={currentTime} 
                  onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} 
                  onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} 
                  onChange={handleSeek} className="w-full h-full bg-transparent appearance-none cursor-pointer z-20 absolute inset-0 opacity-0" 
                />
                <div className="w-full h-1.5 bg-zinc-700 rounded-full pointer-events-none transition-all relative flex items-center">
                  <div className="h-full bg-white rounded-full pointer-events-none relative flex items-center justify-end" style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute -right-1.5 shadow-md z-10 transition-transform duration-200 ${isDragging ? 'scale-150' : 'scale-100'}`}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between text-xs md:text-sm text-zinc-400 font-medium -mt-1 px-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="flex items-center justify-between px-2 md:px-12 mt-2">
                <button onClick={() => setIsShuffle(!isShuffle)} className={`transition-all duration-300 p-2 md:p-3 rounded-full ${isShuffle ? 'bg-[#3ea6ff]/20 text-[#3ea6ff]' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}>
                  <Shuffle className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button onClick={handlePrevLocal} className="text-white hover:text-zinc-300 hover:bg-white/10 rounded-full transition-all p-2 md:p-3">
                  <SkipBack fill="currentColor" className="w-7 h-7 md:w-8 md:h-8" />
                </button>
                
                <button onClick={handleTogglePlayLocal} className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 hover:bg-zinc-200 transition-all shadow-xl">
                  {isPlaying ? <Pause fill="currentColor" className="w-6 h-6 md:w-8 md:h-8" /> : <Play className="ml-1 w-6 h-6 md:w-8 md:h-8" fill="currentColor" />}
                </button>
                
                <button onClick={handleNextLocal} className="text-white hover:text-zinc-300 hover:bg-white/10 rounded-full transition-all p-2 md:p-3">
                  <SkipForward fill="currentColor" className="w-7 h-7 md:w-8 md:h-8" />
                </button>
                <button onClick={toggleRepeat} className={`transition-all duration-300 p-2 md:p-3 rounded-full ${repeatMode !== 'off' ? 'bg-[#3ea6ff]/20 text-[#3ea6ff]' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}>
                  {repeatMode === 'one' ? <Repeat1 className="w-5 h-5 md:w-6 md:h-6" /> : <Repeat className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
              </div>
            </div>

          </div>

          <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 h-[70vh] md:h-full flex flex-col bg-transparent md:border-l border-white/10 mt-8 md:mt-0">
            <div className="flex justify-around items-center pt-4 px-4 border-b border-white/10 shrink-0">
              <button onClick={() => setActiveTab('upnext')} className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 tracking-wider ${activeTab === 'upnext' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                BERIKUTNYA
              </button>
              <button onClick={() => setActiveTab('lyrics')} className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 tracking-wider ${activeTab === 'lyrics' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                LIRIK
              </button>
              <button onClick={() => { setActiveTab('artist'); navigate(`/artist/${encodeURIComponent(displayArtist)}`); setIsExpanded(false); }} className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 tracking-wider text-zinc-500 border-transparent hover:text-zinc-300`}>
                TERKAIT
              </button>
            </div>

            <div className="flex-1 min-h-0 relative overflow-y-auto hide-scrollbar">
               
               {activeTab === 'artist' && (
                 <div className="flex flex-col px-6 py-6 animate-in fade-in duration-300">
                    <button 
                       onClick={() => { setIsExpanded(false); navigate(`/artist/${encodeURIComponent(displayArtist)}`); }} 
                       className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-white text-black font-bold mb-8 hover:scale-105 transition-transform shadow-lg"
                    >
                       <User size={20} /> Lihat Profil {displayArtist}
                    </button>
                    
                    <h3 className="text-lg font-bold text-white mb-4">Lagu dari {displayArtist}</h3>
                    
                    <div className="flex flex-col border-t border-white/5 pt-2">
                       {isLoadingRelated ? (
                          <div className="flex flex-col gap-2 animate-pulse mt-2">
                             {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="flex items-center gap-4 py-2 px-3 -mx-3 rounded-lg">
                                   <div className="w-12 h-12 bg-white/10 rounded flex-shrink-0"></div>
                                   <div className="flex-1 flex flex-col gap-2">
                                      <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                                      <div className="h-3 w-1/2 bg-white/5 rounded"></div>
                                   </div>
                                   <div className="w-1 h-5 bg-white/10 rounded"></div>
                                </div>
                             ))}
                          </div>
                       ) : relatedSongs.length > 0 ? (
                          relatedSongs.map((song, idx) => (
                            <div 
                               key={idx} 
                               className="flex items-center gap-4 py-2 px-3 -mx-3 rounded-lg cursor-pointer group hover:bg-white/5 transition-colors" 
                               onClick={(e) => handlePlayClick(e, song, relatedSongs, idx)}
                            >
                               <img src={song.image} className="w-12 h-12 rounded object-cover opacity-70 group-hover:opacity-100 shadow-md" alt="thumb" />
                               <div className="flex-1 min-w-0">
                                  <p className="text-base font-bold text-white line-clamp-1">{song.title}</p>
                                  <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                               </div>
                               <button onClick={(e) => {
                                  e.stopPropagation(); e.preventDefault();
                                  window.dispatchEvent(new CustomEvent('openSongMenu', { detail: { event: e, song: song } }));
                               }} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-opacity p-2">
                                  <MoreVertical size={20} />
                               </button>
                            </div>
                          ))
                       ) : (
                          <p className="text-zinc-500 text-sm italic mt-4">Belum ada lagu terkait yang ditemukan.</p>
                       )}
                    </div>
                 </div>
               )}

               {activeTab === 'upnext' && (
                 <div className="flex flex-col px-6 py-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-[12px] text-zinc-400 font-medium mb-1">Diputar dari</p>
                        <h3 className="text-xl font-bold text-white leading-none">Antrean Anda</h3>
                      </div>
                      <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-colors">
                        <ListPlus size={18} /> Simpan
                      </button>
                    </div>

                    <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
                      <button className="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap">Semua</button>
                      <button onClick={() => generateRadioMix(currentSong)} className="bg-white/5 hover:bg-white/10 text-zinc-200 px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors border border-white/10 flex items-center gap-1.5">
                        <Shuffle size={14} /> Mix Artis Ini
                      </button>
                      <button className="bg-white/5 hover:bg-white/10 text-zinc-200 px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors border border-white/10">Musik Populer</button>
                    </div>

                    <div className="flex flex-col border-t border-white/5 pt-2">
                      {queue && queue.length > 0 ? queue.map((qSong, idx) => {
                        const isCurrent = qSong.id === currentSong?.id;
                        return (
                        <div 
                          key={idx} 
                          ref={isCurrent ? activeQueueRef : null} 
                          className={`flex items-center gap-4 py-2 px-3 -mx-3 rounded-lg cursor-pointer group transition-colors ${isCurrent ? 'bg-white/10' : 'hover:bg-white/5'}`} 
                          onClick={(e) => !isCurrent && handlePlayClick(e, qSong, queue, idx)}
                        >
                          <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                            <img src={qSong.image} className={`w-full h-full rounded object-cover ${isCurrent ? '' : 'opacity-70 group-hover:opacity-100'}`} alt="thumb" />
                            <div className={`absolute inset-0 bg-black/50 rounded flex items-center justify-center ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                              {isCurrent && isPlaying ? <Pause fill="white" size={18} /> : <Play className="ml-0.5" fill="white" size={18} />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-base font-bold line-clamp-1 ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>{qSong.title}</p>
                            <p className="text-zinc-400 text-sm truncate mt-0.5">{qSong.artist}</p>
                          </div>
                          
                          <div className="flex items-center">
                              {isCurrent && (
                                <div className="flex gap-1 items-end h-4 mr-3">
                                  <div className={`eq-bar ${isPlaying ? 'eq-1' : 'h-1'}`}></div>
                                  <div className={`eq-bar ${isPlaying ? 'eq-2' : 'h-1'}`}></div>
                                  <div className={`eq-bar ${isPlaying ? 'eq-3' : 'h-1'}`}></div>
                                </div>
                              )}
                              <button onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.dispatchEvent(new CustomEvent('openSongMenu', { detail: { event: e, song: qSong } }));
                              }} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-opacity p-2">
                                  <MoreVertical size={20} />
                              </button>
                          </div>
                        </div>
                      )}) : (
                        <p className="text-zinc-400 text-center mt-10 text-sm italic">Tidak ada antrean.</p>
                      )}
                    </div>
                 </div>
               )}

               {activeTab === 'lyrics' && (
                 <div className="flex flex-col min-h-full animate-in fade-in duration-300">
                    {lyrics.length > 0 && !isLoadingLyrics && (
                      <div className="sticky top-0 z-20 bg-black/50 backdrop-blur-xl px-6 py-4 flex flex-col gap-4 border-b border-white/10 shadow-2xl">
                        <div className="flex justify-between items-center">
                          <div className="flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
                            <button onClick={() => setLyricsMode('synced')} className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all uppercase tracking-wider ${lyricsMode === 'synced' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>Running</button>
                            <button onClick={() => setLyricsMode('full')} className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all uppercase tracking-wider ${lyricsMode === 'full' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>Full Text</button>
                          </div>
                          {lyricsMode === 'synced' && (
                            <button onClick={() => setIsSyncMode(!isSyncMode)} className={`p-2 rounded-full border transition-all ${isSyncMode ? 'bg-red-500/90 border-red-400 animate-pulse text-white' : 'bg-white/5 backdrop-blur-md border-white/10 text-zinc-400 hover:text-white'}`} title="Mode Kalibrasi">
                              <Target size={16} />
                            </button>
                          )}
                        </div>
                        
                        {lyricsMode === 'synced' && (
                          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 md:py-2 rounded-full border border-white/10">
                            <span className="text-[10px] font-bold text-zinc-400 mr-1 hidden md:block">SYNC:</span>
                            
                            <button onClick={() => setLyricOffset(prev => Math.max(-100, prev - 0.5))} className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                              <Minus size={14} />
                            </button>
                            
                            <input type="range" min="-100" max="100" step="0.5" value={lyricOffset} onChange={(e) => setLyricOffset(parseFloat(e.target.value))} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
                            
                            <button onClick={() => setLyricOffset(prev => Math.min(100, prev + 0.5))} className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                              <Plus size={14} />
                            </button>
                            
                            <span className="text-xs font-mono text-zinc-300 w-12 text-right">
                              {lyricOffset > 0 ? `+${lyricOffset.toFixed(1)}` : lyricOffset.toFixed(1)}s
                            </span>
                          </div>
                        )}
                        
                      </div>
                    )}

                    {isLoadingLyrics ? (
                      <div className="flex-1 flex items-center justify-center text-zinc-400 font-medium">Mencari lirik...</div>
                    ) : lyrics.length > 0 ? (
                      lyricsMode === 'synced' ? (
                        <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto pb-[50vh] pt-[10vh] px-6 md:px-10 hide-scrollbar text-left md:text-center" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
                          {lyrics.map((line, index) => (
                            <div key={index} className={`text-xl md:text-3xl font-bold mb-6 md:mb-8 transition-all duration-300 cursor-pointer ${isSyncMode ? 'hover:text-[#3ea6ff] text-zinc-500' : index === activeLyricIndex ? 'text-white scale-105 drop-shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                              onClick={(e) => { e.stopPropagation(); if (isSyncMode) { setLyricOffset(currentTime - line.time); setIsSyncMode(false); } else { handleSeek({ target: { value: line.time + lyricOffset } }); } }}>
                              {line.text}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 overflow-y-auto pb-[20vh] pt-[4vh] px-8 text-left hide-scrollbar">
                          <div className="flex flex-col gap-4">
                            {lyrics.map((line, idx) => (
                              <p key={idx} className="text-base md:text-xl text-zinc-300 font-medium hover:text-white transition-colors">{line.text}</p>
                            ))}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 px-8 text-center pb-20 mt-20">
                        <Mic2 size={40} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-zinc-300 mb-2">Lirik Belum Tersedia</h3>
                        <p className="text-sm">Lirik lagu "{displayTitle}" belum terdaftar di database.</p>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </div>
          
        </div>
      </div>
      
      <style>{`
        html, body {
          background-color: #0f0f0f;
          overscroll-behavior-y: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; } 
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } 
        
        @keyframes eq {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .eq-bar {
          width: 3px;
          background-color: white;
          border-radius: 2px;
          transition: height 0.2s ease;
        }
        .eq-1 { animation: eq 0.9s ease-in-out infinite; }
        .eq-2 { animation: eq 0.9s ease-in-out infinite 0.3s; }
        .eq-3 { animation: eq 0.9s ease-in-out infinite 0.6s; }
      `}</style>
    </div>
  );
}