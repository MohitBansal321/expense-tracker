import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { PlusCircle, Receipt, Wallet } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function DashboardActions({ onAddTransaction }) {
    const [healthScore, setHealthScore] = useState(100);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateHealthScore();
    }, []);

    async function calculateHealthScore() {
        const token = Cookies.get("token");
        try {
            // Get alerts to check for budget violations
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/budget/alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                // Determine score deduction based on alerts
                let deduction = 0;
                data.data.forEach(alert => {
                    if (alert.isOverBudget) deduction += 20; // Heavy penalty
                    else deduction += 5; // Warning penalty
                });

                // Cap the lowest score at 0
                setHealthScore(Math.max(0, 100 - deduction));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getScoreColorClass = (score) => {
        if (score >= 80) return "text-green-500"; // Green
        if (score >= 50) return "text-orange-500"; // Orange
        return "text-red-500"; // Red
    };

    // Calculate SVG circle properties
    const strokeWidth = 8;
    const radius = 50 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (healthScore / 100) * circumference;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="md:col-span-2">
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 h-full">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            onClick={onAddTransaction}
                            className="h-auto py-6 flex flex-col items-center gap-3 rounded-2xl hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-800"
                        >
                            <PlusCircle className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Add Expense</span>
                        </Button>
                        
                        <Link to="/smart-entry" className="block outline-none">
                            <Button
                                variant="outline"
                                className="w-full h-auto py-6 flex flex-col items-center gap-3 rounded-2xl hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20 dark:hover:border-purple-800"
                            >
                                <Receipt className="w-8 h-8 text-purple-600 dark:text-purple-500" />
                                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Scan Receipt</span>
                            </Button>
                        </Link>
                        
                        <Link to="/budget" className="block outline-none">
                            <Button
                                variant="outline"
                                className="w-full h-auto py-6 flex flex-col items-center gap-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800"
                            >
                                <Wallet className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">New Budget</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Financial Health Score */}
            <div className="md:col-span-1">
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 h-full flex flex-col items-center justify-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 self-start w-full text-center">
                        Financial Health
                    </h2>

                    <div className="relative inline-flex items-center justify-center mb-4">
                        <svg className="w-32 h-32 transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                className="text-gray-100 dark:text-gray-800"
                                strokeWidth={strokeWidth}
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="64"
                                cy="64"
                            />
                            {/* Progress circle */}
                            <circle
                                className={`transition-all duration-1000 ease-out ${getScoreColorClass(healthScore)}`}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={loading ? circumference : strokeDashoffset}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="64"
                                cy="64"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-extrabold text-gray-500 dark:text-gray-400">
                                {loading ? "..." : healthScore}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
                        Based on budget adherence
                    </p>
                </div>
            </div>
        </div>
    );
}
