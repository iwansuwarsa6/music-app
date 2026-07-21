import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Coffee, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 🔥 IMPORT GAMBAR SESUAI NAMA FILE LU 🔥
import rizalImg from './rizal.jpg';
import rnctechImg from './rnctech.jpg';
import seviImg from './sevi.jpg';

export default function Developer() {
  const navigate = useNavigate();
  
  // 🔥 STATE UNTUK FITUR PWA / INSTALL 🔥
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  // 🔥 LOGIK PENANGKAP INSTALLER 🔥
  useEffect(() => {
    // 1. Nangkep Izin Install buat Android
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Deteksi apakah HP-nya iPhone/iPad
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Cek apakah udah diinstal (standalone)
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIosDevice && !isStandalone) {
        setIsIOS(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // 🔥 FUNGSI KLIK TOMBOL DOWNLOAD 🔥
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSPrompt(true);
    } else {
      alert("Aplikasi sudah terinstal atau browser tidak mendukung fitur ini.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white animate-in fade-in duration-300">
      
      {/* NAVBAR */}
      <div className="flex items-center gap-4 p-4 md:px-8 border-b border-white/5 sticky top-0 bg-[#0f0f0f]/80 backdrop-blur-xl z-40">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Tentang Tim</h1>
      </div>

      <div className="p-4 md:px-8 max-w-4xl mx-auto pb-32 pt-8">
        
        {/* ================= HEADER: RNC TECH (VENOM BIRU) ================= */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="relative flex items-center justify-center w-36 h-36 md:w-48 md:h-48 mb-6 mt-2">
            <div className="absolute inset-[0%] bg-gradient-to-r from-[#3ea6ff] to-blue-600 animate-venom-1 blur-[4px] opacity-90"></div>
            <div className="absolute inset-[2%] bg-gradient-to-tr from-cyan-400 to-[#3ea6ff] animate-venom-2 blur-[4px] opacity-90" style={{ animationDelay: '-2s' }}></div>
            <div className="absolute inset-[-30%] bg-[#3ea6ff]/20 blur-3xl rounded-full pointer-events-none"></div>
            
            <img 
              src={rnctechImg} 
              alt="RNC Tech" 
              className="relative z-10 w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-[5px] border-[#0f0f0f] shadow-[0_0_30px_rgba(62,166,255,0.3)]"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter">RNC TECH</h1>
            <CheckCircle2 size={32} className="text-[#3ea6ff] fill-white bg-black rounded-full" />
          </div>

          <p className="text-center text-zinc-400 mt-4 text-sm md:text-base leading-relaxed max-w-2xl px-4">
            Platform streaming musik modern gratis tanpa iklan. Nikmati jutaan lagu, buat daftar putar Anda sendiri, dan temukan musik baru setiap hari dengan kualitas audio premium persembahan dari tim developer kami.
          </p>
        </div>

        {/* ================= GRID DIVISI (BACKEND & FRONTEND) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            
            {/* --- KARTU RIZAL (VENOM HIJAU) --- */}
            <div className="flex flex-col items-center bg-[#181818] p-8 rounded-3xl border border-white/5 shadow-lg relative overflow-hidden group hover:bg-[#1c1c1c] transition-colors">
                <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#2ecc71]/10 blur-3xl rounded-full pointer-events-none group-hover:bg-[#2ecc71]/20 transition-all"></div>
                
                <h2 className="text-[#2ecc71] text-xs font-black tracking-[0.2em] mb-8 uppercase bg-[#2ecc71]/10 px-4 py-1.5 rounded-full border border-[#2ecc71]/20">Backend Developer</h2>
                
                <div className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44 mb-6">
                    <div className="absolute inset-[0%] bg-gradient-to-r from-[#2ecc71] to-emerald-600 animate-venom-1 blur-[3px] opacity-90"></div>
                    <div className="absolute inset-[2%] bg-gradient-to-tr from-teal-500 to-[#2ecc71] animate-venom-2 blur-[3px] opacity-90" style={{ animationDelay: '-1s' }}></div>
                    
                    <img 
                    src={rizalImg} 
                    alt="Rizalagst" 
                    className="relative z-10 w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-[5px] border-[#181818] shadow-2xl"
                    />
                </div>

                <div className="flex items-center gap-2 mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold">Rizalagst</h1>
                    <CheckCircle2 size={22} className="text-[#3ea6ff] fill-white bg-black rounded-full" />
                </div>

                {/* Sosial Media Rizal */}
                <div className="flex justify-center gap-3 w-full">
                    <a href="https://www.tiktok.com/@rizalagst" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#282828] hover:bg-[#333] px-4 py-3 rounded-xl transition-colors group/soc flex-1">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover/soc:text-white transition-colors">
                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3" />
                        </svg>
                        <span className="text-[11px] font-bold text-zinc-400 group-hover/soc:text-white transition-colors truncate">@rizalagst</span>
                    </a>
                    <a href="https://www.instagram.com/rizal8813" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#282828] hover:bg-[#333] px-4 py-3 rounded-xl transition-colors group/soc flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover/soc:text-white transition-colors">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        <span className="text-[11px] font-bold text-zinc-400 group-hover/soc:text-white transition-colors truncate">@rizal8813</span>
                    </a>
                </div>
            </div>

            {/* --- KARTU SEVI (VENOM PINK) --- */}
            <div className="flex flex-col items-center bg-[#181818] p-8 rounded-3xl border border-white/5 shadow-lg relative overflow-hidden group hover:bg-[#1c1c1c] transition-colors">
                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#e84393]/10 blur-3xl rounded-full pointer-events-none group-hover:bg-[#e84393]/20 transition-all"></div>
                
                <h2 className="text-[#e84393] text-xs font-black tracking-[0.2em] mb-8 uppercase bg-[#e84393]/10 px-4 py-1.5 rounded-full border border-[#e84393]/20">Frontend Developer</h2>
                
                <div className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44 mb-6">
                    <div className="absolute inset-[0%] bg-gradient-to-r from-[#e84393] to-pink-600 animate-venom-1 blur-[3px] opacity-90"></div>
                    <div className="absolute inset-[2%] bg-gradient-to-tr from-rose-500 to-[#e84393] animate-venom-2 blur-[3px] opacity-90" style={{ animationDelay: '-3s' }}></div>
                    
                    <img 
                    src={seviImg} 
                    alt="sevisev" 
                    className="relative z-10 w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-[5px] border-[#181818] shadow-2xl"
                    />
                </div>

                <div className="flex items-center gap-2 mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold">sevisev</h1>
                    <CheckCircle2 size={22} className="text-[#3ea6ff] fill-white bg-black rounded-full" />
                </div>

                {/* Sosial Media Sevi */}
                <div className="flex justify-center gap-3 w-full">
                    <a href="https://www.tiktok.com/@sevi.sevvv" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#282828] hover:bg-[#333] px-4 py-3 rounded-xl transition-colors group/soc flex-1">
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover/soc:text-white transition-colors">
                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3" />
                        </svg>
                        <span className="text-[11px] font-bold text-zinc-400 group-hover/soc:text-white transition-colors truncate">@sevi.sevvv</span>
                    </a>
                    <a href="https://www.instagram.com/sevi.sev" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#282828] hover:bg-[#333] px-4 py-3 rounded-xl transition-colors group/soc flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover/soc:text-white transition-colors">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                        <span className="text-[11px] font-bold text-zinc-400 group-hover/soc:text-white transition-colors truncate">@sevi.sev</span>
                    </a>
                </div>
            </div>

        </div>

        {/* ================= ACTION BUTTONS (DONASI & INSTALL) ================= */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto pt-4 border-t border-white/10">
          <a href="#" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#181818] border border-white/10 hover:bg-[#252525] transition-colors p-4 rounded-2xl flex items-center justify-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Coffee size={24} className="text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors">Dukung RNC Tech</span>
              <span className="text-xs text-zinc-400">Buy us a coffee</span>
            </div>
          </a>

          {/* 🔥 TOMBOL DOWNLOAD YANG UDAH DIKASIH FUNGSI 🔥 */}
          <button 
            onClick={handleInstallClick} 
            className="flex-1 bg-white text-black hover:bg-zinc-200 transition-colors py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-base font-black group shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]"
          >
            <Download size={22} className="text-black group-hover:-translate-y-1 transition-transform" />
            INSTALL APLIKASI
          </button>
        </div>
      </div>

      {/* 🔥 MODAL POP-UP KHUSUS IPHONE 🔥 */}
      {showIOSPrompt && (
        <div className="fixed inset-0 bg-black/80 z-[99999] flex items-end justify-center pb-10 px-4 animate-in fade-in duration-300" onClick={() => setShowIOSPrompt(false)}>
          <div className="bg-[#181818] border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowIOSPrompt(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors bg-white/5 p-1 rounded-full">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-2 mt-2">Install di iPhone 🍏</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Apple tidak mengizinkan instalasi otomatis. Untuk menginstal aplikasi ini:
            </p>
            <div className="flex flex-col gap-4 text-left bg-[#0f0f0f] p-5 rounded-xl border border-white/5 mb-6">
              <div className="flex items-center gap-4 text-sm text-zinc-300">
                <span className="bg-[#282828] w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#3ea6ff] flex-shrink-0">1</span>
                <span>Tekan icon <b>Share (Bagikan)</b> di bawah layar browser.</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-300">
                <span className="bg-[#282828] w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#3ea6ff] flex-shrink-0">2</span>
                <span>Geser ke bawah, lalu pilih <b>"Add to Home Screen"</b>.</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-300">
                <span className="bg-[#282828] w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#3ea6ff] flex-shrink-0">3</span>
                <span>Tekan <b>"Add"</b> di pojok kanan atas.</span>
              </div>
            </div>
            <button onClick={() => setShowIOSPrompt(false)} className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-lg">
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* STYLE KEYFRAMES UNTUK VENOM BLOB */}
      <style>{`
        @keyframes venomBlob {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        .animate-venom-1 {
          animation: venomBlob 4s ease-in-out infinite alternate;
        }
        .animate-venom-2 {
          animation: venomBlob 5s ease-in-out infinite alternate-reverse;
        }
      `}</style>

    </div>
  );
}