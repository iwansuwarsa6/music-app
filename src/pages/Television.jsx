import { useState, useEffect } from 'react';
import { Tv, Calendar, Radio, Info } from 'lucide-react';

export default function Television() {
  const [activeChannel, setActiveChannel] = useState(null);

  // 📺 Daftar Channel / Stream Feed lu masukin ke sini Bang
  const channels = [
    { id: 1, name: 'Timnas Indonesia Live', type: 'sports', url: 'LINK_M3U8_ATAU_IFRAME_LU_DISINI' },
    { id: 2, name: 'PERSIB Match', type: 'sports', url: 'LINK_M3U8_ATAU_IFRAME_LU_DISINI' },
    { id: 3, name: 'RnC Music TV', type: 'music', url: 'LINK_M3U8_ATAU_IFRAME_LU_DISINI' }
  ];

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
            
            {activeChannel ? (
              // ⚠️ GANTI BAGIAN INI SAMA ENGINE PLAYER LU (MISAL PAKAI IFRAME ATAU VIDEO.JS)
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <Radio className="text-[#3ea6ff] animate-pulse mb-4" size={48} />
                <p className="absolute bottom-10 text-white font-bold tracking-widest uppercase">Memutar: {activeChannel.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-600">
                <Tv size={64} className="mb-4 opacity-50" />
                <p className="font-bold tracking-widest uppercase text-sm">Pilih Siaran Untuk Mulai Menonton</p>
              </div>
            )}

            {/* Indikator Live */}
            {activeChannel && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest flex items-center gap-2 shadow-lg">
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
              {activeChannel ? `Terhubung ke server stream ${activeChannel.name}. Pastikan koneksi stabil.` : 'Standby. Menunggu perintah stream...'}
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
            <div className="flex flex-col gap-3">
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

          {/* Jadwal Match */}
          <div className="bg-[#181818] rounded-2xl border border-white/5 p-5 flex-1">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <Calendar size={20} className="text-[#3ea6ff]" /> Jadwal Match
            </h3>
            <div className="flex flex-col gap-4">
              
              {/* Dummy Data Jadwal - Bisa lu sambungin ke API atau Array JSON lu */}
              <div className="bg-black/50 p-3 rounded-xl border border-white/5 border-l-4 border-l-[#3ea6ff]">
                <p className="text-[10px] text-[#3ea6ff] font-bold tracking-widest mb-1 uppercase">Hari Ini • 19:00 WIB</p>
                <p className="text-sm font-bold text-white">Timnas Indonesia vs Arab Saudi</p>
                <p className="text-xs text-zinc-500 mt-1">Kualifikasi Piala Dunia 2026</p>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-white/5 border-l-4 border-l-blue-600">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest mb-1 uppercase">Besok • 15:30 WIB</p>
                <p className="text-sm font-bold text-zinc-300">PERSIB vs Persija</p>
                <p className="text-xs text-zinc-500 mt-1">Liga 1 Indonesia</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}