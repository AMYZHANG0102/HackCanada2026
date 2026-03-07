import { useState, useRef, useEffect } from 'react';
import { Accessibility, Type, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

export default function AccessibilityMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [textSize, setTextSize] = useState<number>(16); // default 16px
    const [isSpeaking, setIsSpeaking] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle Text Resizing
    const handleTextResize = (size: number) => {
        setTextSize(size);
        document.documentElement.style.fontSize = `${size}px`;
    };

    // Handle Text-to-Speech using ElevenLabs (with native fallback)
    const handleTTS = async () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const textToRead = "Welcome to Maple Margin. Navigating the 2026 Tariff Shock in real time.";
        setIsSpeaking(true);

        try {
            // Attempt ElevenLabs API call
            const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

            if (!apiKey) {
                throw new Error("No ElevenLabs API key found. Falling back to native browser speech.");
            }

            const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Default Rachel voice
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textToRead,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: { stability: 0.5, similarity_boost: 0.5 }
                })
            });

            if (!response.ok) throw new Error("ElevenLabs API failed");

            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);

            audio.onended = () => setIsSpeaking(false);
            audio.play();

        } catch (error) {
            console.warn(error);
            // Fallback to Native Browser SpeechSynthesis
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
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

                    {/* Text Size Control */}
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

                    {/* Text to Speech Control */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                            <Volume2 className="w-4 h-4" />
                            <span>Screen Reader</span>
                        </div>
                        <Button
                            variant={isSpeaking ? "destructive" : "default"}
                            onClick={handleTTS}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            {isSpeaking ? (
                                <> <VolumeX className="w-4 h-4" /> Stop Reading </>
                            ) : (
                                <> <Volume2 className="w-4 h-4" /> Read Page Context </>
                            )}
                        </Button>
                    </div>

                </div>
            )}
        </div>
    );
}
