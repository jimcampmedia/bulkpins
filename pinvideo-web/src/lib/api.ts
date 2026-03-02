const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return res;
}

export const api = {
  // Auth
  register: (email: string, password: string, name: string) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request("/api/auth/me"),

  // Videos
  generateVideo: (image: File, description: string, sourceUrl: string) => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);
    formData.append("source_url", sourceUrl);
    return request("/api/videos/generate", {
      method: "POST",
      body: formData,
    });
  },

  getVideos: () => request("/api/videos"),

  getVideo: (id: string) => request(`/api/videos/${id}`),

  updateVideo: (id: string, data: Record<string, string>) =>
    request(`/api/videos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteVideo: (id: string) =>
    request(`/api/videos/${id}`, { method: "DELETE" }),

  // Pinterest
  getPinterestAuth: () => request("/api/pinterest/auth"),
  getPinterestStatus: () => request("/api/pinterest/status"),
  disconnectPinterest: () =>
    request("/api/pinterest/disconnect", { method: "POST" }),
  getPinterestBoards: () => request("/api/pinterest/boards"),

  // Schedule
  createSchedule: (data: {
    video_id: string;
    board_id: string;
    board_name?: string;
    title?: string;
    description?: string;
    link?: string;
    scheduled_at?: string;
  }) =>
    request("/api/schedule", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSchedules: () => request("/api/schedule"),

  updateSchedule: (id: string, data: Record<string, string>) =>
    request(`/api/schedule/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteSchedule: (id: string) =>
    request(`/api/schedule/${id}`, { method: "DELETE" }),

  // Billing
  createCheckout: (plan: string) =>
    request("/api/billing/create-checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),

  getSubscription: () => request("/api/billing/subscription"),

  getPortal: () =>
    request("/api/billing/portal", { method: "POST" }),
};
