"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";
type DaisyTheme = "bumblebee" | "forest";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  if (theme === "system") {
    return prefersDark ? "dark" : "light";
  }
  return theme;
}

function toDaisyTheme(theme: ResolvedTheme): DaisyTheme {
  return theme === "dark" ? "forest" : "bumblebee";
}

export default function ThemeProvider({
  initialTheme = "system",
  children,
}: {
  initialTheme?: Theme;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    initialTheme === "dark" ? "dark" : "light",
  );

  // 초기 로드: localStorage에서 저장된 테마 읽기
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    } else if (initialTheme !== "system") {
      setThemeState("system");
    }
  }, [initialTheme]);

  // theme 변경 시 실제 적용
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = resolveTheme(theme, mq.matches);
      setResolvedTheme(resolved);
      if (theme === "system") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", toDaisyTheme(resolved));
      }
      document.documentElement.style.colorScheme = resolved;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (t === "system") {
      localStorage.removeItem("theme");
      document.cookie = "theme=; path=/; max-age=0; samesite=lax";
    } else {
      localStorage.setItem("theme", t);
      document.cookie = `theme=${t}; path=/; max-age=31536000; samesite=lax`;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
