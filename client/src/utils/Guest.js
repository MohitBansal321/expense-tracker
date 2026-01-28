// Import necessary modules and libraries from React and React Router
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// A custom component for rendering content only for guests (non-authenticated users)
export default function Guest({ children }) {
  // Retrieve authentication information from Redux store
  const auth = useSelector((state) => state.auth);

  // Check if the user is not authenticated (a guest)
  // If not authenticated, render the children (content for guests)
  // If authenticated, redirect the user to the home page
  return !auth.isAuthenticated ? (
    children
  ) : (
    <Navigate to="/dashboard" replace={true} /> // Redirect to the dashboard
  );
}
