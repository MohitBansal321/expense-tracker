import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { 
    LayoutDashboard, 
    History, 
    PlusCircle, 
    Wallet, 
    User
} from "lucide-react";
import { cn } from "../../lib/utils.js";

export default function MainBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const [activeTab, setActiveTab] = useState(0);

    // Sync state with current location
    useEffect(() => {
        const path = location.pathname;
        if (path === "/dashboard") setActiveTab(0);
        else if (path === "/transactions") setActiveTab(1);
        else if (path === "/smart-entry") setActiveTab(2);
        else if (path === "/budget") setActiveTab(3);
        else if (path === "/settings") setActiveTab(4);
        else setActiveTab(0);
    }, [location.pathname]);

    const navItems = [
        { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
        { label: "History", icon: History, path: "/transactions" },
        { label: "Add", icon: PlusCircle, path: "/smart-entry", primary: true },
        { label: "Budget", icon: Wallet, path: "/budget" },
        { label: "Profile", icon: User, path: "/settings" },
    ];

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] pb-[env(safe-area-inset-bottom)]">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-around h-16 px-2">
                {navItems.map((item, index) => {
                    const isActive = activeTab === index;
                    const Icon = item.icon;

                    if (item.primary) {
                        return (
                            <button
                                key={index}
                                onClick={() => navigate(item.path)}
                                className="flex flex-col items-center justify-center -translate-y-5 group"
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ring-4 ring-white dark:ring-gray-900 group-active:scale-95",
                                    isActive 
                                        ? "bg-primary shadow-primary/40" 
                                        : "bg-primary/80 shadow-primary/20 group-hover:bg-primary"
                                )}>
                                    <Icon className="w-8 h-8 text-primary-foreground" />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold mt-1 transition-colors",
                                    isActive ? "text-primary" : "text-gray-400"
                                )}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center justify-center w-16 h-full transition-all active:scale-90"
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-colors",
                                isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                            )}>
                                <Icon className={cn("w-6 h-6", isActive && "fill-current/10")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium mt-0.5 transition-colors",
                                isActive ? "text-primary font-bold" : "text-gray-400"
                            )}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="w-1 h-1 rounded-full bg-primary mt-1" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
