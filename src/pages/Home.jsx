import { useState, useEffect } from 'react';
import { Play, Pause, ChevronRight, MoreVertical, ArrowLeft } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import rndLogo from '../store/rndigital.jpg';

export default function Home() {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const [homeSections, setHomeSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [playHistory, setPlayHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = [
    'Chill', 'Focus', 'Commute', 'Gaming', 'Energize', 'Party', 
    'Feel good', 'Romance', 'Workout', 'Sleep', 'Sad', 'Happy', 
    'Nostalgia', 'Acoustic', 'Pop', 'Rock'
  ];

  const handleOpenMenu = (e, song) => {
    e.preventDefault();
    e.stopPropagation(); 
    window.dispatchEvent(new CustomEvent('openSongMenu', { detail: { event: e, song: song } }));
  };

  useEffect(() => {
    const updateHistory = () => {
        try {
            const hist = JSON.parse(localStorage.getItem('ytm_play_history') || '[]');
            setPlayHistory(hist);
        } catch(e) {
            console.error("Gagal narik history", e);
        }
    };
    updateHistory();
    window.addEventListener('historyUpdated', updateHistory);
    return () => window.removeEventListener('historyUpdated', updateHistory);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      const cacheKey = `ytm_home_cache_v6_${activeCategory || 'default'}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      // 🔥 JURUS LOADING 0 DETIK (STALE-WHILE-REVALIDATE) 🔥
      if (cachedData) {
        setHomeSections(JSON.parse(cachedData));
        setIsLoading(false); // Skeleton mati, lagu langsung muncul!
        // Sengaja nggak dikasih "return;" biar dia lanjut nyari lagu baru di bawah
      } else {
        setIsLoading(true); // Kalau baru pertama kali buka (cache kosong), baru nyalain skeleton
        setHomeSections([]); 
      }

      let userDNA = JSON.parse(localStorage.getItem('ytm_vibe_dna') || '[]');
      userDNA = userDNA.filter(name => name.length < 20 && !name.toLowerCase().includes('zaini') && !name.toLowerCase().includes('cover'));

      const indoPop = ["Mahalini", "Bernadya", "Hindia", "Tiara Andini", "Sal Priadi", "Kunto Aji", "Nadin Amizah", "Pamungkas", "Yura Yunita", "Maliq & D'Essentials", "Feby Putri", "Juicy Luicy", "Rizky Febian", "Tulus", "Lyodra", "Ziva Magnolya", "Keisya Levronka"];
      const westPop = ["Taylor Swift", "The Weeknd", "Bruno Mars", "Ariana Grande", "Justin Bieber", "Post Malone", "Dua Lipa", "Coldplay", "Ed Sheeran", "Burna Boy", "Sabrina Carpenter", "Billie Eilish", "Shawn Mendes"];

      let targetArtists = [];
      
      if (activeCategory) {
          targetArtists = [`${activeCategory} pop`, `${activeCategory} hits`, `${activeCategory} acoustic`, `${activeCategory} vibes`, `${activeCategory} chill`, `${activeCategory} popular`];
      } else {
          targetArtists = [
              userDNA[0] || indoPop[Math.floor(Math.random() * indoPop.length)],
              userDNA[1] || westPop[Math.floor(Math.random() * westPop.length)],
              userDNA[2] || indoPop[Math.floor(Math.random() * indoPop.length)],
              userDNA[3] || westPop[Math.floor(Math.random() * westPop.length)],
              indoPop[Math.floor(Math.random() * indoPop.length)],
              westPop[Math.floor(Math.random() * westPop.length)],
              indoPop[Math.floor(Math.random() * indoPop.length)],
              westPop[Math.floor(Math.random() * westPop.length)]
          ];
          targetArtists = [...new Set(targetArtists)].slice(0, 8);
      }

      try {
        const promises = targetArtists.map(artist => 
            fetch(`https://api.siputzx.my.id/api/s/youtube?query=${encodeURIComponent(artist + " official music video")}`)
            .then(res => res.json())
            .then(data => ({ reqArtist: artist, ...data })) 
        );
        
        const datasets = await Promise.all(promises);

        let allRawTracks = [];
        datasets.forEach(d => {
            if (d.status && d.data) {
                const mappedData = d.data.map(t => ({ ...t, requestedArtist: d.reqArtist }));
                allRawTracks = [...allRawTracks, ...mappedData];
            }
        });

        const blacklistTitle = ['full album', 'album', 'compilation', 'collection', 'greatest hits', 'best of', 'mix', '1 hour', 'jam', 'menit', 'minutes', 'mashup', 'karaoke', 'instrumental', 'live', 'playlist', 'top hits', 'terbaru', 'viral', 'kompilasi', 'billboard', 'top 50', 'top 100', 'tiktok', 'galaau', 'galau', 'first vid', 'vlog', 'capcut', 'status', 'wa', 'jedag jedug', 'remix', 'dj'];
        const blacklistAuthor = ['fm', 'radio', 'muzik', 'records', 'studio', 'channel', 'tv', 'music', 'hits', 'populer', 'lyric', 'lirik', 'vibes', 'indonesia', 'playlist', 'yamaha', 'entertainment', 'production'];

        let cleanTracks = [];
        let usedIds = new Set();
        let usedTitles = new Set(); 

        allRawTracks.forEach(t => {
            if (t.type !== 'video') return;
            
            const titleLow = t.title.toLowerCase();
            const authorLow = (t.author?.name || '').toLowerCase();
            const validId = t.id || t.videoId || (t.url ? t.url.split('v=')[1] : null);

            if (!validId || usedIds.has(validId)) return;
            if (blacklistTitle.some(w => titleLow.includes(w))) return;
            if (blacklistAuthor.some(w => authorLow.includes(w))) return;
            if ((titleLow.match(/,/g) || []).length >= 2) return;
            if (titleLow.match(/202[0-9]/)) return;

            let cleanTitle = t.title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
            if (cleanTitle.includes('-')) cleanTitle = cleanTitle.split('-')[1];
            cleanTitle = cleanTitle.trim();

            let titleCheck = cleanTitle.toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/(official|lyric|audio|video|music)/gi, '').trim();
            if (titleCheck.length > 3) {
                let isDup = Array.from(usedTitles).some(seen => seen.includes(titleCheck) || titleCheck.includes(seen));
                if (isDup) return; 
                usedTitles.add(titleCheck);
            }

            let cleanDisplayArtist = t.requestedArtist || (t.title.includes('-') ? t.title.split('-')[0] : t.author?.name);
            cleanDisplayArtist = cleanDisplayArtist.replace(/vevo|official|topic|music|lyric|video/gi, '').replace(/\([^)]*\)/g, '').trim();
            cleanDisplayArtist = cleanDisplayArtist.replace(/\b\w/g, l => l.toUpperCase());

            let coreArtist = cleanDisplayArtist.split(/,| x | ft\.? | feat\.? |&/i)[0].trim().toLowerCase();
            coreArtist = coreArtist.replace(/\s+/g, ' '); 

            cleanTracks.push({
                id: validId,
                title: cleanTitle,
                artist: cleanDisplayArtist,
                coreArtist: coreArtist, 
                image: t.thumbnail
            });
            usedIds.add(validId);
        });

        cleanTracks = cleanTracks.sort(() => 0.5 - Math.random());

        const getTracks = (count, requireUniqueArtist = false) => {
            if (requireUniqueArtist) {
                let unique = [];
                let seenArtists = new Set();
                for (let i = 0; i < cleanTracks.length; i++) {
                    if (!seenArtists.has(cleanTracks[i].coreArtist)) { 
                        unique.push(cleanTracks[i]);
                        seenArtists.add(cleanTracks[i].coreArtist);
                    }
                    if (unique.length >= count) break;
                }
                return unique;
            }
            return cleanTracks.splice(0, count);
        };

        const structure = [
            { type: 'hero', title: '', count: 6 },
            { type: 'grid', title: 'Speed dial', count: 9 },
            { type: 'grid', title: 'Pilihan cepat', count: 9 },
            { type: 'circle', title: 'Tetap mendengarkan', count: 10, uniqueArtist: true }, 
            { type: 'square', title: 'Trending Now', count: 10 },
            { type: 'square', title: 'New Releases', count: 10 }
        ];

        const backupPool = [...cleanTracks];
        const sections = [];

        for (const s of structure) {
            let trks = getTracks(s.count, s.uniqueArtist);
            if (trks.length < s.count) {
                const remainder = s.count - trks.length;
                trks = [...trks, ...[...backupPool].sort(() => 0.5 - Math.random()).slice(0, remainder)];
            }
            sections.push({ title: s.title, type: s.type, tracks: trks });
        }

        setHomeSections(sections);
        
        // 🔥 UPDATE DATA CACHE DI BACKGROUND BIAR FRESH TERUS 🔥
        if (isMounted) {
            localStorage.setItem(cacheKey, JSON.stringify(sections));
        }

      } catch (error) {
          console.error("Gagal load data home", error);
      } finally {
          setIsLoading(false);
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false; 
    };
  }, [activeCategory]); 

  // 🔥 ALGORITMA INSTAN MIX RADIO (CAMPURAN BIAR GAK BOSEN) 🔥
  const handlePlay = (song, sectionTracks, index) => {
    if (currentSong?.id === song.id) {
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => {
        if (audio.src && audio.src.includes(song.id)) {
          if (isPlaying) audio.pause();
          else audio.play().catch(()=>{});
        }
      });

      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ 
          event: 'command', func: isPlaying ? 'pauseVideo' : 'playVideo', args: [] 
        }), '*');
      }
      togglePlay();
      window.dispatchEvent(new CustomEvent('openFullScreenPlayer')); 
      return;
    }
    
    let cleanArtist = (song.artist || '').toLowerCase();

    // 1. Kumpulin SEMUA lagu yang ada di Beranda
    let allHomeTracks = [];
    homeSections.forEach(sec => {
        if (sec.tracks) allHomeTracks = [...allHomeTracks, ...sec.tracks];
    });

    // 2. Ambil MAKSIMAL 3 LAGU dari artis yang sama
    let sameArtistTracks = allHomeTracks.filter(t => 
        t.id !== song.id && (t.artist || '').toLowerCase().includes(cleanArtist)
    ).slice(0, 3);

    // 3. Ambil lagu dari ARTIS LAIN buat campurannya
    let otherTracks = allHomeTracks.filter(t => 
        t.id !== song.id && !(t.artist || '').toLowerCase().includes(cleanArtist)
    );

    // 4. GABUNGIN & ACAK (Shuffle) biar posisinya natural kayak Radio
    let mixedTracks = [...sameArtistTracks, ...otherTracks].sort(() => 0.5 - Math.random());

    let uniqueRelated = [];
    let baseTitleCheck = song.title.toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/(official|lyric|audio|video|music)/gi, '').trim();
    let seenTitles = new Set([baseTitleCheck]);

    // 5. Radar Anti-Kembar (biar nggak ada judul lagu yang sama persis)
    mixedTracks.forEach(t => {
        let tTitle = t.title.toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/(official|lyric|audio|video|music)/gi, '').trim();
        let isDup = false;
        
        seenTitles.forEach(seen => {
            if ((seen.includes(tTitle) || tTitle.includes(seen)) && tTitle.length > 3) isDup = true;
        });
        
        if (!isDup && !uniqueRelated.some(u => u.id === t.id)) {
            uniqueRelated.push(t);
            seenTitles.add(tTitle);
        }
    });
    
    // 6. Ambil 20 lagu untuk antrean
    uniqueRelated = uniqueRelated.slice(0, 20);
    let newQueue = [song, ...uniqueRelated];

    if (newQueue.length < 5) {
        const fallback = sectionTracks.filter(s => s.id !== song.id && !newQueue.some(q => q.id === s.id));
        newQueue = [...newQueue, ...fallback].slice(0, 20);
    }

    playSong({
      ...song,
      url: `https://music-app-production-278c.up.railway.app/api/audio?id=${song.id}` 
    }, newQueue, 0);

    window.dispatchEvent(new CustomEvent('openFullScreenPlayer')); 
  };

  const handlePlayAll = (e, sectionTracks) => {
    e.stopPropagation();
    if (sectionTracks && sectionTracks.length > 0) {
      handlePlay(sectionTracks[0], sectionTracks, 0);
      window.dispatchEvent(new CustomEvent('openFullScreenPlayer')); 
    }
  };

  return (
    <div className="pt-4 pb-10 pl-4 md:pl-8">
      
      <div className="md:hidden flex items-center gap-2 mb-3 pr-4 pt-2">
        <img src={rndLogo} alt="rndmusic logo" className="w-8 h-8 rounded-full object-cover" />
        <span className="text-2xl font-bold tracking-tighter text-white">RnCmusic</span>
      </div>

      <div className="flex items-center overflow-x-auto gap-3 pb-4 pr-4 hide-scrollbar sticky top-0 bg-[#0f0f0f] z-30 pt-2">
        {activeCategory ? (
          <>
            <button 
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-black text-sm font-bold rounded-lg whitespace-nowrap hover:scale-105 transition-transform flex-shrink-0 shadow-md"
            >
              <ArrowLeft size={18} /> Kembali
            </button>
            <div className="px-4 py-1.5 text-sm font-bold rounded-lg whitespace-nowrap bg-zinc-800/80 text-white flex-shrink-0 border border-white/10">
              Playlist: {activeCategory}
            </div>
          </>
        ) : (
          categories.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveCategory(cat)} 
              className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0 bg-zinc-800/80 hover:bg-zinc-700 text-white`}
            >
              {cat}
            </button>
          ))
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-10 mt-4 pr-4 md:pr-8 animate-pulse overflow-hidden">
          <div>
            <div className="flex gap-4 overflow-hidden">
              {[1, 2].map(i => (
                <div key={i} className="w-[300px] md:w-[400px] aspect-[16/9] bg-white/5 rounded-xl flex-shrink-0"></div>
              ))}
            </div>
          </div>
          <div>
            <div className="h-6 w-48 bg-white/10 rounded-md mb-5"></div>
            <div className="grid grid-rows-4 grid-flow-col gap-x-4 gap-y-3 overflow-hidden">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="w-[280px] md:w-[340px] flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded flex-shrink-0"></div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                    <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10 mt-4 pr-4 md:pr-8">
          {homeSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              
              {section.title && (
                <div className="flex items-center justify-between mb-4 group">
                  <h2 className="text-2xl font-bold text-white cursor-pointer group-hover:underline">
                    {section.title}
                  </h2>
                  <div 
                    onClick={(e) => handlePlayAll(e, section.tracks)}
                    className="flex items-center text-sm font-semibold text-zinc-400 hover:text-white cursor-pointer transition-colors"
                  >
                    <span className="hidden md:inline">Putar semua</span>
                    <ChevronRight size={20} />
                  </div>
                </div>
              )}

              {section.type === 'hero' && (
                <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
                  {section.tracks.map((song, idx) => (
                    <div 
                      key={song.id} 
                      onClick={() => handlePlay(song, section.tracks, idx)}
                      className="w-[300px] md:w-[400px] flex-shrink-0 snap-start cursor-pointer group"
                    >
                      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg border border-transparent transition-colors">
                        <img src={song.image} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40"></div>
                        
                        <div className="absolute top-4 left-4 right-4">
                          <h3 className={`text-2xl md:text-3xl font-bold mb-1 drop-shadow-md line-clamp-2 ${currentSong?.id === song.id ? 'text-[#3ea6ff]' : 'text-white'}`}>{song.title}</h3>
                          <p className="text-sm font-medium text-zinc-300 drop-shadow">{song.artist}</p>
                        </div>
                        
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                          <button onClick={(e) => handleOpenMenu(e, song)} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 text-white/80 hover:text-white transition-opacity">
                              <MoreVertical size={24} />
                          </button>
                          <button className={`w-12 h-12 bg-white text-black rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-xl ${currentSong?.id === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isPlaying && currentSong?.id === song.id ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4 text-xs text-zinc-400 font-medium">
                          Sounds like • {song.artist}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.type === 'grid' && (
                <div className="grid grid-rows-4 grid-flow-col gap-x-4 gap-y-2 overflow-x-auto hide-scrollbar snap-x pb-4">
                  {section.tracks.map((song, idx) => (
                    <div 
                      key={song.id}
                      onClick={() => handlePlay(song, section.tracks, idx)}
                      className={`w-[280px] md:w-[340px] flex items-center gap-3 p-2 rounded-md cursor-pointer snap-start group transition-colors ${currentSong?.id === song.id ? 'bg-white/10' : 'hover:bg-zinc-800/60'}`}
                    >
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <img src={song.image} alt={song.title} className="w-full h-full object-cover rounded shadow-md" />
                        <div className={`absolute inset-0 rounded flex items-center justify-center transition-opacity ${currentSong?.id === song.id ? 'opacity-100 bg-black/50' : 'opacity-0 group-hover:opacity-100 bg-black/50'}`}>
                          {isPlaying && currentSong?.id === song.id ? <Pause fill="white" size={16} /> : <Play fill="white" size={16} className="ml-0.5" />}
                        </div>
                      </div>
                      
                      {/* 🔥 JURUS TEKS BERJALAN GRID 🔥 */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="scroll-container mb-0.5">
                          <div className={`text-sm font-bold ${song.title?.length > 18 ? 'scroll-active' : 'scroll-text'} group-hover:underline ${currentSong?.id === song.id ? 'text-[#3ea6ff]' : 'text-white'}`}>{song.title}</div>
                        </div>
                        <div className="scroll-container">
                          <div className={`text-xs text-zinc-400 ${song.artist?.length > 20 ? 'scroll-active' : 'scroll-text'}`}>{song.artist}</div>
                        </div>
                      </div>

                      <button onClick={(e) => handleOpenMenu(e, song)} className="text-zinc-500 hover:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {section.type === 'circle' && (
                <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar snap-x">
                  {section.tracks.map((song, idx) => (
                    <div 
                      key={song.id} 
                      onClick={() => handlePlay(song, section.tracks, idx)}
                      className="w-[100px] flex-shrink-0 flex flex-col items-center gap-3 cursor-pointer snap-start group relative"
                    >
                      <div className={`w-[100px] h-[100px] rounded-full overflow-hidden relative shadow-lg ${currentSong?.id === song.id ? 'ring-2 ring-[#3ea6ff]' : ''}`}>
                        <img src={song.image} alt={song.artist} className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-300" />
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity rounded-full ${currentSong?.id === song.id ? 'opacity-100 bg-black/40' : 'opacity-0 group-hover:opacity-100 bg-black/40'}`}>
                          {isPlaying && currentSong?.id === song.id ? <Pause fill="white" size={32} /> : <Play fill="white" size={32} className="ml-1" />}
                        </div>
                      </div>
                      
                      {/* 🔥 JURUS TEKS BERJALAN CIRCLE 🔥 */}
                      <div className="w-full text-center overflow-hidden">
                        <div className="scroll-container w-full">
                          <div className={`text-sm font-medium ${song.artist?.length > 13 ? 'scroll-active' : 'scroll-text'} w-full group-hover:underline ${currentSong?.id === song.id ? 'text-[#3ea6ff]' : 'text-white'}`}>{song.artist}</div>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Artis</div>
                      </div>
                      
                      <button onClick={(e) => handleOpenMenu(e, song)} className="absolute top-0 right-0 text-zinc-300 hover:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-black/40 rounded-full p-1">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {section.type === 'square' && (
                <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
                  {section.tracks.map((song, idx) => (
                    <div 
                      key={song.id}
                      onClick={() => handlePlay(song, section.tracks, idx)}
                      className="w-32 md:w-40 flex-shrink-0 cursor-pointer snap-start group relative"
                    >
                      <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden shadow-lg">
                        <img src={song.image} alt={song.title} className="w-full h-full object-cover group-hover:brightness-50 transition-all duration-300" />
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${currentSong?.id === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <button className="w-12 h-12 flex items-center justify-center bg-black/60 hover:bg-black/80 hover:scale-105 text-white rounded-full backdrop-blur-sm transition-all shadow-xl">
                            {isPlaying && currentSong?.id === song.id ? <Pause fill="white" size={24} /> : <Play fill="white" size={24} className="ml-1" />}
                          </button>
                        </div>
                      </div>
                      
                      {/* 🔥 JURUS TEKS BERJALAN SQUARE 🔥 */}
                      <div className="scroll-container mb-1 pr-6">
                        <div className={`text-sm font-bold ${song.title?.length > 15 ? 'scroll-active' : 'scroll-text'} group-hover:underline ${currentSong?.id === song.id ? 'text-[#3ea6ff]' : 'text-white'}`}>{song.title}</div>
                      </div>
                      <div className="scroll-container pr-6">
                        <div className={`text-xs text-zinc-400 ${song.artist?.length > 18 ? 'scroll-active' : 'scroll-text'} leading-tight`}>{song.artist}</div>
                      </div>
                      
                      <button onClick={(e) => handleOpenMenu(e, song)} className="absolute bottom-2 right-0 text-zinc-500 hover:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}

          {!activeCategory && playHistory.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-4 group">
                <h2 className="text-2xl font-bold text-white cursor-pointer group-hover:underline">
                  Paling Sering Didengarkan
                </h2>
                <div 
                  onClick={(e) => handlePlayAll(e, playHistory)}
                  className="flex items-center text-sm font-semibold text-zinc-400 hover:text-white cursor-pointer transition-colors"
                >
                  <span className="hidden md:inline">Putar semua</span>
                  <ChevronRight size={20} />
                </div>
              </div>
              
              <div className="grid grid-rows-4 grid-flow-col gap-x-4 gap-y-2 overflow-x-auto hide-scrollbar snap-x pb-4">
                {playHistory.map((song, idx) => (
                  <div 
                    key={song.id}
                    onClick={() => handlePlay(song, playHistory, idx)}
                    className={`w-[280px] md:w-[340px] flex items-center gap-3 p-2 rounded-md cursor-pointer snap-start group transition-colors ${currentSong?.id === song.id ? 'bg-white/10' : 'hover:bg-zinc-800/60'}`}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img src={song.image} alt={song.title} className="w-full h-full object-cover rounded shadow-md" />
                      <div className={`absolute inset-0 rounded flex items-center justify-center transition-opacity ${currentSong?.id === song.id ? 'opacity-100 bg-black/50' : 'opacity-0 group-hover:opacity-100 bg-black/50'}`}>
                        {isPlaying && currentSong?.id === song.id ? <Pause fill="white" size={16} /> : <Play fill="white" size={16} className="ml-0.5" />}
                      </div>
                    </div>
                    
                    {/* 🔥 JURUS TEKS BERJALAN HISTORY 🔥 */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="scroll-container mb-0.5">
                        <div className={`text-sm font-bold ${song.title?.length > 18 ? 'scroll-active' : 'scroll-text'} group-hover:underline ${currentSong?.id === song.id ? 'text-[#3ea6ff]' : 'text-white'}`}>{song.title}</div>
                      </div>
                      <div className="scroll-container">
                        <div className={`text-xs text-zinc-400 ${song.artist?.length > 20 ? 'scroll-active' : 'scroll-text'}`}>{song.artist}</div>
                      </div>
                    </div>

                    <button onClick={(e) => handleOpenMenu(e, song)} className="text-zinc-500 hover:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}