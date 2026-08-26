import { useEffect, useRef } from 'react';
import shaka from 'shaka-player';

export default function ShakaPlayer({ url, clearKeyId, clearKeyValue }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // 1. Install Polyfill (Biar support di semua jenis browser)
    shaka.polyfill.installAll();
    
    if (!shaka.Player.isBrowserSupported()) {
      console.error('Browser ini tidak support Shaka Player!');
      return;
    }

    const video = videoRef.current;
    
    // 2. Inisialisasi Mesin Shaka
    if (!playerRef.current) {
      playerRef.current = new shaka.Player(video);
    }
    const player = playerRef.current;

    // 3. 🔥 INI KUNCI PEMBOBOL DRM (CLEARKEY) 🔥
    // Kalau lu dapet ID dan Kunci dari Telegram/GitHub, masukin ke sini
    if (clearKeyId && clearKeyValue) {
      player.configure({
        drm: {
          clearKeys: {
            // Format wajib Shaka: 'KODE_ID': 'KODE_KUNCI'
            [clearKeyId]: clearKeyValue
          }
        }
      });
      console.log('Kunci DRM Terpasang!');
    } else {
      // Reset config kalau pindah ke channel biasa (non-DRM)
      player.configure({ drm: { clearKeys: {} } });
    }

    // 4. Proses Loading Video
    player.load(url)
      .then(() => {
        console.log('Siaran berhasil dibongkar Shaka Player!');
        video.play().catch(e => console.log('Autoplay ditahan browser:', e));
      })
      .catch(e => {
        console.error('Shaka Error (Biasanya kunci DRM salah/expired):', e);
      });

    // 5. Bersihkan memori pas channel diganti
    return () => {
      if (player) {
        player.destroy();
        playerRef.current = null;
      }
    };
  }, [url, clearKeyId, clearKeyValue]);

  return (
    <video 
      ref={videoRef} 
      controls 
      muted 
      autoPlay 
      className="absolute inset-0 w-full h-full bg-black z-10" 
    />
  );
}