import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // Data
  categories: [],
  subcategories: [],
  tasks: [],
  todayLogs: [],

  // UI
  loading: false,
  activeCategory: null,
  sidebarOpen: true,

  // Timer
  timer: {
    isRunning: false,
    isPaused: false,
    taskId: null,
    startTime: null,
    elapsed: 0,
    intervalId: null,
  },

  // Actions
  setCategories: (categories) => set({ categories }),
  setSubcategories: (subcategories) => set({ subcategories }),
  setTasks: (tasks) => set({ tasks }),
  setTodayLogs: (todayLogs) => set({ todayLogs }),
  setLoading: (loading) => set({ loading }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Timer actions
  startTimer: (taskId) => {
    const { timer } = get();
    if (timer.intervalId) clearInterval(timer.intervalId);

    const startTime = Date.now() - timer.elapsed * 1000;
    const intervalId = setInterval(() => {
      set((state) => ({
        timer: {
          ...state.timer,
          elapsed: Math.floor((Date.now() - startTime) / 1000),
        },
      }));
    }, 1000);

    set({
      timer: {
        isRunning: true,
        isPaused: false,
        taskId,
        startTime,
        elapsed: timer.elapsed,
        intervalId,
      },
    });
  },

  pauseTimer: () => {
    const { timer } = get();
    if (timer.intervalId) clearInterval(timer.intervalId);
    set((state) => ({
      timer: { ...state.timer, isRunning: false, isPaused: true, intervalId: null },
    }));
  },

  resumeTimer: () => {
    const { timer } = get();
    get().startTimer(timer.taskId);
  },

  stopTimer: () => {
    const { timer } = get();
    if (timer.intervalId) clearInterval(timer.intervalId);
    const elapsed = timer.elapsed;
    set({
      timer: {
        isRunning: false,
        isPaused: false,
        taskId: null,
        startTime: null,
        elapsed: 0,
        intervalId: null,
      },
    });
    return Math.floor(elapsed / 60); // return minutes
  },

  resetTimer: () => {
    const { timer } = get();
    if (timer.intervalId) clearInterval(timer.intervalId);
    set({
      timer: {
        isRunning: false,
        isPaused: false,
        taskId: null,
        startTime: null,
        elapsed: 0,
        intervalId: null,
      },
    });
  },
}));
