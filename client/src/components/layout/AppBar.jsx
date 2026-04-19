// Modern navigation bar with Shadcn UI styling
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useThemeMode } from "../../context/ThemeContext.js";
import { logout } from "../../store/auth.js";
import NotificationBell from "../common/NotificationBell.jsx";
import { Button } from "../ui/button.jsx";

export default function ButtonAppBar() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const { mode, toggleTheme } = useThemeMode();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  function _logout() {
    Cookies.remove("token");
    dispatch(logout());
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto flex h-14 items-center px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl mr-6 hover:opacity-80 transition-opacity"
        >
          <span>💰</span>
          <span>Financh</span>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1 flex-1">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link to="/transactions">
              <Button variant="ghost" size="sm">
                Transactions
              </Button>
            </Link>
            <Link to="/budget">
              <Button variant="ghost" size="sm">
                Budget
              </Button>
            </Link>
            <Link to="/recurring">
              <Button variant="ghost" size="sm">
                Recurring
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="ghost" size="sm">
                Reports
              </Button>
            </Link>
            <Link to="/smart-entry">
              <Button variant="ghost" size="sm">
                Smart Entry
              </Button>
            </Link>
            <Link to="/category">
              <Button variant="ghost" size="sm">
                Category
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="sm">
                Settings
              </Button>
            </Link>
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={mode === "dark" ? "Light Mode" : "Dark Mode"}
            className="transition-transform hover:rotate-12"
          >
            {mode === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notification Bell */}
          {isAuthenticated && <NotificationBell />}

          {/* Auth buttons */}
          {isAuthenticated ? (
            <>
              <Button variant="outline" size="sm" onClick={_logout} className="hidden md:inline-flex">
                Logout
              </Button>
              {/* Mobile hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile slide-out menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur animate-in slide-in-from-top-2">
          <nav className="flex flex-col p-4 gap-1">
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/transactions", label: "Transactions" },
              { to: "/budget", label: "Budget" },
              { to: "/recurring", label: "Recurring" },
              { to: "/reports", label: "Reports" },
              { to: "/smart-entry", label: "Smart Entry" },
              { to: "/category", label: "Categories" },
              { to: "/settings", label: "Settings" },
            ].map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="border-t mt-2 pt-2">
              <Button variant="outline" className="w-full" onClick={() => { _logout(); setMobileMenuOpen(false); }}>
                Logout
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
