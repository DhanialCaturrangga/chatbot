"use client";

import dynamic from 'next/dynamic'
import Image from "next/image";
import { useState, useEffect } from "react";

// Lazy load ChatWidget for better initial performance
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
})

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Custom Cursor Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Loader Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 2500); // 2s animation + buffer
    return () => clearTimeout(timer);
  }, []);

  // Scroll Observer (Simple Intersection Observer substitute for animations)
  // In a real Junni site they use GSAP. Here we rely on CSS transition helper classes.

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#E6FF00] selection:text-black">

      {/* CUSTOM CURSOR */}
      <div
        className={`custom-cursor ${isHovering ? 'hovered' : ''}`}
        style={{ left: mousePos.x, top: mousePos.y }}
      />

      {/* LOADER OVERLAY */}
      <div className="loader-overlay flex flex-col items-center justify-center pointer-events-none">
        <div className="text-4xl font-bold tracking-tighter mix-blend-difference text-black">
          JUNNI STYLE
        </div>
        <p className="mt-2 font-mono text-sm">LOADING EXPERIENCE...</p>
      </div>

      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-8 mix-blend-difference text-black">
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="text-2xl font-bold tracking-tighter cursor-none">
          DC.
        </div>
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="flex flex-col gap-1 cursor-none group">
          <div className="w-8 h-1 bg-black group-hover:bg-[#E6FF00] transition-colors"></div>
          <div className="w-8 h-1 bg-black group-hover:bg-[#E6FF00] transition-colors"></div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="pt-32 px-6 sm:px-12 max-w-7xl mx-auto">

        <div className="min-h-[80vh] flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-gray-900">
            Digital Creative Portfolio
          </p>

          <h1
            className="text-[10vw] leading-[0.9] font-bold tracking-tighter mb-8 cursor-none"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            WE MAKE <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>HAPPY</span> THINGS.
          </h1>

          <div className="text-2xl sm:text-4xl font-serif max-w-2xl leading-relaxed">
            <p>自由に、ユニークに。</p>
            <p className="mt-2 text-xl sm:text-2xl text-gray-900 font-sans">
              We create digital experiences that bring joy. <br />
              Innovative, unique, and free-spirited.
            </p>
          </div>
        </div>

        {/* PROJECTS SECTION */}
        <section className="py-24 border-t border-black">
          <div className="flex items-end justify-between mb-16">
            <h2 className="text-6xl font-bold tracking-tighter">WORKS</h2>
            <span className="text-xl font-serif italic text-gray-900">Selected Projects 2024-2025</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-24">

            {/* Project 1 */}
            <div
              className="group cursor-none"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative mb-4">
                <div className="absolute inset-0 bg-[#E6FF00] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-10 opacity-20"></div>
                <Image src="/Daniel.jpg" alt="Screenshot of E-Commerce Platform Project" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              </div>
              <h3 className="text-3xl font-bold">E-Commerce Platform</h3>
              <p className="text-sm mt-2 text-gray-900">Next.js / Development</p>
            </div>

            {/* Project 2 */}
            <div
              className="group cursor-none md:mt-32"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative mb-4">
                <div className="absolute inset-0 bg-[#E6FF00] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-10 opacity-20"></div>
                <div className="w-full h-full flex items-center justify-center bg-black text-white text-4xl font-bold">PROJECT</div>
              </div>
              <h3 className="text-3xl font-bold">Brand Identity</h3>
              <p className="text-sm mt-2 text-gray-900">Design / Branding</p>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-black text-[#E6FF00] py-24 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end">
          <h2 className="text-[12vw] leading-none font-bold tracking-tighter mb-8 md:mb-0">
            CONTACT
          </h2>
          <div className="text-right">
            <p className="text-2xl mb-2 text-white">Let's work together</p>
            <a href="mailto:hello@daniel.com" className="text-xl underline decoration-[#E6FF00]">hello@daniel.com</a>
          </div>
        </div>
      </footer>

      {/* Chat Widget Container */}
      <div className="fixed bottom-8 right-8 z-40">
        <ChatWidget />
      </div>

    </div>
  );
}