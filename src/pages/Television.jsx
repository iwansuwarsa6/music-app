import { useState } from 'react';
import { Tv, Calendar, Radio, Info, PlaySquare, Loader2 } from 'lucide-react';
// 🔥 MESIN PEMUTAR TV REACT-PLAYER 🔥
import ReactPlayer from 'react-player';

export default function Television() {
  
  // 🗓️ 1. DATA JADWAL MATCH (Bisa diklik buat narik stream dari backend proxy)
  const matchSchedule = [
    {
      id: 'timnas-live',
      date: "HARI INI • 19:00 WIB",
      title: "Timnas Indonesia vs Arab Saudi",
      league: "Kualifikasi Piala Dunia 2026",
      colorTag: "border-l-[#3ea6ff]", // Warna garis pinggir (Biru RnC)
      dateColor: "text-[#3ea6ff]"
    },
    {
      id: 'persib-live',
      date: "BESOK • 15:30 WIB",
      title: "PERSIB vs Persija",
      league: "Liga 1 Indonesia",
      colorTag: "border-l-blue-600", // Warna garis pinggir (Biru Persib)
      dateColor: "text-zinc-500"
    },
    {
      id: 3,
      date: "SABTU • 20:00 WIB",
      title: "Manchester Utd vs Arsenal",
      league: "Premier League",
      colorTag: "border-l-red-600", 
      dateColor: "text-zinc-500"
    }
  ];

  // 📺 2. DATA CHANNEL TV (Format M3U8 / IPTV ASLI Langsung)
  const channels = [
    { 
      id: 1, 
      name: 'TVRI Nasional Live', 
      type: 'tv', 
      url: 'https://tvri-id.akamaized.net/hls/live/2026859/TVRI-Nasional/master.m3u8' 
    },
    { 
      id: 2, 
      name: 'BeritaSatu Live', 
      type: 'tv', 
      url: 'https://b1-live.secureswiftcontent.com/b1_ch01/chunklist.m3u8' 
    },
    { 
      id: 3, 
      name: 'Mux Test Server (Tes Jaringan)', 
      type: 'tv', 
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' 
    }
  ];

  // State untuk melacak siaran/match apa yang sedang aktif diputar
  const [activeStream, setActiveStream] = useState({
    name: channels[0].name,
    url: channels[0].url,
    type: 'channel'
  });
  
  const [isLoadingStream, setIsLoadingStream] = useState(false);

  // Handler saat user klik Channel IPTV biasa
  const handleSelectChannel = (ch) => {
    setIsLoadingStream(false);
    setActiveStream({
      name: ch.name,
      url: ch.url,
      type: 'channel'
    });
  };

  // Handler saat user klik Jadwal Match (Nembak Backend Proxy Node.js)
  const handleSelectMatch = async (match) => {
    setIsLoadingStream(true);
    setActiveStream({
      name: match.title,
      url: '',
      type: 'match'
    });

    try {
      // Nembak ke backend server.js lu yang ada di Railway
      const response = await fetch(`https://music-app-production-60db.up.railway.app/api/get-match-stream?matchId=${match.id}`);
      const data = await response.json();

      if (data.success && data.streamUrl) {
        setActiveStream({
          name: match.title,
          url: data.streamUrl,
          type: 'match'
        });
      } else {
        alert("Gagal memuat siaran untuk pertandingan ini.");
      }
    } catch (error) {
      console.error("Gagal nyambung ke server proxy TV:", error);
      alert("Koneksi ke server backend terputus.");
    } finally {
      setIsLoadingStream(false);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-10 animate-in fade-in duration-500">
      
      {/* 🔥 HEADER TV 🔥 */}
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
        
        {/* 🔥 KOTAK LAYAR TV UTAMA 🔥 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="w-full aspect-video bg-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative flex items-center justify-center group">
            
            {/* Loading Animation pas Backend lagi nyari link stream */}
            {isLoadingStream && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
                <Loader2 className="w-10 h-10 text-[#3ea6ff] animate-spin mb-2" />
                <p className="text-xs font-bold text-white tracking-widest uppercase">Menghubungkan ke Server Siaran...</p>
              </div>
            )}

            {/* MESIN PEMUTAR REACT-PLAYER */}
            {activeStream && activeStream.url ? (
              <ReactPlayer 
                url={activeStream.url}
                playing={true}
                controls={true}
                width="100%"
                height="100%"
                className="absolute inset-0 z-10"
                config={{
                  file: {
                    forceHLS: true, // Maksa browser baca format .m3u8
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-600 z-10">
                <Tv size={64} className="mb-4 opacity-50" />
                <p className="font-bold tracking-widest uppercase text-sm">Pilih Siaran Atau Jadwal Untuk Menonton</p>
              </div>
            )}

            {/* Indikator Live */}
            {activeStream && activeStream.url && !isLoadingStream && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest flex items-center gap-2 shadow-lg z-20 pointer-events-none">
                <span className="w-2 h-2 bg-white rounded-full animate-ping"></span> LIVE
              </div>
            )}
          </div>

          {/* Info Channel */}
          <div className="bg-[#181818] p-5 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <Info size={20} className="text-[#3ea6ff]" /> Status Siaran
            </h2>
            <p className="text-sm text-zinc-400">
              {activeStream ? `Menayangkan: ${activeStream.name}. Pastikan koneksi internet stabil untuk kualitas HD.` : 'Standby. Menunggu perintah stream...'}
            </p>
          </div>
        </div>

        {/* 🔥 KOTAK PILIHAN CHANNEL & JADWAL 🔥 */}
        <div className="flex flex-col gap-6">
          
          {/* Daftar Channel IPTV */}
          <div className="bg-[#181818] rounded-2xl border border-white/5 p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <Radio size={20} className="text-[#3ea6ff]" /> Daftar Siaran (IPTV)
            </h3>
            <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto hide-scrollbar">
              {channels.map((ch) => (
                <button 
                  key={ch.id}
                  onClick={() => handleSelectChannel(ch)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all border ${activeStream?.name === ch.name ? 'bg-[#3ea6ff]/10 border-[#3ea6ff]/50' : 'bg-black/50 border-white/5 hover:bg-white/5'}`}
                >
                  <span className={`font-bold text-sm ${activeStream?.name === ch.name ? 'text-[#3ea6ff]' : 'text-zinc-300'}`}>{ch.name}</span>
                  <PlaySquare size={18} className={activeStream?.name === ch.name ? 'text-[#3ea6ff]' : 'text-zinc-600'} />
                </button>
              ))}
            </div>
          </div>

          {/* Jadwal Match (Interaktif - Nembak Backend Proxy) */}
          <div className="bg-[#181818] rounded-2xl border border-white/5 p-5 flex-1">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <Calendar size={20} className="text-[#3ea6ff]" /> Jadwal Match (Live Proxy)
            </h3>
            <div className="flex flex-col gap-4 max-h-[280px] overflow-y-auto hide-scrollbar">
              
              {matchSchedule.map((match) => (
                <div 
                  key={match.id} 
                  onClick={() => handleSelectMatch(match)}
                  className={`bg-black/50 p-3 rounded-xl border transition-all cursor-pointer group hover:border-[#3ea6ff]/50 border-l-4 ${match.colorTag} ${activeStream?.name === match.title ? 'bg-[#3ea6ff]/10 border-[#3ea6ff]' : 'border-white/5'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-[10px] ${match.dateColor} font-bold tracking-widest mb-1 uppercase`}>{match.date}</p>
                    <PlaySquare size={18} className={activeStream?.name === match.title ? 'text-[#3ea6ff]' : 'text-zinc-600 group-hover:text-white'} />
                  </div>
                  <p className="text-sm font-bold text-white">{match.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">{match.league}</p>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>

      {/* Biar scrollbar ilang tapi tetep bisa discroll */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; } 
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}