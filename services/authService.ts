export const authService = {
  login: async (credentials: { email: string; password: any }) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw the error message from the server or a fallback
      throw new Error(data.error || "Login failed");
    }

    return data;
  },

  register: async (userData: any) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Registation failed");
    }

    return data;
  },

  logout: async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Logout failed!");
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user-info");

    return true;
  },
};
