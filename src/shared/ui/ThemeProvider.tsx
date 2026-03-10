"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "bumblebee" | "forest";

interface ThemeContextType {
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "forest") {
      setIsDark(true);
    } else if (saved === "bumblebee") {
      setIsDark(false);
    } else {
      // 저장된 테마 없음: 시스템 설정으로 초기화 (CSS --prefersdark와 동기화)
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  const setTheme = (theme: Theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    setIsDark(theme === "forest");
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
