import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  mode: "dark" | "light";
}

const getInitialTheme = (): "dark" | "light" => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme") as "dark" | "light";
    return saved || "light";
  }
  return "light";
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", state.mode);
      }
    },
    setTheme: (state, action: PayloadAction<"dark" | "light">) => {
      state.mode = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload);
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
