// Import necessary modules and libraries from React and your application
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import AppBar from "./components/AppBar";
import { setUser } from "./store/auth.js";

function App() {
  // Retrieve the JWT token from cookies
  const token = Cookies.get("token");

  // State to track loading state
  const [isLoading, setIsLoading] = useState(true);

  // Redux dispatch function for setting the user
  const dispatch = useDispatch();

  // Function to fetch user information from the server
  async function fetchUser() {
    setIsLoading(true);

    if(token===null || token===undefined) {
      setIsLoading(false);
      return;
    }
    // Send a request to the server to retrieve user information
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/user`, {
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
      <Outlet />
    </>
  );
}

export default App;
