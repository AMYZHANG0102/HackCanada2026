"use client";

import { ReactLenis } from "lenis/react";
import NodeNetwork from "@/components/node-network";
import AccessibilityMenu from "@/components/accessibility-menu";
import { Button } from "@/components/ui/button";
import { Instagram, Linkedin, Twitter, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };
  return (
    <ReactLenis root>
      <div className="relative min-h-screen font-sans selection:bg-primary/20 bg-transparent text-foreground transition-colors duration-300 overflow-x-hidden">
        <NodeNetwork isDark={isDark} />

        <nav className="sticky top-0 left-0 w-full px-6 sm:px-8 py-2 grid grid-cols-3 items-center z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
          {/* Left: Logo */}
          <div className="flex items-center">
            <img
              src={isDark ? "/logos/greyMM.png" : "/logos/blueMM.png"}
              alt="Maple Margin"
              className="h-14 w-auto object-contain"
            />
          </div>
          {/* Center: Nav links */}
          <div className="hidden sm:flex items-center justify-center gap-1 text-lg text-muted-foreground font-medium">
            <a
              href="#"
              className="px-4 py-2 rounded-lg hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Products
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-lg hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Resources
            </a>
            <a
              href="#"
              className="px-4 py-2 rounded-lg hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Pricing
            </a>
          </div>
          {/* Right: Controls */}
          <div className="flex items-center justify-end gap-3">
            <AccessibilityMenu />
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background w-10 h-10 border-border hover:bg-muted shadow-sm"
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-primary" />
              ) : (
                <Moon className="h-5 w-5 text-primary" />
              )}
            </Button>
          </div>
        </nav>

        <main className="relative z-10 w-full flex flex-col items-center pt-12 pb-24 px-6 sm:px-12">
          {/* 1. Hero Section */}
          <section className="text-center max-w-4xl py-12 sm:py-20 flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 text-foreground">
              Maple Margin
            </h1>
            <p className="text-lg sm:text-xl text-foreground/70 mb-10 max-w-xl">
              Navigating the 2026 Tariff Shock in real time
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/visualizer">
                <Button
                  size="lg"
                  className="rounded-full px-8 shadow-sm transition-all hover:opacity-80 hover:scale-105 active:scale-95"
                >
                  Try the Visualizer
                </Button>
              </Link>
            </div>
          </section>

          {/* 3. Feature Section: Border to Basket */}
          <section className="w-full max-w-6xl py-16 grid md:grid-cols-2 gap-12 sm:gap-24 items-center">
            <div className="flex flex-col items-start gap-6 order-2 md:order-1">
              <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
                From Border to Basket:
                <br />
                Tracking every cent
              </h3>
              <p className="text-foreground/70 leading-relaxed max-w-md">
                Our Map Engineering tool doesn't just show tariffs; it
                calculates the consumer impact.
              </p>
              <Button className="bg-foreground text-background transition-all hover:opacity-80 hover:scale-105 active:scale-95 rounded-full px-8 mt-2">
                Learn about our data model
              </Button>
            </div>
            {/* Visualizer Image/Graphic placeholder */}
            <div className="rounded-[2rem] bg-card aspect-[4/3] w-full border border-border relative overflow-hidden order-1 md:order-2 z-10 shadow-sm flex items-center justify-center">
              <div className="rounded-[2rem] bg-card aspect-[4/3] w-full border border-border relative overflow-hidden order-1 md:order-2 z-10 shadow-sm flex items-center justify-center">
                {mounted && isDark ? (
                  /* DARK MODE: Show the original image as usual */
                  <img
                    src="/Canada_blank_map.svg.png"
                    alt="Maple Margin Visualizer"
                    className="w-full h-full object-contain p-8 brightness-110 contrast-110"
                  />
                ) : (
                  /* LIGHT MODE: Use the SVG as a mask to apply #1D3557 */
                  <div
                    className="w-full h-full p-8"
                    style={{
                      backgroundColor: "#1D3557",
                      maskImage: "url('/Canada_blank_map.svg.png')",
                      WebkitMaskImage: "url('/Canada_blank_map.svg.png')", // For Safari support
                      maskRepeat: "no-repeat",
                      maskPosition: "center",
                      maskSize: "contain",
                    }}
                  />
                )}
              </div>
            </div>
          </section>

          {/* 4. Feature Section: Precision Intelligence */}
          <section className="w-full max-w-6xl py-16 grid md:grid-cols-2 gap-12 sm:gap-24 items-center mt-12 mb-32 relative z-10">
            {/* Visualizer Image/Graphic placeholder */}
            <div className="rounded-[2rem] bg-card aspect-[4/3] w-full border border-border relative overflow-hidden flex items-center justify-center shadow-sm">
              <img
                src="/icon-with-bar-chart-and-upward-arrow.png"
                alt="Maple Margin Visualizer"
                suppressHydrationWarning={true}
                className="w-full h-full object-contain p-8 transition-all duration-500
                          /* Light mode: keeps your current look (image_4.png) */
                          opacity-50 brightness-90 
                          /* Dark mode: makes it pop (image_7.png) */
                          dark:invert dark:brightness-150 dark:opacity-100"
              />
            </div>
            <div className="flex flex-col items-start gap-6">
              <h3 className="text-2xl sm:text-4xl font-bold leading-tight">
                Precision Intelligence for an Unpredictable Era
              </h3>
              <p className="text-foreground/70 leading-relaxed max-w-md">
                In a world where a Supreme Court ruling can invalidate billions
                in duties overnight, you need more than a spreadsheet.
              </p>
              <Button className="bg-foreground text-background transition-all hover:opacity-80 hover:scale-105 active:scale-95 rounded-full px-8 mt-2">
                Start Stress-Testing
              </Button>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="w-full bg-card pt-20 pb-10 px-6 sm:px-12 border-t border-border relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="max-w-6xl mx-auto">
            {/* 3 Columns */}
            <div className="grid sm:grid-cols-3 gap-12 mb-20 text-sm border-b border-border pb-20">
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-base text-foreground">
                  Data Aggregation
                </h3>
                <p className="text-foreground/90 leading-relaxed max-w-[280px]">
                  We pull live fiscal data and trade margins directly from
                  verified provincial and federal sources. Every data point is
                  geocoded to provide a granular look at economic health across
                  Canada
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-base text-foreground">
                  Real-time Analysis
                </h3>
                <p className="text-foreground/90 leading-relaxed max-w-[280px]">
                  Using our custom intelligence engine, raw numbers are
                  transformed into actionable insights. We calculate the
                  real-world impact of tariffs and market shifts before they
                  reach the consumer basket.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-base text-foreground">
                  Global Scalability
                </h3>
                <p className="text-foreground/90 leading-relaxed max-w-[280px]">
                  While we're starting with the North, our data model is built
                  to scale. Our architecture supports rapid integration of
                  international trade datasets for a truly global
                  margin-tracking solution.
                </p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-8 text-sm font-medium flex-wrap justify-center">
                <span className="flex items-center gap-2">
                  <img
                    src={isDark ? "/logos/greyMM.png" : "/logos/blueMM.png"}
                    alt="Maple Margin"
                    className="h-10 w-auto object-contain"
                  />
                </span>
                <a href="#" className="hover:text-primary transition-colors">
                  Features
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Learn more
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Support
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Data Source
                </a>
              </div>

              <div className="flex items-center gap-4 text-foreground/60">
                <a href="#" className="hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ReactLenis>
  );
}
