import { create } from 'zustand';

const BACKEND_URL = "https://music-app-production-278c.up.railway.app";

// Helper buat mastiin URL selalu pake Railway
const getSongUrl = (song) => {
  if (!song) return null;
  // Kalau URL udah ada backend-nya, balikin aja
  if (song.url && song.url.includes(BACKEND_URL)) return song.url;
  // Kalau belum, bungkus pake URL Railway
  return `${BACKEND_URL}/api/audio?id=${song.id}`;
};

export const usePlayerStore = create((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [], 
  currentIndex: -1,

  playSong: (song, queue = [], index = -1) => {
    // Pake helper biar URL-nya otomatis bener
    const songWithUrl = { ...song, url: getSongUrl(song) };
    set({
      currentSong: songWithUrl,
      isPlaying: true,
      queue: queue.length > 0 ? queue : get().queue,
      currentIndex: index !== -1 ? index : get().currentIndex,
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  playNext: (isShuffle) => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length); 
    } else {
      nextIndex = currentIndex + 1 < queue.length ? currentIndex + 1 : 0;
    }

    const nextSong = queue[nextIndex];
    set({
      currentSong: { ...nextSong, url: getSongUrl(nextSong) },
      currentIndex: nextIndex,
      isPlaying: true
    });
  },

  playPrev: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : queue.length - 1;
    const prevSong = queue[prevIndex];
    set({
      currentSong: { ...prevSong, url: getSongUrl(prevSong) },
      currentIndex: prevIndex,
      isPlaying: true
    });
  }
}));