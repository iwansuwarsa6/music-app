import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Play, Pause, Music, History, Trash2, X, Loader2, MoreVertical } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();

  // 🔥 STATE TAMBAHAN UNTUK LIVE SUGGESTION 🔥
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const [textSuggestions, setTextSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('ytm_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  // 🔥 URL SUDAH DIGANTI KE RAILWAY 🔥
  const API_BASE = "https://music-app-production-278c.up.railway.app";

  const jalankanPencarian = async (kataKunci) => {
    if (kataKunci.trim().length < 2) return;
    
    setIsLoading(true);
    try {
      const queryPintar = encodeURIComponent(kataKunci.trim() + " official audio");
      const response = await fetch(`https://api.siputzx.my.id/api/s/youtube?query=${queryPintar}`);
      const resData = await response.json();
      
      if (resData.status && resData.data) {
        let formattedResults = resData.data
          .filter(item => item.type === 'video')
          .map(track => {
            const validId = track.id || track.videoId || (track.url ? track.url.split('v=')[1] : null);
            return {
              id: validId,
              title: track.title,
              artist: track.author?.name || 'YouTube',
              image: track.thumbnail
            };
          })
          .filter(track => track.id != null);
          
        formattedResults.sort((a, b) => {
          const judulA = a.title.toLowerCase();
          const judulB = b.title.toLowerCase();
          const hitungSkor = (judul) => {
            let skor = 0;
            if (judul.includes('audio')) skor += 3;
            if (judul.includes('lyric') || judul.includes('lirik')) skor += 2;
            if (judul.includes('official video') || judul.includes('music video') || judul.includes('mv')) skor -= 3;
            if (judul.includes('live') || judul.includes('performance')) skor -= 2;
            return skor;
          };
          return hitungSkor(judulB) - hitungSkor(judulA);
        });

        setResults(formattedResults.slice(0, 15));
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 EFEK NGETIK LIVE SUGGESTION (KAYAK DI APP.JSX) 🔥
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsFetchingSuggestions(true);
        try {
          const queryPintar = encodeURIComponent(query.trim());
          const response = await fetch(`https://api.siputzx.my.id/api/s/youtube?query=${queryPintar}`);
          const resData = await response.json();
          if (resData.status && resData.data) {
            let formattedResults = resData.data
              .filter(item => item.type === 'video')
              .map(track => {
                const validId = track.id || track.videoId || (track.url ? track.url.split('v=')[1] : null);
                return { id: validId, title: track.title, artist: track.author?.name || 'YouTube', image: track.thumbnail };
              }).filter(track => track.id != null);

            const qLower = query.trim().toLowerCase();
            const uniqueTexts = new Set();
            formattedResults.forEach(track => {
              let cleanT = track.title.toLowerCase().replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/(official|music video|lyrics?|audio|hd|hq)/gi, '').replace(/[^a-z0-9\s-]/gi, '').trim();
              let cleanA = track.artist.toLowerCase();
              if (cleanT.length > 2) uniqueTexts.add(cleanT);
              if (cleanT && cleanA) uniqueTexts.add(`${cleanT} ${cleanA}`);
            });

            const finalTexts = [qLower, ...Array.from(uniqueTexts).filter(t => t !== qLower)].slice(0, 6);
            setTextSuggestions(finalTexts);
            setLiveSuggestions(formattedResults.slice(0, 4)); 
          } else { setLiveSuggestions([]); setTextSuggestions([]); }
        } catch (error) { setLiveSuggestions([]); setTextSuggestions([]); } finally { setIsFetchingSuggestions(false); }
      } else { setLiveSuggestions([]); setTextSuggestions([]); }
    }, 500); 
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      jalankanPencarian(q); 
    } else {
      setResults([]);
    }
  }, [location.search]);

  const executeSearch = (qStr) => {
    const q = qStr.trim();
    if (!q) return;
    setQuery(q); 
    const newHistory = [q, ...searchHistory.filter(item => item !== q)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('ytm_search_history', JSON.stringify(newHistory));
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setShowSearchHistory(false);
  };

  const handleLocalSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
    if (document.activeElement) document.activeElement.blur(); 
  };

  const removeSearchHistory = (itemToRemove) => {
    const newHistory = searchHistory.filter(item => item !== itemToRemove);
    setSearchHistory(newHistory);
    localStorage.setItem('ytm_search_history', JSON.stringify(newHistory));
  };

  const handlePlayClick = (song, index, fromSuggestion = false) => {
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }
    // Jika play dari live suggestion, kita buang dia jadi antrean tunggal dulu
    playSong({
      ...song,
      url: `${API_BASE}/api/audio?id=${song.id}` 
    }, fromSuggestion ? [song] : results, fromSuggestion ? 0 : index); 
  };

  return (
    <div className="p-4 pt-8 md:px-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mencari</h1>
      
      {/* 🔥 RELATIVE CONTAINER UNTUK SUGGESTION 🔥 */}
      <div className="relative mb-6">
        <form onSubmit={handleLocalSearchSubmit} className={`bg-zinc-800/80 flex items-center px-4 py-3 gap-3 border transition-all ${showSearchHistory ? 'border-zinc-500 rounded-t-xl' : 'border-zinc-700 rounded-full'} focus-within:border-white`}>
          <SearchIcon size={20} className="text-zinc-400 shrink-0" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSearchHistory(true)}
            onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
            placeholder="Cari lagu apa saja..." 
            className="bg-transparent w-full outline-none text-white placeholder-zinc-400 text-sm md:text-base"
          />
          {query && (
            <button 
              type="button" 
              onClick={() => { setQuery(''); document.activeElement.focus(); }} 
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
          <button type="submit" className="hidden">Search</button>
        </form>

        {/* 🔥 DROPDOWN HISTORY & LIVE SUGGESTION 🔥 */}
        {showSearchHistory && (
          <div className="absolute top-full left-0 right-0 bg-[#181818]/95 backdrop-blur-2xl border-x border-b border-zinc-700 rounded-b-xl shadow-2xl py-2 z-50 overflow-hidden flex flex-col max-h-[60vh]">
            {query.trim() === '' && searchHistory.length > 0 && searchHistory.map((item, idx) => (
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

            {query.trim() !== '' && (
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
                          setQuery(song.title); 
                          handlePlayClick(song, idx, true);
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

      <div className="flex flex-col gap-2">
        {/* 🔥 EFEK LOADING SKELETON ALA SHOPEE 🔥 */}
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="flex items-center gap-4 p-2 md:p-3 rounded-xl w-full">
                <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="flex-1 min-w-0 flex flex-col gap-3 justify-center">
                  <div className="h-4 bg-white/10 rounded-md animate-pulse w-3/4 md:w-1/2"></div>
                  <div className="h-3 bg-white/10 rounded-md animate-pulse w-1/2 md:w-1/4"></div>
                </div>
              </div>
            ))}
          </>
        ) : results.length > 0 ? (
          results.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div 
                key={song.id}
                onClick={() => handlePlayClick(song, index)}
                className={`flex items-center gap-4 p-2 md:p-3 rounded-xl cursor-pointer transition-colors group ${isCurrent ? 'bg-white/10' : 'hover:bg-zinc-800/50'}`}
              >
                <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                  <img src={song.image} alt={song.title} className="w-full h-full object-cover rounded-lg" />
                  <div className={`absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {isPlaying && isCurrent ? <Pause fill="white" size={24} /> : <Play className="ml-1" fill="white" size={24} />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-base md:text-lg font-medium truncate ${isCurrent ? 'text-white font-bold' : 'text-zinc-200'}`}>{song.title}</div>
                  <div className="text-sm md:text-base text-zinc-400 truncate mt-0.5">{song.artist}</div>
                </div>
                <button onClick={(e) => {
                   e.stopPropagation(); e.preventDefault();
                   window.dispatchEvent(new CustomEvent('openSongMenu', { detail: { event: e, song: song } }));
                }} className="p-2 text-zinc-400 hover:text-white opacity-0 md:group-hover:opacity-100 transition-opacity">
                   <MoreVertical size={20} />
                </button>
              </div>
            );
          })
        ) : (
          !query && !isLoading && (
            <div className="text-center py-20 text-zinc-500">
               <Music size={48} className="mx-auto mb-4 opacity-20" />
               <p className="text-lg">Ketikkan judul lagu atau artis di atas...</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}