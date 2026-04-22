import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Landmark, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

const steps = [
    {
        label: "Welcome to Expensor",
        description: "Let's get your finances on autopilot. We'll help you track expenses, set budgets, and reach your saving goals.",
        icon: <Sparkles className="w-16 h-16 text-blue-600" />,
    },
    {
        label: "Set a Monthly Budget",
        description: "A budget is the first step to financial freedom. Start by setting a realistic monthly limit.",
        icon: <Landmark className="w-16 h-16 text-purple-600" />,
        action: (
            <Link to="/budget" className="no-underline">
                <Button variant="outline" size="sm">
                    Go to Budget Settings
                </Button>
            </Link>
        ),
    },
    {
        label: "You're Ready!",
        description: "Start by adding your first transaction. Use the Smart Entry features for quick logging.",
        icon: <CheckCircle2 className="w-16 h-16 text-green-600" />,
        action: (
            <Link to="/smart-entry" className="no-underline">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Try Smart Entry
                </Button>
            </Link>
        ),
    },
];

export default function WelcomeTour() {
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem("hasSeenTour");
        if (!hasSeenTour) {
            setTimeout(() => setOpen(true), 1000);
        }
    }, []);

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem("hasSeenTour", "true");
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen && activeStep === steps.length - 1) {
                handleClose();
            }
        }}>
            <DialogContent className="sm:max-w-md text-center flex flex-col items-center py-10 px-6">
                <div className="mb-6 flex justify-center items-center">
                    {steps[activeStep].icon}
                </div>
                
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-center mb-2">
                        {steps[activeStep].label}
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-500 mb-6">
                        {steps[activeStep].description}
                    </DialogDescription>
                </DialogHeader>

                {steps[activeStep].action && (
                    <div className="mt-2 mb-4">
                        {steps[activeStep].action}
                    </div>
                )}

                <div className="flex items-center justify-center gap-2 mt-6 mb-8 w-full max-w-[200px] mx-auto">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.label}>
                            <div className={`w-3 h-3 rounded-full ${index === activeStep ? 'bg-blue-600' : index < activeStep ? 'bg-blue-300' : 'bg-gray-200'}`} />
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 ${index < activeStep ? 'bg-blue-300' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <DialogFooter className="w-full sm:justify-center flex mt-2">
                    {activeStep === steps.length - 1 ? (
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={handleClose}>
                            Get Started
                        </Button>
                    ) : (
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={handleNext}>
                            Next
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
