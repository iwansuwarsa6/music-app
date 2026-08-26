import { useState } from 'react';
import { Tv, Calendar, Radio, Info, PlaySquare } from 'lucide-react';

export default function Television() {
  
  // 🗓️ 1. DATA JADWAL MATCH (Tinggal ganti teksnya di sini Bang)
  const matchSchedule = [
    {
      id: 1,
      date: "HARI INI • 19:00 WIB",
      title: "Timnas Indonesia vs Arab Saudi",
      league: "Kualifikasi Piala Dunia 2026",
      colorTag: "border-l-[#3ea6ff]", // Warna garis pinggir (Biru RnC)
      dateColor: "text-[#3ea6ff]"
    },
    {
      id: 2,
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

  // 📺 2. DATA CHANNEL TV (GANTI URL PAKE LINK EMBED LU)
  // Catatan: Kalo link lu dari YouTube, pastikan formatnya https://www.youtube.com/embed/...
  const channels = [
    { 
      id: 1, 
      name: 'Timnas Indonesia Live', 
      type: 'sports', 
      url: 'https://www.youtube.com/embed/live_stream?channel=UCjI8vIq_iUjNqRofAXXTvwQ&autoplay=1' // Contoh link live
    },
    { 
      id: 2, 
      name: 'PERSIB Match', 
      type: 'sports', 
      url: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1' 
    },
    { 
      id: 3, 
      name: 'RnC Music TV', 
      type: 'music', 
      url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1' 
    }
  ];

  // Set channel default pas pertama kali dibuka (otomatis milih channel urutan pertama)
  const [activeChannel, setActiveChannel] = useState(channels[0]);

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
            
            {/* INI MESIN PEMUTAR TV-NYA BANG! */}
            {activeChannel && activeChannel.url ? (
              <iframe 
                src={activeChannel.url} 
                className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title={activeChannel.name}
              ></iframe>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-600 z-10">
                <Tv size={64} className="mb-4 opacity-50" />
                <p className="font-bold tracking-widest uppercase text-sm">Pilih Siaran Untuk Mulai Menonton</p>
              </div>
            )}

            {/* Indikator Live Melayang di Pojok Kiri Atas */}
            {activeChannel && (
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
              {activeChannel ? `Terhubung ke server stream: ${activeChannel.name}. Pastikan koneksi internet stabil untuk kualitas HD.` : 'Standby. Menunggu perintah stream...'}
            </p>
          </div>
        </div>

        {/* 🔥 KOTAK PILIHAN CHANNEL & JADWAL 🔥 */}
        <div className="flex flex-col gap-6">
          
          {/* Daftar Channel */}
          <div className="bg-[#181818] rounded-2xl border border-white/5 p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <Radio size={20} className="text-[#3ea6ff]" /> Daftar Siaran
            </h3>
            <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto hide-scrollbar">
              {channels.map((ch) => (
                <button 
                  key={ch.id}
                  onClick={() => setActiveChannel(ch)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all border ${activeChannel?.id === ch.id ? 'bg-[#3ea6ff]/10 border-[#3ea6ff]/50' : 'bg-black/50 border-white/5 hover:bg-white/5'}`}
                >
                  <span className={`font-bold text-sm ${activeChannel?.id === ch.id ? 'text-[#3ea6ff]' : 'text-zinc-300'}`}>{ch.name}</span>
                  <PlaySquare size={18} className={activeChannel?.id === ch.id ? 'text-[#3ea6ff]' : 'text-zinc-600'} />
                </button>
              ))}
            </div>
          </div>

          {/* Jadwal Match (Otomatis ke-Generate dari Array di atas) */}
          <div className="bg-[#181818] rounded-2xl border border-white/5 p-5 flex-1">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <Calendar size={20} className="text-[#3ea6ff]" /> Jadwal Match
            </h3>
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto hide-scrollbar">
              
              {matchSchedule.map((match) => (
                <div key={match.id} className={`bg-black/50 p-3 rounded-xl border border-white/5 border-l-4 ${match.colorTag}`}>
                  <p className={`text-[10px] ${match.dateColor} font-bold tracking-widest mb-1 uppercase`}>{match.date}</p>
                  <p className={`text-sm font-bold ${match.id === 1 ? 'text-white' : 'text-zinc-300'}`}>{match.title}</p>
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