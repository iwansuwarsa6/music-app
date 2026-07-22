import { useState, useEffect } from 'react';
import { Play, Pause, MoreVertical, Heart, Download, TrendingUp, ArrowLeft, Shuffle, Disc3, Mic2, Users, Import, X, Loader2, ListPlus, Link as LinkIcon, Search } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export default function Library() {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  
  const [activeTab, setActiveTab] = useState('Daftar putar');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); 

  const [likedSongs, setLikedSongs] = useState([]);
  const [historySongs, setHistorySongs] = useState([]);

  // 🔥 STATE UNTUK FITUR IMPORT LINK 🔥
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const [toastMsg, setToastMsg] = useState("");

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
    };
    
    loadData();
    
    window.addEventListener('likedSongsUpdated', loadData);
    window.addEventListener('historyUpdated', loadData);
    
    return () => {
      window.removeEventListener('likedSongsUpdated', loadData);
      window.removeEventListener('historyUpdated', loadData);
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
        title: 'Diunduh', 
        desc: '0 lagu', 
        icon: <Download size={28} className="text-white" />, 
        data: [] 
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
      togglePlay();
      window.dispatchEvent(new CustomEvent('openFullScreenPlayer'));
      return;
    }
    playSong({ ...song, url: `${API_BASE}/api/audio?id=${song.id}` }, list, index);
    window.dispatchEvent(new CustomEvent('openFullScreenPlayer'));
  };

  const openMenu = (e, song) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('openSongMenu', { detail: { event: e, song: song } }));
  };

  // ===========================================================================
  // 🔥 ALGORITMA SCRAPING LINK SPOTIFY & YOUTUBE (PROXY ANTI-CORS V3) 🔥
  // ===========================================================================
  const handleImportLink = async (e) => {
    e.preventDefault();
    let url = importUrl.trim();
    if (!url) return;

    setIsImporting(true);
    setImportProgress("Menganalisa link...");

    try {
        const isSpotify = url.includes('spotify.com');
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

        if (!isSpotify && !isYouTube) {
            showToast("❌ Web ini hanya mendukung link Playlist Spotify & YouTube!");
            setIsImporting(false);
            return;
        }

        // Paksa ganti link YT Music ke YT Biasa
        if (isYouTube && url.includes('music.youtube.com')) {
            url = url.replace('music.youtube.com', 'www.youtube.com');
        }

        setImportProgress("Membongkar brankas server...");
        
        let html = "";
        try {
            // 🔥 PROXY 1: AllOrigins mode JSON (Paling kuat nahan blokiran CORS Vercel)
            const proxy1 = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const res1 = await fetch(proxy1);
            const data1 = await res1.json();
            html = data1.contents;
            
            if (!html || html.includes('consent.youtube.com') || html.includes('Our systems have detected unusual traffic')) {
                throw new Error('Terdeteksi Google/CORS block');
            }
        } catch (err1) {
            console.warn("Proxy 1 gagal, mencoba Proxy 2...");
            try {
                // 🔥 PROXY 2: CorsProxy.io (Alternatif)
                const proxy2 = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                const res2 = await fetch(proxy2);
                html = await res2.text();
            } catch (err2) {
                throw new Error("Semua proxy diblokir server.");
            }
        }

        if (!html || html.length < 500) throw new Error("Data HTML Kosong");

        setImportProgress("Menyaring daftar lagu...");
        let extractedTitles = [];

        if (isSpotify) {
            const titleMatches = html.match(/"name":"([^"]+)","type":"track"/g);
            if (titleMatches) {
                extractedTitles = titleMatches.map(t => t.split('":"')[1].split('","')[0]);
            }
            if (extractedTitles.length === 0) {
                const match = html.match(/<meta property="og:description" content="([^"]+)"/) || html.match(/<meta name="description" content="([^"]+)"/);
                if (match && match[1]) {
                    const desc = match[1].replace(/·/g, '').replace(/Playlist/gi, '').replace(/[0-9]+ songs/gi, '');
                    extractedTitles = desc.split(',').map(s => s.trim()).filter(s => s.length > 3);
                }
            }
        } else if (isYouTube) {
            const titleMatches = html.match(/{"title":{"runs":\[{"text":"(.*?)"}\]/g);
            if (titleMatches) {
                extractedTitles = titleMatches.map(t => {
                    const m = t.match(/"text":"(.*?)"/);
                    return m ? m[1] : null;
                }).filter(t => t && t !== "Hapus" && t !== "Simpan" && !t.includes("Playlist") && t !== "Private video" && t !== "Deleted video");
            }
            
            if (extractedTitles.length === 0) {
                const videoTitleMatches = html.match(/"title":"(.*?)"/g);
                if (videoTitleMatches) {
                    extractedTitles = videoTitleMatches.map(t => t.replace(/"title":"/, '').replace(/"$/, '')).filter(t => t.length > 3 && !t.includes("YouTube"));
                }
            }
        }

        extractedTitles = [...new Set(extractedTitles)].slice(0, 15);

        if (extractedTitles.length === 0) {
            showToast("❌ Playlist Private, atau Google ngacak struktur webnya.");
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
            } catch (e) {
                console.error("Gagal nyari lagu:", extractedTitles[i]);
            }
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        if (newTracks.length > 0) {
            const currentQueue = usePlayerStore.getState().queue || [];
            usePlayerStore.setState({ queue: [...currentQueue, ...newTracks] });
            showToast(`✅ Berhasil menarik ${successCount} lagu dari Link! Cek Antrean lu Bang.`);
            setShowImportModal(false);
            setImportUrl("");
        } else {
            showToast("❌ Gagal mencocokkan audio dari playlist tersebut.");
        }

    } catch (error) {
        showToast("❌ Proxy diblokir oleh CORS. Coba pakai fitur Import Teks!");
    } finally {
        setIsImporting(false);
    }
  };

  if (selectedPlaylist) {
    const pl = playlists.find(p => p.id === selectedPlaylist);
    return (
      <div className="pt-4 pb-24 px-4 md:px-8 animate-in fade-in slide-in-from-right-4 duration-300">
        
        <button onClick={() => setSelectedPlaylist(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors p-2 -ml-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={24} /> <span className="font-bold hidden md:inline">Kembali</span>
        </button>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-8 items-center md:items-start">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-zinc-800 rounded-xl flex items-center justify-center shadow-2xl flex-shrink-0">
            {pl.icon}
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left mt-4 md:mt-10">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">{pl.title}</h1>
            <p className="text-zinc-400 text-sm md:text-base font-medium mb-8">{pl.desc} • Dibuat untuk Anda</p>
            
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
            <div className="text-zinc-500 text-center py-20 font-medium">Belum ada lagu di daftar putar ini.</div>
          )}
        </div>
      </div>
    )
  }

  // 🔥 TAMPILAN AWAL PUSTAKA 🔥
  return (
    <div className="pt-4 pb-20 px-4 md:px-8 animate-in fade-in duration-300 max-w-5xl mx-auto relative">
      
      {/* Pills Kategori */}
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

      <div className="flex items-center justify-between mt-6 mb-4">
        <div className="text-sm font-bold text-zinc-400 tracking-wide">
          Tanggal ditambahkan ↓
        </div>
        
        {/* 🔥 TOMBOL IMPORT DITAMBAHKAN DI SINI 🔥 */}
        <button 
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors border border-white/10"
        >
          <Import size={14} /> Import Link
        </button>
      </div>

      {/* 🔥 KONTEN DINAMIS BERDASARKAN TAB YANG DIPILIH 🔥 */}
      
      {activeTab === 'Daftar putar' && (
        <div className="flex flex-col gap-2 animate-in fade-in duration-300">
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
      
      {/* 🔥 MODAL IMPORT PLAYLIST MENGGUNAKAN LINK 🔥 */}
      {showImportModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#181818] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LinkIcon className="text-[#3ea6ff]" />
                Tarik Playlist via Link
              </h2>
              <button onClick={() => !isImporting && setShowImportModal(false)} className="text-zinc-400 hover:text-white transition-colors bg-black/20 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                Nggak usah repot ngetik! Cukup *Paste* link (URL) dari Playlist <b>Spotify</b> atau <b>YouTube</b> favorit lu ke sini. Sisanya biar sistem yang kerja narik lagu-lagunya buat lu!
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
                  <button 
                    type="submit"
                    disabled={!importUrl.trim()}
                    className="absolute inset-y-2 right-2 bg-[#3ea6ff] hover:bg-blue-500 text-black font-bold px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    Tarik!
                  </button>
                )}
              </form>

              {isImporting && (
                <div className="flex flex-col items-center justify-center p-4 bg-[#3ea6ff]/10 rounded-xl border border-[#3ea6ff]/20">
                  <Loader2 className="animate-spin text-[#3ea6ff] mb-2" size={32} />
                  <p className="text-sm font-bold text-white text-center">{importProgress}</p>
                  <p className="text-xs text-zinc-400 mt-1 text-center">Jangan tutup jendela ini ya Bang...</p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* TOAST KHUSUS LIBRARY */}
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