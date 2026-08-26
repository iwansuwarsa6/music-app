import { useState, useEffect, useRef } from 'react';
import { Tv, Calendar, Radio, Info, PlaySquare, Loader2, Search } from 'lucide-react';
import Hls from 'hls.js'; 

// 🔥 1. CUSTOM HLS PLAYER (MESIN ANTI-GAGAL)
const CustomHlsPlayer = ({ url }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => console.log("Autoplay ditahan browser:", err));
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch((err) => console.log("Autoplay ditahan browser:", err));
      });
    }

    return () => {
      if (hls) hls.destroy(); 
    };
  }, [url]);

  return (
    <video
      ref={videoRef}
      controls
      muted
      autoPlay
      className="absolute inset-0 w-full h-full bg-black z-10"
    />
  );
};

export default function Television() {
  
  // 🗓️ 2. DATA JADWAL MATCH (Tarik dari Backend)
  const matchSchedule = [
    {
      id: 'timnas-live',
      date: "HARI INI • 19:00 WIB",
      title: "Timnas Indonesia vs Arab Saudi",
      league: "Kualifikasi Piala Dunia 2026",
      colorTag: "border-l-[#3ea6ff]",
      dateColor: "text-[#3ea6ff]"
    },
    {
      id: 'persib-live',
      date: "BESOK • 15:30 WIB",
      title: "PERSIB vs Persija",
      league: "Liga 1 Indonesia",
      colorTag: "border-l-blue-600",
      dateColor: "text-zinc-500"
    }
  ];

  // State untuk nyimpan ribuan channel hasil sedotan dari GitHub
  const [channels, setChannels] = useState([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  
  const [activeStream, setActiveStream] = useState(null);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 3. AUTO-PARSER M3U DARI GITHUB DHANYTV 🔥
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        // Nyedot raw file M3U OTT dari repo Dhani
        const response = await fetch('https://raw.githubusercontent.com/dhasap/dhanytv/main/dhanytv-ott.m3u');
        const text = await response.text();
        
        // Proses ngebelah teks jadi daftar channel
        const lines = text.split('\n');
        const parsedChannels = [];
        let currentName = '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('#EXTINF:')) {
            // Ambil nama channel setelah tanda koma terakhir
            const parts = line.split(',');
            currentName = parts[parts.length - 1].trim();
          } else if (line.startsWith('http') && currentName) {
            parsedChannels.push({
              id: parsedChannels.length + 1,
              name: currentName,
              url: line,
              type: 'tv'
            });
            currentName = ''; // Reset buat channel berikutnya
          }
        }

        setChannels(parsedChannels);
        
        // Langsung setel Mux Test atau channel pertama sebagai default pas web dibuka
        if (parsedChannels.length > 0) {
          setActiveStream({ name: 'Siap Menonton', url: '', type: 'standby' });
        }

      } catch (error) {
        console.error("Gagal nyedot playlist TV:", error);
      } finally {
        setIsLoadingChannels(false);
      }
    };

    fetchPlaylist();
  }, []);

  // Fitur Pencarian Channel
  const filteredChannels = channels.filter(ch => 
    ch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectChannel = (ch) => {
    setIsLoadingStream(false);
    setActiveStream({ name: ch.name, url: ch.url, type: 'channel' });
  };

  const handleSelectMatch = async (match) => {
    setIsLoadingStream(true);
    setActiveStream({ name: match.title, url: '', type: 'match' });

    try {
      const response = await fetch(`https://music-app-production-60db.up.railway.app/api/get-match-stream?matchId=${match.id}`);
      const data = await response.json();

      if (data.success && data.streamUrl) {
        setActiveStream({ name: match.title, url: data.streamUrl, type: 'match' });
      } else {
        alert("Gagal memuat siaran untuk pertandingan ini.");
      }
    } catch (error) {
      console.error("Gagal nyambung ke proxy TV:", error);
      alert("Koneksi ke backend terputus.");
    } finally {
      setIsLoadingStream(false);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-[#3ea6ff]/20 rounded-2xl flex items-center justify-center border border-[#3ea6ff]/30 shadow-[0_0_15px_rgba(62,166,255,0.2)]">
          <Tv size={32} className="text-[#3ea6ff]" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">RnC <span className="text-[#3ea6ff]">Television</span></h1>
          <p className="text-sm text-zinc-400 font-medium tracking-wide">Live Stream & Match Schedule Controller</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LAYAR TV UTAMA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="w-full aspect-video bg-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative flex items-center justify-center group">
            
            {isLoadingStream && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                <Loader2 className="w-10 h-10 text-[#3ea6ff] animate-spin mb-2" />
                <p className="text-xs font-bold text-white tracking-widest uppercase">Menghubungkan Server...</p>
              </div>
            )}

            {activeStream && activeStream.url ? (
              <CustomHlsPlayer url={activeStream.url} />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-600 z-10">
                <Tv size={64} className="mb-4 opacity-50" />
                <p className="font-bold tracking-widest uppercase text-sm">Pilih Siaran Untuk Menonton</p>
              </div>
            )}

            {activeStream && activeStream.url && !isLoadingStream && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest flex items-center gap-2 shadow-lg z-20 pointer-events-none">
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span> LIVE
              </div>
            )}
          </div>

          <div className="bg-[#181818] p-5 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <Info size={20} className="text-[#3ea6ff]" /> Status Siaran
            </h2>
            <p className="text-sm text-zinc-400">
              {activeStream && activeStream.url ? `Menayangkan: ${activeStream.name}.` : 'Standby. Menunggu pilihan channel...'}
            </p>
          </div>
        </div>

        {/* KOLOM KANAN: DAFTAR CHANNEL & JADWAL */}
        <div className="flex flex-col gap-6">
          
          {/* DAFTAR SIARAN (SEKARANG DINAMIS) */}
          <div className="bg-[#181818] rounded-2xl border border-white/5 p-5 flex flex-col h-[350px]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
              <Radio size={20} className="text-[#3ea6ff]" /> Daftar Siaran (IPTV)
            </h3>
            
            {/* Kolom Pencarian Channel */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Cari channel (ex: SCTV, Indosiar)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-[#3ea6ff]/50"
              />
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto hide-scrollbar flex-1">
              {isLoadingChannels ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs">Mengunduh 700+ Channel...</span>
                </div>
              ) : filteredChannels.length > 0 ? (
                filteredChannels.map((ch) => (
                  <button 
                    key={ch.id}
                    onClick={() => handleSelectChannel(ch)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all border text-left ${activeStream?.name === ch.name ? 'bg-[#3ea6ff]/10 border-[#3ea6ff]/50' : 'bg-black/30 border-white/5 hover:bg-white/5'}`}
                  >
                    <span className={`font-bold text-sm truncate pr-2 ${activeStream?.name === ch.name ? 'text-[#3ea6ff]' : 'text-zinc-300'}`}>{ch.name}</span>
                    <PlaySquare size={16} className={`flex-shrink-0 ${activeStream?.name === ch.name ? 'text-[#3ea6ff]' : 'text-zinc-600'}`} />
                  </button>
                ))
              ) : (
                <p className="text-center text-zinc-500 text-sm mt-4">Channel tidak ditemukan.</p>
              )}
            </div>
          </div>

          {/* JADWAL MATCH */}
          <div className="bg-[#181818] rounded-2xl border border-white/5 p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <Calendar size={20} className="text-[#3ea6ff]" /> Jadwal Match (Proxy)
            </h3>
            <div className="flex flex-col gap-3">
              {matchSchedule.map((match) => (
                <div 
                  key={match.id} 
                  onClick={() => handleSelectMatch(match)}
                  className={`bg-black/50 p-3 rounded-xl border transition-all cursor-pointer group hover:border-[#3ea6ff]/50 border-l-4 ${match.colorTag} ${activeStream?.name === match.title ? 'bg-[#3ea6ff]/10 border-[#3ea6ff]' : 'border-white/5'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-[10px] ${match.dateColor} font-bold tracking-widest mb-1 uppercase`}>{match.date}</p>
                    <PlaySquare size={16} className={activeStream?.name === match.title ? 'text-[#3ea6ff]' : 'text-zinc-600 group-hover:text-white'} />
                  </div>
                  <p className="text-sm font-bold text-white">{match.title}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; } 
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}