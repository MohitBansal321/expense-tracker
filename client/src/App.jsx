// Import necessary modules and libraries from React and your application
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AppBar from "./components/layout/AppBar.jsx";
import MainBottomNav from "./components/layout/MainBottomNav.jsx";
import { useAuth } from "./hooks/useAuth.js";

function App() {
    const location = useLocation();
    const [authReady, setAuthReady] = useState(false);
    const { fetchUser, isLoading: authLoading } = useAuth();

    useEffect(() => {
        let isMounted = true;

        async function initializeAuth() {
            try {
                await fetchUser();
            } finally {
                if (isMounted) {
                    setAuthReady(true);
                }
            }
        }

        initializeAuth();

        return () => {
            isMounted = false;
        };
    }, [fetchUser]);

    if (!authReady || authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
                    <p className="text-sm text-muted-foreground">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    // Render the AppBar and the Router Outlet for rendering nested routes
    return (
        <>
            <AppBar />
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: "100%" }}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
            <MainBottomNav />
        </>
    );
}

export default App;
