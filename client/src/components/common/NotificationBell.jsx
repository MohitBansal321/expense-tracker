import React, { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, AlertCircle } from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getBudgetAlerts } from "../../services/budget.service";

export default function NotificationBell() {
    const [alerts, setAlerts] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAlerts();
        
        // Close dropdown when clicking outside
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function fetchAlerts() {
        try {
            const result = await getBudgetAlerts();
            if (result.success) {
                setAlerts(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch alerts", error);
        }
    }

    const toggleDropdown = () => {
        if (!open) {
            fetchAlerts(); // Refresh on open
        }
        setOpen(!open);
    };

    const handleItemClick = () => {
        setOpen(false);
        navigate("/budget");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                className="relative p-2 text-gray-600 hover:text-foreground dark:text-gray-300 dark:hover:text-white focus:outline-none rounded-full hover:bg-muted/80 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6" />
                {alerts.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-ember rounded-full">
                        {alerts.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-card ember-glow rounded-xl shadow-xl z-50 border-none overflow-hidden"
                    >
                        <div className="p-4 flex justify-between items-center bg-muted border-b border-border">
                            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                            {alerts.length > 0 && (
                                <span className="text-xs font-semibold text-ember bg-ember/10 px-2 py-1 rounded-full">
                                    {alerts.length} Alerts
                                </span>
                            )}
                        </div>
                        
                        <div className="max-h-[350px] overflow-y-auto">
                            {alerts.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No new notifications
                                </div>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {alerts.map((alert) => (
                                        <li key={alert.budgetId}>
                                            <button 
                                                onClick={handleItemClick}
                                                className="w-full text-left flex items-start gap-3 p-4 hover:bg-muted/80 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800/50"
                                            >
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {alert.severity === 'error' ? (
                                                        <AlertCircle className="w-5 h-5 text-ember" />
                                                    ) : (
                                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {alert.categoryName}: {alert.severity === 'error' ? 'Over Budget' : 'Near Limit'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Spent ${alert.currentSpending.toLocaleString()} of ${alert.amount.toLocaleString()} ({alert.percentageUsed}%)
                                                    </p>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
