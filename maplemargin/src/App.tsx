import { ReactLenis } from 'lenis/react';
import NodeNetwork from './components/NodeNetwork';
import AccessibilityMenu from './components/AccessibilityMenu';
import { Button } from './components/ui/button';
import { Settings, Instagram, Linkedin, Twitter, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial document state or system preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };
  return (
    <ReactLenis root>
      <div className="relative min-h-screen font-sans selection:bg-primary/20 bg-background text-foreground transition-colors duration-300">
        <NodeNetwork isDark={isDark} />

        {/* Navigation */}
        <nav className="absolute top-0 left-0 w-full p-6 sm:px-12 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <Settings className="w-8 h-8 text-foreground" />
          </div>
          <div className="hidden sm:flex items-center gap-4 sm:gap-6 text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors">Products</a>
            <a href="#" className="hover:text-primary transition-colors">Resources</a>
            <a href="#" className="hover:text-primary transition-colors">Pricing</a>

            <div className="flex items-center gap-2 border-l border-border pl-4 ml-2">
              <AccessibilityMenu />
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-background border-border hover:bg-muted"
                onClick={toggleTheme}
                aria-label="Toggle Dark Mode"
              >
                {isDark ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
              </Button>
            </div>
          </div>
        </nav>

        <main className="relative z-10 w-full flex flex-col items-center pt-32 pb-24 px-6 sm:px-12">

          {/* 1. Hero Section */}
          <section className="text-center max-w-4xl py-12 sm:py-20 flex flex-col items-center">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 text-foreground">
              Maple Margin
            </h1>
            <p className="text-lg sm:text-xl text-foreground/70 mb-10 max-w-xl">
              Navigating the 2026 Tariff Shock in real time
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button size="lg" className="rounded-full px-8 shadow-sm transition-all hover:opacity-80 hover:scale-105 active:scale-95">
                Try the Visualizer
              </Button>
              <Button size="lg" variant="secondary" className="rounded-full px-8 shadow-sm border border-border transition-all hover:bg-secondary/80 hover:scale-105 active:scale-95">
                View Live Data Feed
              </Button>
            </div>
          </section>

          {/* 2. Map Section placeholder */}
          <section className="w-full max-w-6xl my-16 sm:my-24 relative">
            <div className="w-full aspect-[4/3] sm:aspect-[21/9] flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Map_of_Canada.svg"
                alt="Canada Map Placeholder"
                className="w-full h-full object-contain opacity-40 p-12 drop-shadow-2xl mix-blend-multiply transition-transform duration-1000 hover:scale-[1.02]"
              />
            </div>
          </section>

          {/* 3. Feature Section: Border to Basket */}
          <section className="w-full max-w-6xl py-16 grid md:grid-cols-2 gap-12 sm:gap-24 items-center">
            <div className="flex flex-col items-start gap-6 order-2 md:order-1">
              <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
                From Border to Basket:<br />Tracking every cent
              </h2>
              <p className="text-foreground/70 leading-relaxed max-w-md">
                Our Map Engineering tool doesn't just show tariffs; it calculates the consumer impact.
              </p>
              <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 mt-2">
                Learn about our data model
              </Button>
            </div>
            {/* Visualizer Image/Graphic placeholder */}
            <div className="rounded-[2rem] bg-secondary/30 aspect-[4/3] w-full border border-secondary/20 relative overflow-hidden order-1 md:order-2">
              <div className="absolute inset-0 opacity-50 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, theme(colors.primary) 2px, transparent 0)', backgroundSize: '16px 16px' }} />
            </div>
          </section>

          {/* 4. Feature Section: Precision Intelligence */}
          <section className="w-full max-w-6xl py-16 grid md:grid-cols-2 gap-12 sm:gap-24 items-center mt-12 mb-32">
            {/* Visualizer Image/Graphic placeholder */}
            <div className="rounded-[2rem] bg-gradient-to-br from-accent/40 to-muted aspect-[4/3] w-full border border-accent/20 relative overflow-hidden flex items-center justify-center">
              {/* Purple/Pink blur circle matching Figma */}
              <div className="absolute w-72 h-72 bg-primary/40 rounded-full blur-[80px]" />
            </div>
            <div className="flex flex-col items-start gap-6">
              <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
                Precision Intelligence for an Unpredictable Era
              </h2>
              <p className="text-foreground/70 leading-relaxed max-w-md">
                In a world where a Supreme Court ruling can invalidate billions in duties overnight, you need more than a spreadsheet.
              </p>
              <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 mt-2">
                Start Stress-Testing
              </Button>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="w-full bg-accent/20 pt-20 pb-10 px-6 sm:px-12 border-t border-accent/30 relative z-10">
          <div className="max-w-6xl mx-auto">

            {/* 3 Columns */}
            <div className="grid sm:grid-cols-3 gap-12 mb-20 text-sm border-b border-foreground/10 pb-20">
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-base">Here text</h3>
                <p className="text-foreground/70 leading-relaxed max-w-[280px]">
                  Writing for websites is both simple and complex. On the one hand, all you need to do is say what you mean and in your words.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-base">There text</h3>
                <p className="text-foreground/70 leading-relaxed max-w-[280px]">
                  Are you thinking of keywords you should rank for? Are you including links in your text to additional information?
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-base">Everywhere text</h3>
                <p className="text-foreground/70 leading-relaxed max-w-[280px]">
                  There's a theory that people read in an F-shape pattern, and that this should influence how you structure content on your website.
                </p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-8 text-sm font-medium flex-wrap justify-center">
                <span className="font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-foreground" /> Maple Margin
                </span>
                <a href="#" className="hover:text-primary transition-colors">Features</a>
                <a href="#" className="hover:text-primary transition-colors">Learn more</a>
                <a href="#" className="hover:text-primary transition-colors">Support</a>
                <a href="#" className="hover:text-primary transition-colors">Data Source</a>
              </div>

              <div className="flex items-center gap-4 text-foreground/60">
                <a href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </ReactLenis>
  );
}

export default App;
