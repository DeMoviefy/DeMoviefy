// src/core/utils/createPoller.tsx

export function createPoller(intervalMs: number) {
  let timer: number | null = null;

  return {
    start(callback: () => void) {
      if (timer !== null) return false;

      timer = window.setInterval(callback, intervalMs);
      return true;
    },
    stop() {
      if (timer === null) return false;

      window.clearInterval(timer);
      timer = null;

      return true;
    },
  };
}