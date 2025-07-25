import { create } from "zustand";

const API = process.env.REACT_APP_API_BASE;

export const useQrLoginStore = create((set, get) => ({
  sid: null,             // session_id from bridge
  status: "idle",        // idle | pending | authenticated

  init: async () => {
    const res = await fetch(`${API}/qr-login/init`, { method: "POST" });
    const { session_id } = await res.json();
    set({ sid: session_id, status: "pending" });
    get().poll();        // start polling automatically
    return session_id;
  },

  poll: () => {
    const { sid } = get();
    const timer = setInterval(async () => {
      const r = await fetch(`${API}/qr-login/status/${sid}`);
      const { status } = await r.json();
      if (status === "authenticated") {
        clearInterval(timer);
        set({ status });
      }
    }, 2000);
  },

  reset: () => set({ sid: null, status: "idle" })
}));
