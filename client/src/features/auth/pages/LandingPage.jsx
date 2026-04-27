import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2, CloudUpload, Mic, Receipt, LineChart, Shield, TrendingUp } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function Landing() {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    return (
        <div className="overflow-x-hidden min-h-screen bg-white dark:bg-gray-950">
            {/* Hero Section */}
            <section className="relative pt-24 pb-32 md:pt-36 md:pb-40 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(37,99,235,0.1)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.15)_0%,transparent_60%)]" />
                </div>
                
                <div className="container relative z-10 mx-auto text-center max-w-5xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent drop-shadow-sm">
                        Master Your Money with Automation
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Stop manual data entry. Use AI-powered voice input, receipt scanning, and recurring transactions to track expenses effortlessly.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {isAuthenticated ? (
                            <Link to="/dashboard">
                                <Button size="lg" className="rounded-full px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-primary/25 transition-all">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register">
                                    <Button size="lg" className="rounded-full px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-primary/25 transition-all">
                                        Get Started Free
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg font-semibold border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                                        Login
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Problem vs Solution */}
            <section className="py-20 md:py-32 px-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-5">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                                Tired of the chaos?
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Manual spreadsheets, lost receipts, and forgetting to log expenses lead to inaccurate financial data and stress.
                            </p>
                            
                            <ul className="space-y-4">
                                {[
                                    "Manual data entry errors",
                                    "Lost paper receipts",
                                    "Forgotten subscriptions",
                                    "Unclear spending habits",
                                ].map((text) => (
                                    <li key={text} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold leading-none">
                                            ✕
                                        </span>
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="hidden md:flex md:col-span-2 justify-center items-center text-gray-300 dark:text-gray-700">
                            <Sparkles className="w-16 h-16" />
                        </div>
                        
                        <div className="md:col-span-5">
                            <div className="rounded-2xl p-8 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/10 dark:border-primary/20 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                <h3 className="text-2xl font-bold mb-4 text-primary relative z-10">
                                    The Automated Way
                                </h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-8 relative z-10 leading-relaxed">
                                    Experience financial clarity with automated tools that do the heavy lifting for you.
                                </p>
                                
                                <ul className="space-y-4 relative z-10">
                                    {[
                                        "Receipt scanning with OCR",
                                        "One-click voice entry",
                                        "Auto-recurring expenses",
                                        "AI-powered duplicate check",
                                    ].map((text) => (
                                        <li key={text} className="flex items-center gap-3 text-gray-900 dark:text-gray-100 font-medium">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Showcase */}
            <section className="py-20 md:py-32 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Smart Entry Features</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">Three ways to add transactions without typing</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Receipt className="w-10 h-10" />,
                                title: "Receipt Scanner",
                                desc: "Upload a photo of your receipt. We extract the date, merchant, and amount automatically.",
                            },
                            {
                                icon: <Mic className="w-10 h-10" />,
                                title: "Voice Input",
                                desc: 'Just say "Spent 25 dollars on lunch" and we turn speech into structured data.',
                            },
                            {
                                icon: <CloudUpload className="w-10 h-10" />,
                                title: "CSV Import",
                                desc: "Drag and drop your bank statements to import hundreds of transactions at once.",
                            },
                        ].map((feature, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="w-16 h-16 rounded-2xl bg-primary/5 dark:bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Analytics Preview */}
            <section className="py-20 md:py-32 px-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-primary font-bold uppercase tracking-wider mb-2 text-sm">
                                Powerful Insights
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                                See where your money goes
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-xl">
                                Visual reports help you identify spending patterns, understand your habits, and find incredible opportunities to save.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { icon: <TrendingUp className="w-6 h-6" />, text: "Monthly Trends" },
                                    { icon: <LineChart className="w-6 h-6" />, text: "Budget Tracking" },
                                    { icon: <Shield className="w-6 h-6" />, text: "Secure Data" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="text-primary">{item.icon}</div>
                                        <span className="font-semibold text-gray-900 dark:text-gray-200">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 rounded-[2rem] blur-3xl transform -rotate-6"></div>
                            <div className="relative aspect-auto sm:aspect-square md:aspect-[4/3] bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 flex flex-col gap-4 overflow-hidden">
                                <div className="flex gap-4">
                                    <div className="flex-1 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse delay-75"></div>
                                    <div className="flex-1 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse delay-150"></div>
                                    <div className="flex-1 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse delay-300"></div>
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-end justify-between gap-2">
                                    {[40, 60, 45, 75, 50, 85, 65, 90, 55, 70].map((h, i) => (
                                        <div key={i} className="w-full bg-primary/80 hover:bg-primary rounded-t-sm transition-all duration-500 cursor-pointer" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
