import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Coffee, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import rizalImg from './rizal.jpg';

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
    <div className="min-h-screen bg-transparent text-white animate-in fade-in duration-300">
      
      <div className="flex items-center gap-4 p-4 md:px-8 border-b border-white/5 sticky top-0 bg-transparent backdrop-blur-md z-40">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Tentang</h1>
      </div>

      <div className="p-4 md:px-8 max-w-2xl mx-auto pb-32">
        <h2 className="text-[#2ecc71] text-sm font-semibold mb-12">Lead Developer</h2>

        <div className="flex flex-col items-center">
          
          <div className="relative flex items-center justify-center w-40 h-40 md:w-52 md:h-52 mb-2 mt-4">
            <div className="absolute inset-[0%] bg-gradient-to-r from-[#2ecc71] to-emerald-600 animate-venom-1 blur-[3px] opacity-90"></div>
            <div className="absolute inset-[2%] bg-gradient-to-tr from-teal-500 to-[#2ecc71] animate-venom-2 blur-[3px] opacity-90" style={{ animationDelay: '-2s' }}></div>
            <div className="absolute inset-[-20%] bg-[#2ecc71]/20 blur-3xl rounded-full pointer-events-none"></div>
            
            <img 
              src={rizalImg} 
              alt="Rizal Developer" 
              className="relative z-10 w-36 h-36 md:w-44 md:h-44 object-cover rounded-full border-[5px] border-[#0f0f0f] shadow-2xl"
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <h1 className="text-2xl md:text-3xl font-bold">Rizalagst</h1>
            <CheckCircle2 size={24} fill="#3ea6ff" color="white" />
          </div>

          <p className="text-center text-zinc-400 mt-4 text-sm md:text-base leading-relaxed max-w-lg">
            Platform streaming musik modern gratis tanpa iklan. Nikmati jutaan lagu, buat daftar putar Anda sendiri, dan temukan musik baru setiap hari dengan kualitas audio premium tanpa batasan.
          </p>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <a href="https://www.tiktok.com/@rizalagst" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center bg-[#181818] hover:bg-[#282828] transition-colors w-24 h-24 rounded-2xl gap-2 group">
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 group-hover:text-white transition-colors">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3" />
            </svg>
            <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">@rizalagst</span>
          </a>

          <a href="https://www.instagram.com/rizal8813" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center bg-[#181818] hover:bg-[#282828] transition-colors w-24 h-24 rounded-2xl gap-2 group">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 group-hover:text-white transition-colors">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">@rizal8813</span>
          </a>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <a href="#" target="_blank" rel="noopener noreferrer" className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors p-4 rounded-2xl flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-[#1a2e23] rounded-full flex items-center justify-center flex-shrink-0">
              <Coffee size={24} className="text-[#2ecc71]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white group-hover:text-[#2ecc71] transition-colors">Like what I do?</span>
              <span className="text-sm text-zinc-400">Buy me a coffee</span>
            </div>
          </a>

          {/* 🔥 TOMBOL DOWNLOAD YANG UDAH DIKASIH FUNGSI 🔥 */}
          <button 
            onClick={handleInstallClick} 
            className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-base font-bold text-white group w-full"
          >
            <Download size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
            Download APK
          </button>
        </div>
      </div>

      {/* 🔥 MODAL POP-UP KHUSUS IPHONE 🔥 */}
      {showIOSPrompt && (
        <div className="fixed inset-0 bg-black/80 z-[99999] flex items-end justify-center pb-10 px-4 animate-in fade-in duration-300" onClick={() => setShowIOSPrompt(false)}>
          <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl relative animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowIOSPrompt(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Install di iPhone 🍏</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Apple tidak mengizinkan instalasi otomatis. Untuk menginstal aplikasi ini:
            </p>
            <div className="flex flex-col gap-4 text-left bg-[#0f0f0f] p-5 rounded-xl border border-white/5 mb-6">
              <div className="flex items-center gap-4 text-sm text-zinc-300">
                <span className="bg-[#282828] w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#2ecc71] flex-shrink-0">1</span>
                <span>Tekan icon <b>Share (Bagikan)</b> di bawah layar browser.</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-300">
                <span className="bg-[#282828] w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#2ecc71] flex-shrink-0">2</span>
                <span>Geser ke bawah, lalu pilih <b>"Add to Home Screen"</b>.</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-300">
                <span className="bg-[#282828] w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#2ecc71] flex-shrink-0">3</span>
                <span>Tekan <b>"Add"</b> di pojok kanan atas.</span>
              </div>
            </div>
            <button onClick={() => setShowIOSPrompt(false)} className="w-full py-3.5 bg-[#2ecc71] text-black font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg">
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

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