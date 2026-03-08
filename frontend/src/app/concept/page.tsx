"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Link as LinkIcon, Sparkles, Loader2, RefreshCw, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  id: string;
  type: "hero" | "stat" | "grid" | "insight" | "action";
  [key: string]: any;
};

const MOCK_SLIDES: Slide[] = [
  {
    id: "s1",
    type: "hero",
    title: "US-Canada Border Crisis",
    subtitle: "Understanding the sweeping 25% tariff proposed on all Canadian imports.",
  },
  {
    id: "s2",
    type: "stat",
    value: "$2.4M",
    label: "DAILY COST ESCALATION",
    description: "The estimated daily damage to the automotive sector due to immediate tariff implementation on raw materials.",
    gradient: "from-destructive to-chart-1"
  },
  {
    id: "s3",
    type: "grid",
    title: "Systemic Shockwaves",
    description: "The tariff ripples through every sector of the North American economy in real time.",
    stats: [
      { label: "Consumer Price", value: "+14.2%" },
      { label: "Lost Jobs", value: "45,000" },
      { label: "GDP Impact", value: "-0.8%" },
    ]
  },
  {
    id: "s4",
    type: "insight",
    content: "If implemented, this tariff structure will fundamentally rewrite the 30-year equilibrium of North American trade.",
    author: "Global Economics Council"
  },
  {
    id: "s5",
    type: "action",
    title: "Strategic Recommendations",
    options: [
      "Accelerate supply chain diversification away from raw material monopolies.",
      "Hedge against CAD/USD currency fluctuations immediately.",
      "Review pricing elasticity for Q3 inventory to absorb border costs.",
    ]
  }
];

