import React, { createContext, useContext, useState, useMemo, useEffect } from "react";

const ThemeContext = createContext({
    mode: "light",
    toggleTheme: () => { },
});

export const useThemeMode = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
    const getInitialMode = () => {
        const savedMode = localStorage.getItem("themeMode");
        if (savedMode) return savedMode;
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    };

    const [mode, setMode] = useState(getInitialMode);

    useEffect(() => {
        const root = window.document.documentElement;
        if (mode === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("themeMode", mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => {
            if (!localStorage.getItem("themeMode")) {
                setMode(e.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const contextValue = useMemo(() => ({ mode, toggleTheme }), [mode]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;
