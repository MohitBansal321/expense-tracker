// Auth Layout with modern design - supports both MUI and new Shadcn pages
import { BarChart3, Shield, Zap } from "lucide-react";

export default function AuthLayout({ children }) {
    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Hero / Visuals */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white p-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                        backgroundSize: "30px 30px",
                    }}
                />

                <div className="relative z-10 max-w-lg space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-5xl font-extrabold drop-shadow-lg">
                            Master Your Money.
                        </h1>
                        <p className="text-xl opacity-90 font-light">
                            Join thousands of users controlling their financial future with AI-powered insights.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-6 pt-8">
                        <div className="text-center space-y-2">
                            <BarChart3 className="h-10 w-10 mx-auto opacity-90" />
                            <p className="text-sm font-medium">Smart Analytics</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Shield className="h-10 w-10 mx-auto opacity-90" />
                            <p className="text-sm font-medium">Secure Data</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Zap className="h-10 w-10 mx-auto opacity-90" />
                            <p className="text-sm font-medium">Fast Entry</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}