export default function ConceptPrototype() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "analyzing" | "generating" | "ready">("idle");
  const [showSlides, setShowSlides] = useState(false);
  const [slides, setSlides] = useState<Slide[]>(MOCK_SLIDES);
  
  // Slides state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    try {
      setStatus("analyzing");
      
      // Simulate API analysis delay
      await new Promise(r => setTimeout(r, 2000));
      
      setStatus("generating");
      
      // Simulate slide generation delay
      await new Promise(r => setTimeout(r, 1500));
      
      setSlides(MOCK_SLIDES);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("idle");
      alert("Analysis failed.");
    }
  };

  const startPresentation = () => {
    setShowSlides(true);
    setCurrentSlide(0);
    setIsPlaying(true);
  };

  const reset = () => {
    setStatus("idle");
    setShowSlides(false);
    setUrl("");
    setIsPlaying(false);
    setCurrentSlide(0);
  };

  // Auto-advance logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && showSlides && slides.length > 0) {
      timer = setTimeout(() => {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(c => c + 1);
        } else {
          setIsPlaying(false); // End of presentation
        }
      }, 5000); // 5 seconds per slide
    }
    return () => clearTimeout(timer);
  }, [isPlaying, showSlides, currentSlide]);

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative selection:bg-primary/20">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] mix-blend-multiply opacity-50 dark:opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-multiply opacity-50 dark:opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-full max-w-4xl z-10 flex flex-col items-center">
        
        {/* Header (only shown when idle) */}
        <div 
          className={cn(
            "text-center transition-all duration-700 ease-in-out transform",
            status === "idle" ? "translate-y-0 opacity-100 mb-12" : "-translate-y-8 opacity-0 h-0 hidden"
          )}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border text-xs font-medium text-muted-foreground mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Storytelling Prototype
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 text-balance">
            Understand any story in seconds.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Paste a news article to instantly generate an engaging, data-driven presentation of the economic impact.
          </p>
        </div>

        {/* Status Messages */}
        {status !== "idle" && !showSlides && (
          <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            {status === "analyzing" && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <h2 className="text-2xl font-medium tracking-tight">Extracting economic metrics...</h2>
                <p className="text-muted-foreground text-balance">Reading the context of the article to find the narrative.</p>
              </div>
            )}
            {status === "generating" && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-md bg-primary/30 animate-pulse" />
                  <Sparkles className="w-8 h-8 text-primary relative z-10 animate-bounce" />
                </div>
                <h2 className="text-2xl font-medium tracking-tight">Building the presentation...</h2>
                <p className="text-muted-foreground text-balance">Drafting slides, choosing metrics, and setting up the story.</p>
              </div>
            )}
            {status === "ready" && (
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-3xl font-medium tracking-tight">Your briefing is ready.</h2>
                <p className="text-muted-foreground text-balance">We transformed the article into an engaging presentation.</p>
              </div>
            )}
          </div>
        )}

        {/* The Central Input (Transitions into the player area) */}
        {!showSlides && (
          <form 
            onSubmit={handleSubmit}
            className={cn(
              "w-full transition-all duration-700 ease-in-out relative group",
              status === "idle" ? "max-w-2xl scale-100" : status === "ready" ? "max-w-xl scale-95 opacity-0 hidden" : "max-w-md scale-95 opacity-50 pointer-events-none"
            )}
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 to-chart-2/30 blur opacity-30 group-hover:opacity-60 transition duration-500" />
            
            <div className="relative flex items-center w-full bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-2 pl-6 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <LinkIcon className="w-6 h-6 text-muted-foreground" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://news.example.com/article..."
                required
                disabled={status !== "idle"}
                className="w-full bg-transparent border-none focus:outline-none text-lg py-4 px-4 placeholder:text-muted-foreground/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!url || status !== "idle"}
                className="bg-primary text-primary-foreground font-medium rounded-xl px-6 py-4 transition-transform active:scale-95 disabled:opacity-50 hover:bg-primary/90 flex items-center gap-2"
              >
                Synthesize
              </button>
            </div>
          </form>
        )}

        {/* Presentation Launch Card (Appears when ready) */}
        {status === "ready" && !showSlides && (
          <div className="mt-8 animate-in zoom-in-95 duration-500 flex justify-center w-full shadow-2xl">
            <button 
              onClick={startPresentation}
              className="relative rounded-3xl overflow-hidden aspect-video w-full max-w-3xl bg-zinc-900 border border-zinc-800 group hover:ring-4 ring-primary/20 transition-all text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-zinc-900 to-zinc-950 opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 bg-primary/20 backdrop-blur-md rounded-full flex items-center justify-center border border-primary/40 group-hover:bg-primary group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(var(--primary),0.5)] transition-all duration-300">
                  <Play className="w-8 h-8 text-white fill-white translate-x-1" />
                </div>
              </div>

              <div className="absolute top-0 right-0 p-6 flex gap-1">
                 {/* Visual indicator of multiple slides */}
                 {slides.map((_, i) => (
                   <div key={i} className="w-8 h-1.5 rounded-full bg-white/20" />
                 ))}
              </div>

              <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-white/10 backdrop-blur text-xs font-semibold rounded uppercase tracking-wider text-primary-foreground">{slides.length} Slides</span>
                  <span className="px-2.5 py-1 bg-white/10 backdrop-blur text-xs font-semibold rounded uppercase tracking-wider">Tariff Impact Analysis</span>
                </div>
                <h3 className="text-3xl font-bold">The Ripple Effect of Auto Tariffs</h3>
                <p className="text-zinc-400 mt-2 line-clamp-1">Generated from {url ? new URL(url).hostname : 'link'}</p>
              </div>
            </button>
          </div>
        )}

        {/* The Slide Presentation State */}
        {showSlides && (
          <div className="w-full max-w-5xl animate-in zoom-in-95 duration-700">
            <div className="rounded-3xl overflow-hidden border border-border bg-card shadow-[0_0_80px_rgba(0,0,0,0.1)] relative aspect-[16/10] sm:aspect-video flex flex-col">
              
              {/* Slide Content Area */}
              <div className="flex-1 relative bg-background overflow-hidden flex items-center justify-center p-8 sm:p-16">
                 
                 {/* Decorative background elements that vary by slide */}
                 <div className={cn(
                   "absolute w-[800px] h-[800px] rounded-full blur-[100px] transition-all duration-1000 opacity-20",
                   slide.type === 'hero' ? 'bg-indigo-500 top-0 left-0' : '',
                   slide.type === 'stat' ? 'bg-red-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : '',
                   slide.type === 'grid' ? 'bg-blue-500 bottom-0 right-0' : '',
                   slide.type === 'insight' ? 'bg-purple-500 top-0 right-0' : '',
                   slide.type === 'action' ? 'bg-emerald-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
                 )} />

                 {/* Slide Specific Content */}
                 <div key={currentSlide} className="z-10 w-full h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-700">
                    
                    {slide.type === "hero" && (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 backdrop-blur border border-primary/10 text-sm font-medium text-primary mb-8">
                          <Sparkles className="w-4 h-4" /> AI Generated Briefing
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 text-foreground leading-tight">
                          {slide.title}
                        </h2>
                        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
                          {slide.subtitle}
                        </p>
                      </div>
                    )}

                    {slide.type === "stat" && (
                      <div className="text-center">
                        <h2 className={cn("text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r", slide.gradient || "from-white to-zinc-400")}>
                          {slide.value}
                        </h2>
                        <div className="text-xl tracking-[0.2em] font-bold text-white mb-8">
                          {slide.label}
                        </div>
                        <p className="text-xl sm:text-2xl text-zinc-300 max-w-3xl mx-auto font-medium leading-relaxed">
                          {slide.description}
                        </p>
                      </div>
                    )}

                    {slide.type === "grid" && (
                      <div className="w-full max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-foreground mb-4">{slide.title}</h2>
                        <p className="text-xl text-muted-foreground mb-12">{slide.description}</p>
                        <div className="grid sm:grid-cols-3 gap-6">
                          {slide.stats?.map((s: {label: string, value: string}, i: number) => (
                            <div key={i} className="bg-card/60 backdrop-blur p-8 rounded-2xl border border-border shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                              <p className="text-muted-foreground text-sm uppercase tracking-wider font-bold mb-2">{s.label}</p>
                              <p className="text-primary text-4xl sm:text-5xl font-black mt-auto">{s.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {slide.type === "insight" && (
                      <div className="w-full max-w-4xl mx-auto text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
                          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-medium text-white leading-snug mb-8">
                          {slide.content}
                        </h2>
                        <p className="text-zinc-500 uppercase tracking-widest font-semibold">
                          — {slide.author}
                        </p>
                      </div>
                    )}

                    {slide.type === "action" && (
                      <div className="w-full max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold text-foreground mb-10 text-center">{slide.title}</h2>
                        <div className="space-y-4">
                          {slide.options?.map((opt: string, i: number) => (
                            <div key={i} className="bg-card/40 backdrop-blur p-6 rounded-2xl border border-border flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold shrink-0">
                                {i + 1}
                              </div>
                              <p className="text-foreground text-xl font-medium">{opt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                 </div>
              </div>

              {/* Presentation Controls Bar */}
              <div className="h-16 bg-zinc-900 border-t border-zinc-800 flex flex-col">
                {/* Progress bar */}
                <div className="w-full h-1 bg-zinc-950 flex gap-0.5 px-0.5">
                  {slides.map((_, i) => (
                    <div key={i} className="h-full flex-1 rounded-full overflow-hidden bg-zinc-800 relative">
                       {i < currentSlide && <div className="absolute inset-0 bg-primary" />}
                       {i === currentSlide && isPlaying && (
                         <div className="absolute inset-y-0 left-0 bg-primary animate-[slideRight_5s_linear_forwards]" />
                       )}
                       {i === currentSlide && !isPlaying && (
                         <div className="absolute inset-0 bg-primary/50" />
                       )}
                    </div>
                  ))}
                </div>
                
                {/* Control buttons */}
                <div className="flex-1 px-4 sm:px-8 flex items-center justify-between text-zinc-400">
                  <div className="text-sm font-medium">
                    {currentSlide + 1} / {slides.length}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => { setIsPlaying(false); setCurrentSlide(c => Math.max(0, c - 1)); }}
                      disabled={currentSlide === 0}
                      className="p-2 hover:bg-zinc-800 rounded-full hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-0.5" />}
                    </button>
                    <button 
                      onClick={() => { setIsPlaying(false); setCurrentSlide(c => Math.min(slides.length - 1, c + 1)); }}
                      disabled={currentSlide === slides.length - 1}
                      className="p-2 hover:bg-zinc-800 rounded-full hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button onClick={reset} className="text-sm font-medium hover:text-white transition-colors flex items-center gap-2">
                    <span className="hidden sm:inline">End Presentation</span> <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <style jsx global>{`
              @keyframes slideRight {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>
          </div>
        )}

      </div>
    </div>
  );
}
