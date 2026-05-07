const API_BASE = "/api/reels";

export const reelsService = {
  // Fetch all reels
  getAllReels: async () => {
    const res = await fetch(API_BASE, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch reels");
    }

    return res.json();
  },

  // Fetch single reel
  getReelById: async (reel_id: string) => {
    const res = await fetch(`${API_BASE}/${reel_id}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch reel");
    }

    return res.json();
  },

  // Create new reel
  createReel: async (formData: FormData) => {
    const res = await fetch(API_BASE, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create reel");
    }

    return res.json();
  },

  // Update reel
  updateReel: async (reel_id: string, formData: FormData) => {
    const res = await fetch(`${API_BASE}/${reel_id}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update reel");
    }

    return res.json();
  },

  // Delete reel
  deleteReel: async (reel_id: string) => {
    const res = await fetch(`${API_BASE}/${reel_id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete reel");
    }

    return res.json();
  },
};
