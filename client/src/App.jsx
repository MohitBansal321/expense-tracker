// Import necessary modules and libraries from React and your application
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AppBar from "./components/layout/AppBar.jsx";
import MainBottomNav from "./components/layout/MainBottomNav.jsx";
import { useAuth } from "./hooks/useAuth.js";

function App() {
    const location = useLocation();
    const { fetchUser, isLoading: authLoading } = useAuth();

    // Use useEffect to fetch user information when the component mounts
    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // If still loading, display a loading message
    if (authLoading) {
        return <p>Loading ...</p>;
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
                    style={{ width: '100%' }}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
            <MainBottomNav />
        </>
    );
}

export default App;
