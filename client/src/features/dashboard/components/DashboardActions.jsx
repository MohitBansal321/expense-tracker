import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { PlusCircle, Receipt, Wallet } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { getBudgetAlerts } from "../../../services/budget.service";

export default function DashboardActions({ onAddTransaction }) {
    const [healthScore, setHealthScore] = useState(100);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateHealthScore();
    }, []);

    async function calculateHealthScore() {
        try {
            const result = await getBudgetAlerts();

            if (result.success) {
                // Determine score deduction based on alerts
                let deduction = 0;
                result.data.forEach(alert => {
                    if (alert.severity === 'error') deduction += 20; // Heavy penalty (over budget)
                    else deduction += 5; // Warning penalty (near limit)
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
                            className="h-auto py-6 flex flex-col items-center gap-3 rounded-2xl hover:bg-primary/5 hover:border-primary/20 dark:hover:bg-primary/10 dark:hover:border-primary/30"
                        >
                            <PlusCircle className="w-8 h-8 text-primary" />
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Add Expense</span>
                        </Button>
                        
                        <Link to="/smart-entry" className="block outline-none">
                            <Button
                                variant="outline"
                                className="w-full h-auto py-6 flex flex-col items-center gap-3 rounded-2xl hover:bg-primary/5 hover:border-primary/20 dark:hover:bg-primary/10 dark:hover:border-primary/30"
                            >
                                <Receipt className="w-8 h-8 text-primary" />
                                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Scan Receipt</span>
                            </Button>
                        </Link>
                        
                        <Link to="/budget" className="block outline-none">
                            <Button
                                variant="outline"
                                className="w-full h-auto py-6 flex flex-col items-center gap-3 rounded-2xl hover:bg-primary/5 hover:border-primary/20 dark:hover:bg-primary/10 dark:hover:border-primary/30"
                            >
                                <Wallet className="w-8 h-8 text-primary" />
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
