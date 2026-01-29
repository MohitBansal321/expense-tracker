// Import necessary modules and components from React Router and your application
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "./App";
import CheckAuth from "./utils/CheckAuth";
import Guest from "./utils/Guest";

// Lazy load pages
const Budget = lazy(() => import("./pages/Budget"));
const Category = lazy(() => import("./pages/Category"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Home = lazy(() => import("./pages/Home"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const RecurringTransactions = lazy(() => import("./pages/RecurringTransactions"));
const Register = lazy(() => import("./pages/Register"));
const Reports = lazy(() => import("./pages/Reports"));
const SmartEntry = lazy(() => import("./pages/SmartEntry"));
const Settings = lazy(() => import("./pages/Settings"));

const Loading = () => <div className="p-4 text-center">Loading...</div>;

// Create and export a BrowserRouter configuration
export default createBrowserRouter([
  {
    element: <App />, // The top-level component for your application
    children: [
      {
        path: "/",
        element: <Suspense fallback={<Loading />}><Landing /></Suspense>,
      },
      {
        path: "/dashboard",
        element: (
          <CheckAuth>
            <Suspense fallback={<Loading />}><Dashboard /></Suspense>
          </CheckAuth>
        ),
      },
      {
        path: "/transactions",
        element: (
          <CheckAuth>
            <Suspense fallback={<Loading />}><Home /></Suspense>
          </CheckAuth>
        ),
      },
      {
        path: "/budget",
        element: (
          <CheckAuth>
            <Suspense fallback={<Loading />}><Budget /></Suspense>
          </CheckAuth>
        ),
      },
      {
        path: "/recurring",
        element: (
          <CheckAuth>
            <Suspense fallback={<Loading />}><RecurringTransactions /></Suspense>
          </CheckAuth>
        ),
      },
      {
        path: "/reports",
        element: (
          <CheckAuth>
            <Suspense fallback={<Loading />}><Reports /></Suspense>
          </CheckAuth>
        ),
      },
      {
        path: "/smart-entry",
        element: (
          <CheckAuth>
            <Suspense fallback={<Loading />}><SmartEntry /></Suspense>
          </CheckAuth>
        ),
      },
      {
        path: "/login",
        element: (
          <Guest>
            <Suspense fallback={<Loading />}><Login /></Suspense>
          </Guest>
        ),
      },
      {
        path: "/register",
        element: (
          <Guest>
            <Suspense fallback={<Loading />}><Register /></Suspense>
          </Guest>
        ),
      },
      {
        path: "/category",
        element: (
          <CheckAuth>
            <Suspense fallback={<Loading />}><Category /></Suspense>
          </CheckAuth>
        ),
      },
      {
        path: "/settings",
        element: (
          <CheckAuth>
            <Suspense fallback={<Loading />}><Settings /></Suspense>
          </CheckAuth>
        ),
      },
    ],
  },
]);




