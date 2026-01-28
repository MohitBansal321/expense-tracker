// Import necessary modules and libraries from React and your application
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AppBar from "./components/AppBar";
import MainBottomNav from "./components/MainBottomNav";
import { setUser } from "./store/auth.js";

function App() {
  const location = useLocation();
  // Retrieve the JWT token from cookies
  const token = Cookies.get("token");

  // State to track loading state
  const [isLoading, setIsLoading] = useState(true);

  // Redux dispatch function for setting the user
  const dispatch = useDispatch();

  // Function to fetch user information from the server
  async function fetchUser() {
    setIsLoading(true);

    if (token === null || token === undefined) {
      setIsLoading(false);
      return;
    }
    // Send a request to the server to retrieve user information
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      // If the request is successful, parse the user data and dispatch it to Redux
      const user = await res.json();
      dispatch(setUser(user));
    }
    setIsLoading(false);
  }

  // Use useEffect to fetch user information when the component mounts
  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If still loading, display a loading message
  if (isLoading) {
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
