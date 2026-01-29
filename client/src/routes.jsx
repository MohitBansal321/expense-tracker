// Import necessary modules and components from React Router and your application
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "./App.jsx";
import CheckAuth from "./utils/CheckAuth.js";
import Guest from "./utils/Guest.js";
import { ROUTES } from "./constants/routes.js";

// Lazy load pages
const LandingPage = lazy(() => import("./features/auth/pages/LandingPage.jsx"));
const LoginPage = lazy(() => import("./features/auth/pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage.jsx"));

const DashboardPage = lazy(() => import("./features/dashboard/pages/DashboardPage.jsx"));
const TransactionsPage = lazy(() => import("./features/transactions/pages/TransactionsPage.jsx"));

const BudgetPage = lazy(() => import("./features/budget/pages/BudgetPage.jsx"));
const CategoryPage = lazy(() => import("./features/categories/pages/CategoryPage.jsx"));
const RecurringPage = lazy(() => import("./features/recurring/pages/RecurringPage.jsx"));
const ReportsPage = lazy(() => import("./features/reports/pages/ReportsPage.jsx"));
const SmartEntryPage = lazy(() => import("./features/smart-entry/pages/SmartEntryPage.jsx"));
const SettingsPage = lazy(() => import("./features/settings/pages/SettingsPage.jsx"));

const Loading = () => <div className="p-4 text-center">Loading...</div>;

// Create and export a BrowserRouter configuration
export default createBrowserRouter([
    {
        element: <App />, // The top-level component for your application
        children: [
            {
                path: ROUTES.LANDING,
                element: <Suspense fallback={<Loading />}><LandingPage /></Suspense>,
            },
            {
                path: ROUTES.DASHBOARD,
                element: (
                    <CheckAuth>
                        <Suspense fallback={<Loading />}><DashboardPage /></Suspense>
                    </CheckAuth>
                ),
            },
            {
                path: ROUTES.TRANSACTIONS,
                element: (
                    <CheckAuth>
                        <Suspense fallback={<Loading />}><TransactionsPage /></Suspense>
                    </CheckAuth>
                ),
            },
            {
                path: ROUTES.BUDGET,
                element: (
                    <CheckAuth>
                        <Suspense fallback={<Loading />}><BudgetPage /></Suspense>
                    </CheckAuth>
                ),
            },
            {
                path: ROUTES.RECURRING,
                element: (
                    <CheckAuth>
                        <Suspense fallback={<Loading />}><RecurringPage /></Suspense>
                    </CheckAuth>
                ),
            },
            {
                path: ROUTES.REPORTS,
                element: (
                    <CheckAuth>
                        <Suspense fallback={<Loading />}><ReportsPage /></Suspense>
                    </CheckAuth>
                ),
            },
            {
                path: ROUTES.SMART_ENTRY,
                element: (
                    <CheckAuth>
                        <Suspense fallback={<Loading />}><SmartEntryPage /></Suspense>
                    </CheckAuth>
                ),
            },
            {
                path: ROUTES.LOGIN,
                element: (
                    <Guest>
                        <Suspense fallback={<Loading />}><LoginPage /></Suspense>
                    </Guest>
                ),
            },
            {
                path: ROUTES.REGISTER,
                element: (
                    <Guest>
                        <Suspense fallback={<Loading />}><RegisterPage /></Suspense>
                    </Guest>
                ),
            },
            {
                path: ROUTES.CATEGORIES,
                element: (
                    <CheckAuth>
                        <Suspense fallback={<Loading />}><CategoryPage /></Suspense>
                    </CheckAuth>
                ),
            },
            {
                path: ROUTES.SETTINGS,
                element: (
                    <CheckAuth>
                        <Suspense fallback={<Loading />}><SettingsPage /></Suspense>
                    </CheckAuth>
                ),
            },
        ],
    },
]);
