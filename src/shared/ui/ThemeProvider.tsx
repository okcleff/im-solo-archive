"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

export { useTheme };

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark"]}
      value={{ light: "bumblebee", dark: "forest" }}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
