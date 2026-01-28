// Import necessary modules and components from React Router and your application
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Budget from "./pages/Budget";
import Category from "./pages/Category";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RecurringTransactions from "./pages/RecurringTransactions";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import SmartEntry from "./pages/SmartEntry";
import Settings from "./pages/Settings";
import CheckAuth from "./utils/CheckAuth";
import Guest from "./utils/Guest";

// Create and export a BrowserRouter configuration
export default createBrowserRouter([
  {
    element: <App />, // The top-level component for your application
    children: [
      {
        path: "/", // Landing Page (Accessible to all)
        element: <Landing />,
      },
      {
        path: "/dashboard", // Main Dashboard for Authenticated Users
        element: (
          <CheckAuth>
            <Dashboard />
          </CheckAuth>
        ),
      },
      {
        path: "/transactions", // Transactions page (was previously Home)
        element: (
          <CheckAuth>
            <Home /> {/* Render the Home component with authentication check */}
          </CheckAuth>
        ),
      },
      {
        path: "/budget", // Budget management page
        element: (
          <CheckAuth>
            <Budget /> {/* Render the Budget component with authentication check */}
          </CheckAuth>
        ),
      },
      {
        path: "/recurring", // Recurring transactions page
        element: (
          <CheckAuth>
            <RecurringTransactions />
          </CheckAuth>
        ),
      },
      {
        path: "/reports", // Reports page
        element: (
          <CheckAuth>
            <Reports />
          </CheckAuth>
        ),
      },
      {
        path: "/smart-entry", // Smart Entry page (OCR, CSV, Voice)
        element: (
          <CheckAuth>
            <SmartEntry />
          </CheckAuth>
        ),
      },
      {
        path: "/login", // Define the route path for login
        element: (
          <Guest>
            <Login /> {/* Render the Login component for guests */}
          </Guest>
        ),
      },
      {
        path: "/register", // Define the route path for registration
        element: (
          <Guest>
            <Register /> {/* Render the Register component for guests */}
          </Guest>
        ),
      },
      {
        path: "/category", // Define the route path for the category page
        element: (
          <CheckAuth>
            <Category /> {/* Render the Category component with authentication check */}
          </CheckAuth>
        ),
      },
      {
        path: "/settings",
        element: (
          <CheckAuth>
            <Settings />
          </CheckAuth>
        ),
      },
    ],
  },
]);




