import { create } from 'zustand';

// Ganti URL ini dengan URL Railway lu
const BACKEND_URL = "https://music-app-production-278c.up.railway.app";

export const usePlayerStore = create((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [], 
  currentIndex: -1,

  playSong: (song, queue = [], index = -1) => set({
    currentSong: song,
    isPlaying: true,
    queue: queue.length > 0 ? queue : get().queue,
    currentIndex: index !== -1 ? index : get().currentIndex,
  }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  // 🔥 FUNGSI REAL NEXT SONG 🔥
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
      currentSong: { ...nextSong, url: `${BACKEND_URL}/api/audio?id=${nextSong.id}` },
      currentIndex: nextIndex,
      isPlaying: true
    });
  },

  // 🔥 FUNGSI REAL PREV SONG 🔥
  playPrev: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : queue.length - 1;
    const prevSong = queue[prevIndex];
    set({
      currentSong: { ...prevSong, url: `${BACKEND_URL}/api/audio?id=${prevSong.id}` },
      currentIndex: prevIndex,
      isPlaying: true
    });
  }
}));