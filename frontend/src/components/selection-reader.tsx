"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, Play, CircleSlash } from "lucide-react";
import { speakText, stopSpeaking } from "@/lib/tts";
import { cn } from "@/lib/utils";

export function SelectionReader() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [isReading, setIsReading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check initial state from localStorage
    const stored = localStorage.getItem("selection-reader-enabled");
    setIsEnabled(stored === "true");

    // Listen for toggle events from AccessibilityMenu
    const handleToggle = (e: any) => {
      setIsEnabled(e.detail.enabled);
    };

    window.addEventListener("toggle-selection-reader", handleToggle);
    return () => window.removeEventListener("toggle-selection-reader", handleToggle);
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      setSelection(null);
      return;
    }

    const handleMouseUp = (e: MouseEvent) => {
      // Don't trigger if clicking inside the popup
      if (popupRef.current?.contains(e.target as Node)) return;

      // Small delay to let the selection settle
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();

        if (text && text.length > 0) {
          const range = sel?.getRangeAt(0);
          const rect = range?.getBoundingClientRect();

          if (rect) {
            setSelection({
              text,
              x: rect.left + window.scrollX + rect.width / 2,
              y: rect.top + window.scrollY - 10, // Above the selection
            });
          }
        } else {
          setSelection(null);
        }
      }, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking outside, clear selection
      if (!popupRef.current?.contains(e.target as Node)) {
        // setSelection(null); // Keep it until mouseUp re-evaluates
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isEnabled]);

  const handleRead = async () => {
    if (!selection) return;
    setIsReading(true);
    await speakText(selection.text);
    setIsReading(false);
    setSelection(null); // Hide after reading
  };

  if (!isEnabled || !selection) return null;

  return (
    <div
      ref={popupRef}
      className="absolute z-[9999] pointer-events-auto animate-in zoom-in-95 fade-in duration-200"
      style={{
        left: selection.x,
        top: selection.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="flex items-center gap-1 bg-primary text-primary-foreground rounded-full p-1 pl-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-primary-foreground/20">
        <span className="text-[10px] font-bold uppercase tracking-wider mr-1">Read Selection</span>
        <button
          onClick={handleRead}
          disabled={isReading}
          className="p-1.5 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full transition-colors"
        >
          {isReading ? (
             <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
          ) : (
            <Play className="w-4 h-4 fill-primary-foreground text-primary-foreground" />
          )}
        </button>
      </div>
      {/* Arrow */}
      <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-primary rotate-45" />
    </div>
  );
}
