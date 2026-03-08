"use client";

import { useState, useRef, useEffect } from 'react';
import { Accessibility, Type, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccessibilityMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [textSize, setTextSize] = useState<number>(16);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleTextResize = (size: number) => {
        setTextSize(size);
        document.documentElement.style.fontSize = `${size}px`;
    };

    useEffect(() => {
        const stored = localStorage.getItem("selection-reader-enabled");
        setIsSpeaking(stored === "true");
    }, []);

    const toggleSelectionReader = () => {
        const newState = !isSpeaking;
        setIsSpeaking(newState);
        localStorage.setItem("selection-reader-enabled", String(newState));
        
        // Dispatch custom event for the SelectionReader component to listen to
        window.dispatchEvent(new CustomEvent("toggle-selection-reader", { 
            detail: { enabled: newState } 
        }));
    };

    return (
        <div className="relative" ref={menuRef}>
            <Button
                variant="outline"
                className="rounded-full bg-background border-border hover:bg-muted flex items-center gap-2 px-4 shadow-sm"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Accessibility Menu"
            >
                <Accessibility className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline-block font-medium">Accessibility</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg p-4 z-50 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                            <Type className="w-4 h-4" />
                            <span>Text Size</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 bg-background p-1 rounded-lg border border-border">
                            <button
                                onClick={() => handleTextResize(14)}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${textSize === 14 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                            >
                                A-
                            </button>
                            <button
                                onClick={() => handleTextResize(16)}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${textSize === 16 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                            >
                                A
                            </button>
                            <button
                                onClick={() => handleTextResize(18)}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${textSize === 18 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                            >
                                A+
                            </button>
                            <button
                                onClick={() => handleTextResize(20)}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${textSize === 20 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
                            >
                                ++
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                            <Volume2 className="w-4 h-4" />
                            <span>Highlight Reader</span>
                        </div>
                        <Button
                            variant={isSpeaking ? "destructive" : "default"}
                            onClick={toggleSelectionReader}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            {isSpeaking ? (
                                <> <VolumeX className="w-4 h-4" /> Disable Reader </>
                            ) : (
                                <> <Volume2 className="w-4 h-4" /> Enable Reader </>
                            )}
                        </Button>
                        <p className="text-[10px] text-muted-foreground leading-tight px-1">
                            When enabled, highlight any text on the page to hear it read aloud using AI.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
