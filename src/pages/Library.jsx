import { useState, useEffect } from 'react';
import { Play, Pause, MoreVertical, Heart, Download, TrendingUp, ArrowLeft, Shuffle, Disc3, Mic2, Users } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export default function Library() {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  
  const [activeTab, setActiveTab] = useState('Daftar putar');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null); 

  const [likedSongs, setLikedSongs] = useState([]);
  const [historySongs, setHistorySongs] = useState([]);

  // 🔥 URL SUDAH DIGANTI KE RAILWAY 🔥
  const API_BASE = "https://music-app-production-278c.up.railway.app";

  const tabs = ['Daftar putar', 'Lagu', 'Album', 'Artis', 'Podcasts'];

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
  };

  const handlePlaySong = (song, list, index) => {
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }
    playSong({ ...song, url: `${API_BASE}/api/audio?id=${song.id}` }, list, index);
  };

  const openMenu = (e, song) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('openSongMenu', { detail: { event: e, song: song } }));
  };

  // 🔥 TAMPILAN JIKA PLAYLIST DIKLIK (DETAIL PLAYLIST) 🔥
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
    <div className="pt-4 pb-20 px-4 md:px-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      
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

      <div className="mt-6 mb-4 text-sm font-bold text-zinc-400 tracking-wide">
        Tanggal ditambahkan ↓
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
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}