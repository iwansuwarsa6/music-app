import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowLeft, MoreVertical, Shuffle } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

// 🔥 KOMPONEN HORIZONTAL SLIDER + MESIN MOUSE DRAG 🔥
const HorizontalSection = ({ title, items, isVideoLayout, currentSong, isPlaying, togglePlay, playSong, openMenu }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const isDragMoved = useRef(false);

  // Fungsi saat mouse ditekan
  const onMouseDown = (e) => {
    setIsDragging(true);
    isDragMoved.current = false; // Reset status drag
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  // Fungsi saat mouse keluar dari area
  const onMouseLeave = () => {
    setIsDragging(false);
  };

  // Fungsi saat klik dilepas
  const onMouseUp = () => {
    setIsDragging(false);
  };

  // Fungsi saat mouse ditarik (Drag)
  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    isDragMoved.current = true; // Tandai kalau ini lagi di-drag, bukan diklik
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Angka 2 buat kecepatan scroll
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-12 select-none">
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">{title}</h2>
      <div 
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className={`flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} 
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((song, idx) => {
          const isCurrent = currentSong?.id === song.id;
          return (
            <div 
              key={idx} 
              className={`flex-shrink-0 group relative ${isVideoLayout ? 'w-[280px] md:w-[340px]' : 'w-36 md:w-48'}`}
              onClick={(e) => {
                // Cegah lagu keputar kalau niatnya cuma nge-drag/geser layar
                if (isDragMoved.current) return; 
                
                if (isCurrent) togglePlay();
                else playSong(song, items, idx);
              }}
            >
              <div className={`relative w-full ${isVideoLayout ? 'aspect-video' : 'aspect-square'} rounded-xl overflow-hidden shadow-lg mb-3 bg-zinc-800`}>
                <img 
                   src={song.image} 
                   draggable="false" // 🔥 Anti Ghost-Drag Image
                   className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-300" 
                   alt="cover" 
                />
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCurrent ? 'opacity-100 bg-black/50' : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'}`}>
                  <button className="w-12 h-12 flex items-center justify-center bg-black/60 hover:bg-black/80 hover:scale-105 text-white rounded-full backdrop-blur-sm transition-all shadow-xl">
                    {isPlaying && isCurrent ? <Pause fill="white" size={24} /> : <Play fill="white" size={24} className="ml-1" />}
                  </button>
                </div>
              </div>
              <div className="pr-6 relative">
                <p className="text-sm md:text-base font-bold text-white truncate group-hover:underline">{song.title}</p>
                <p className="text-[11px] md:text-xs text-zinc-400 truncate mt-0.5">
                  {isVideoLayout ? 'Video' : 'Single'} • {song.artist}
                </p>
                <button 
                  onClick={(e) => {
                     if (isDragMoved.current) return;
                     openMenu(e, song);
                  }} 
                  className="absolute right-0 top-0 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};


// 🔥 KOMPONEN UTAMA PROFIL ARTIS 🔥
export default function Artist() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  
  const [topTracks, setTopTracks] = useState([]);
  const [singles, setSingles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [livePerformances, setLivePerformances] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const API_BASE = "https://music-app-production-278c.up.railway.app";

  const fetchSection = async (query, limit = 10) => {
    try {
      const res = await fetch(`https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data?.data) {
        return data.data.filter(t => t.type === 'video').slice(0, limit).map(t => {
          const vid = t.id || t.videoId || (t.url ? t.url.split('v=')[1] : null);
          let cleanT = t.title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
          if (cleanT.includes('-')) cleanT = cleanT.split('-')[1];
          return {
            id: vid,
            title: cleanT.trim(),
            artist: name,
            image: t.thumbnail,
            url: `${API_BASE}/api/audio?id=${vid}`
          };
        }).filter(t => t.id);
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    Promise.all([
      fetchSection(`${name} official audio`, 5),
      fetchSection(`${name} single ep album`, 10),
      fetchSection(`${name} official music video`, 10),
      fetchSection(`${name} live performance`, 10),
      fetchSection(`${name} featured feat`, 10)
    ]).then(([top, eps, vids, lives, feats]) => {
      setTopTracks(top);
      setSingles(eps);
      setVideos(vids);
      setLivePerformances(lives);
      setFeatured(feats);
      setIsLoading(false);
    });
  }, [name]);

  const handlePlayAll = () => {
    if (topTracks.length > 0) playSong(topTracks[0], topTracks, 0);
  };

  const openMenu = (e, song) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('openSongMenu', { detail: { event: e, song: song } }));
  };

  return (
    <div className="pt-4 pb-32 px-4 md:px-12 animate-in fade-in duration-300 max-w-[1600px] mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors w-fit p-2 -ml-2 rounded-full hover:bg-white/10">
        <ArrowLeft size={24} /> <span className="font-bold hidden md:inline">Kembali</span>
      </button>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="flex flex-col items-center md:items-start md:flex-row gap-8 md:gap-12 mb-12">
            <div className="w-48 h-48 md:w-72 md:h-72 rounded-full bg-zinc-800 shadow-2xl flex-shrink-0"></div>
            <div className="flex flex-col items-center md:items-start justify-center mt-4 md:mt-12 w-full">
              <div className="h-12 w-64 md:w-96 bg-zinc-800 rounded-lg mb-6"></div>
              <div className="flex gap-4">
                <div className="h-12 w-32 bg-zinc-800 rounded-full"></div>
                <div className="h-12 w-32 bg-zinc-800 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="h-8 w-48 bg-zinc-800 rounded-lg mb-6"></div>
          <div className="flex flex-col gap-3 mb-12">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 py-2 px-3">
                <div className="w-6 h-6 bg-zinc-800 rounded"></div>
                <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0"></div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-4 w-1/3 bg-zinc-800 rounded"></div>
                  <div className="h-3 w-1/4 bg-zinc-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-8 w-48 bg-zinc-800 rounded-lg mb-6"></div>
          <div className="flex gap-4 overflow-hidden">
             {[1,2,3,4,5].map(i => (
                 <div key={i} className="w-36 md:w-48 flex-shrink-0">
                    <div className="w-full aspect-square bg-zinc-800 rounded-xl mb-3"></div>
                    <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-zinc-800 rounded"></div>
                 </div>
             ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center md:items-start md:flex-row gap-8 md:gap-12 mb-12">
            <div className="w-48 h-48 md:w-72 md:h-72 rounded-full overflow-hidden shadow-2xl flex-shrink-0 border-4 border-white/5 bg-zinc-900">
              <img src={topTracks[0]?.image || 'https://via.placeholder.com/300'} alt={name} className="w-full h-full object-cover animate-in zoom-in duration-500" />
            </div>
            <div className="flex flex-col items-center md:items-start justify-center mt-4 md:mt-12">
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight text-center md:text-left drop-shadow-lg">{name}</h1>
              <div className="flex items-center gap-4">
                <button onClick={handlePlayAll} className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-xl">
                  <Play fill="currentColor" size={20} className="ml-1" /> Putar
                </button>
                <button className="flex items-center gap-2 bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-md">
                  <Shuffle size={20} /> Acak
                </button>
              </div>
            </div>
          </div>

          {topTracks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Lagu</h2>
              <div className="flex flex-col pt-2">
                {topTracks.map((song, idx) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-4 py-2.5 px-3 md:px-4 -mx-3 md:-mx-4 rounded-lg cursor-pointer group transition-colors ${isCurrent ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      onClick={() => {
                        if (isCurrent) togglePlay();
                        else playSong(song, topTracks, idx);
                      }}
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
                  );
                })}
              </div>
            </div>
          )}

          {/* 🔥 PEMANGGILAN KOMPONEN SLIDER BARU 🔥 */}
          <HorizontalSection title="Singles & EPs" items={singles} isVideoLayout={false} currentSong={currentSong} isPlaying={isPlaying} togglePlay={togglePlay} playSong={playSong} openMenu={openMenu} />
          <HorizontalSection title="Videos" items={videos} isVideoLayout={true} currentSong={currentSong} isPlaying={isPlaying} togglePlay={togglePlay} playSong={playSong} openMenu={openMenu} />
          <HorizontalSection title="Live Performances" items={livePerformances} isVideoLayout={true} currentSong={currentSong} isPlaying={isPlaying} togglePlay={togglePlay} playSong={playSong} openMenu={openMenu} />
          <HorizontalSection title="Menampilkan" items={featured} isVideoLayout={false} currentSong={currentSong} isPlaying={isPlaying} togglePlay={togglePlay} playSong={playSong} openMenu={openMenu} />
          
        </>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}