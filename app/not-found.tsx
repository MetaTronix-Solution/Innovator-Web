"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center font-sans antialiased text-foreground bg-background selection:bg-orange-500/30">
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full opacity-20 blur-2xl animate-pulse" />

        <div className="relative bg-card border border-border/80 p-6 rounded-2xl shadow-xl flex items-center justify-center w-24 h-24">
          <AlertCircle size={44} className="text-orange-500 animate-bounce" />
        </div>
      </div>

      <div className="space-y-3 max-w-md">
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          Page not found
        </h2>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm mx-auto">
          The route you are looking for does not exist, has been moved, or the
          profile handle is incorrect.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full max-w-xs sm:max-w-md justify-center">
        <button
          onClick={() => router.back()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 border border-border bg-muted hover:bg-accent text-foreground px-6 py-2.5 rounded-full font-bold text-xs tracking-wide transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft size={14} />
          Go back
        </button>

        <Link
          href="/"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold text-xs tracking-wide shadow-md transition-all active:scale-95"
        >
          <Home size={14} />
          Back to feed
        </Link>
      </div>

      <div className="w-16 h-[1px] bg-border mt-16 opacity-60" />
    </div>
  );
}

// "use client";

// import Link from "next/link";
// import { useEffect, useRef, useState } from "react";

// // ─── Animated Counter ─────────────────────────────────────────────────────────
// function Counter({ value }: { value: number }) {
//   const [display, setDisplay] = useState(0);
//   useEffect(() => {
//     let current = 0;
//     const step = Math.ceil(value / 40);
//     const timer = setInterval(() => {
//       current += step;
//       if (current >= value) {
//         setDisplay(value);
//         clearInterval(timer);
//       } else {
//         setDisplay(current);
//       }
//     }, 30);
//     return () => clearInterval(timer);
//   }, [value]);
//   return <span>{display.toLocaleString()}</span>;
// }

// // ─── Ghost Post Skeleton ──────────────────────────────────────────────────────
// function GhostPost({ delay }: { delay: string }) {
//   return (
//     <div
//       className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse"
//       style={{ animationDelay: delay }}
//     >
//       <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
//       <div className="flex-1 space-y-2 pt-0.5">
//         <div className="h-2.5 rounded-full bg-white/10 w-1/3" />
//         <div className="h-2 rounded-full bg-white/[0.07] w-full" />
//         <div className="h-2 rounded-full bg-white/[0.07] w-2/3" />
//       </div>
//     </div>
//   );
// }

// // ─── Main 404 Page ────────────────────────────────────────────────────────────
// export default function NotFound() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [mounted, setMounted] = useState(false);
//   const [glitch, setGlitch] = useState(false);

//   // Mount + periodic glitch effect
//   useEffect(() => {
//     setMounted(true);
//     const interval = setInterval(() => {
//       setGlitch(true);
//       setTimeout(() => setGlitch(false), 180);
//     }, 4500);
//     return () => clearInterval(interval);
//   }, []);

//   // Particle network canvas
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const resize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };
//     resize();
//     window.addEventListener("resize", resize);

//     type Particle = {
//       x: number;
//       y: number;
//       vx: number;
//       vy: number;
//       r: number;
//       alpha: number;
//     };
//     const particles: Particle[] = Array.from({ length: 60 }, () => ({
//       x: Math.random() * canvas.width,
//       y: Math.random() * canvas.height,
//       vx: (Math.random() - 0.5) * 0.35,
//       vy: (Math.random() - 0.5) * 0.35,
//       r: Math.random() * 1.5 + 0.4,
//       alpha: Math.random() * 0.35 + 0.1,
//     }));

//     let raf: number;
//     const draw = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       particles.forEach((p) => {
//         p.x = (p.x + p.vx + canvas.width) % canvas.width;
//         p.y = (p.y + p.vy + canvas.height) % canvas.height;
//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(139,92,246,${p.alpha})`;
//         ctx.fill();
//       });
//       for (let i = 0; i < particles.length; i++) {
//         for (let j = i + 1; j < particles.length; j++) {
//           const dx = particles[i].x - particles[j].x;
//           const dy = particles[i].y - particles[j].y;
//           const dist = Math.sqrt(dx * dx + dy * dy);
//           if (dist < 110) {
//             ctx.beginPath();
//             ctx.moveTo(particles[i].x, particles[i].y);
//             ctx.lineTo(particles[j].x, particles[j].y);
//             ctx.strokeStyle = `rgba(139,92,246,${0.1 * (1 - dist / 110)})`;
//             ctx.lineWidth = 0.5;
//             ctx.stroke();
//           }
//         }
//       }
//       raf = requestAnimationFrame(draw);
//     };
//     draw();
//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);

//   const navLinks = [
//     { label: "Feed", href: "/feed" },
//     { label: "Trending", href: "/trending" },
//     { label: "Profile", href: "/profile" },
//     { label: "Settings", href: "/settings" },
//   ];

//   const bottomNav = [
//     {
//       label: "Home",
//       href: "/",
//       icon: (
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
//         />
//       ),
//     },
//     {
//       label: "Explore",
//       href: "/explore",
//       icon: (
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
//         />
//       ),
//     },
//     {
//       label: "Messages",
//       href: "/messages",
//       icon: (
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//         />
//       ),
//     },
//     {
//       label: "Profile",
//       href: "/profile",
//       icon: (
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//         />
//       ),
//     },
//   ];

//   return (
//     <div className="relative min-h-screen bg-[#080810] text-white overflow-hidden flex items-center justify-center px-4 py-12">
//       {/* Particle canvas */}
//       <canvas
//         ref={canvasRef}
//         className="fixed inset-0 pointer-events-none z-0"
//       />

//       {/* Glow blobs */}
//       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
//         <div className="absolute -top-40 -left-20 w-[700px] h-[700px] rounded-full bg-violet-700/10 blur-[130px]" />
//         <div className="absolute -bottom-32 -right-20 w-[600px] h-[600px] rounded-full bg-fuchsia-700/10 blur-[110px]" />
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-600/6 blur-[90px]" />
//       </div>

//       {/* Grid overlay */}
//       <div
//         className="fixed inset-0 z-0 pointer-events-none"
//         style={{
//           backgroundImage: `
//             linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
//             linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
//           `,
//           backgroundSize: "64px 64px",
//         }}
//       />

//       {/* ── Content wrapper ── */}
//       <div className="relative z-10 w-full max-w-6xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
//           {/* ══ LEFT PANEL ══════════════════════════════════════════════════ */}
//           <div
//             className="flex flex-col items-start"
//             style={{
//               opacity: mounted ? 1 : 0,
//               transform: mounted ? "translateY(0px)" : "translateY(24px)",
//               transition: "opacity 0.7s ease, transform 0.7s ease",
//             }}
//           >
//             {/* Status pill */}
//             <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
//               <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
//               <span className="text-xs font-semibold text-violet-300 tracking-[0.15em] uppercase">
//                 Innovator · 404
//               </span>
//             </div>

//             {/* Glitch 404 */}
//             <div className="relative mb-5 select-none leading-none">
//               <h1
//                 className="text-[clamp(5.5rem,15vw,9.5rem)] font-black tracking-tighter leading-none
//                   bg-gradient-to-br from-white via-violet-200 to-fuchsia-500 bg-clip-text text-transparent"
//                 style={{
//                   textShadow: glitch
//                     ? undefined
//                     : "0 0 80px rgba(139,92,246,0.25)",
//                   filter: glitch ? undefined : undefined,
//                 }}
//               >
//                 404
//               </h1>
//               {/* Glitch red layer */}
//               {glitch && (
//                 <h1
//                   aria-hidden
//                   className="absolute inset-0 text-[clamp(5.5rem,15vw,9.5rem)] font-black tracking-tighter leading-none text-red-500/80"
//                   style={{
//                     clipPath: "inset(25% 0 50% 0)",
//                     transform: "translateX(5px)",
//                   }}
//                 >
//                   404
//                 </h1>
//               )}
//               {/* Glitch cyan layer */}
//               {glitch && (
//                 <h1
//                   aria-hidden
//                   className="absolute inset-0 text-[clamp(5.5rem,15vw,9.5rem)] font-black tracking-tighter leading-none text-cyan-400/80"
//                   style={{
//                     clipPath: "inset(55% 0 15% 0)",
//                     transform: "translateX(-5px)",
//                   }}
//                 >
//                   404
//                 </h1>
//               )}
//             </div>

//             {/* Headline */}
//             <h2 className="text-2xl sm:text-[1.75rem] font-bold text-white/90 leading-snug mb-3">
//               This post got lost in the feed
//             </h2>

//             {/* Description */}
//             <p className="text-[0.95rem] text-white/40 leading-relaxed max-w-[380px] mb-10">
//               The page you're looking for may have been deleted, moved, or it
//               simply never existed. Your timeline is still full of great
//               innovations waiting for you.
//             </p>

//             {/* CTA buttons */}
//             <div className="flex flex-wrap gap-3 mb-8">
//               <Link
//                 href="/"
//                 className="group flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
//                   bg-violet-600 hover:bg-violet-500 text-white
//                   shadow-[0_0_28px_rgba(139,92,246,0.45)] hover:shadow-[0_0_40px_rgba(139,92,246,0.65)]
//                   transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                   strokeWidth={2.2}
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M3 12l2-2m0 0l7-7 7 7m-9 5v6m4-6v6m5-10l2 2"
//                   />
//                 </svg>
//                 Back to Home
//               </Link>

//               <Link
//                 href="/explore"
//                 className="group flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold
//                   bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 hover:border-violet-500/40
//                   text-white/75 hover:text-white
//                   transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                   strokeWidth={2.2}
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
//                   />
//                 </svg>
//                 Explore Innovator
//               </Link>
//             </div>

//             {/* Quick links */}
//             <div className="flex flex-wrap gap-x-6 gap-y-2">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className="text-sm text-white/30 hover:text-violet-400 transition-colors duration-150
//                     underline-offset-4 hover:underline"
//                 >
//                   {link.label}
//                 </Link>
//               ))}
//             </div>
//           </div>

//           {/* ══ RIGHT PANEL — Phone mockup ══════════════════════════════════ */}
//           <div
//             className="hidden lg:flex justify-center"
//             style={{
//               opacity: mounted ? 1 : 0,
//               transform: mounted ? "translateY(0px)" : "translateY(28px)",
//               transition:
//                 "opacity 0.85s ease 0.18s, transform 0.85s ease 0.18s",
//             }}
//           >
//             <div className="relative w-[290px]">
//               {/* Glow behind device */}
//               <div className="absolute inset-0 scale-[1.15] rounded-[3rem] bg-violet-600/20 blur-3xl pointer-events-none" />

//               {/* Device frame */}
//               <div className="relative rounded-[2.75rem] bg-[#0e0e1a] border border-white/[0.09] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
//                 {/* Status bar */}
//                 <div className="flex items-center justify-between px-7 pt-5 pb-2">
//                   <span className="text-[10px] text-white/35 font-semibold">
//                     9:41
//                   </span>
//                   <div className="flex items-center gap-1">
//                     <svg
//                       className="w-3 h-3 text-white/30"
//                       fill="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         d="M1.5 8.5a13 13 0 0121 0M5 12a10 10 0 0114 0M8.5 15.5a6 6 0 017 0M12 19h.01"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                       />
//                     </svg>
//                     <svg
//                       className="w-3.5 h-3 text-white/30"
//                       fill="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <rect
//                         x="2"
//                         y="7"
//                         width="18"
//                         height="11"
//                         rx="2"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         fill="none"
//                       />
//                       <path
//                         d="M22 11v3"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                       />
//                       <rect
//                         x="4"
//                         y="9"
//                         width="11"
//                         height="7"
//                         rx="1"
//                         fill="currentColor"
//                       />
//                     </svg>
//                   </div>
//                 </div>

//                 {/* App header */}
//                 <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
//                   <span className="text-[15px] font-extrabold tracking-tight text-white">
//                     innovator
//                   </span>
//                   <div className="flex items-center gap-2">
//                     <button className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center">
//                       <svg
//                         className="w-3.5 h-3.5 text-white/50"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                         strokeWidth={2}
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//                         />
//                       </svg>
//                     </button>
//                     <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
//                   </div>
//                 </div>

//                 {/* Feed with overlay */}
//                 <div className="relative px-4 pt-4 pb-2 space-y-2.5">
//                   {/* 404 overlay */}
//                   <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0e0e1a]/85 backdrop-blur-[3px]">
//                     <div
//                       className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20
//                       flex items-center justify-center mb-3 shadow-[0_0_24px_rgba(139,92,246,0.2)]"
//                     >
//                       <svg
//                         className="w-7 h-7 text-violet-400"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                         strokeWidth={1.6}
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                         />
//                       </svg>
//                     </div>
//                     <p className="text-[13px] font-semibold text-white/70 mb-0.5">
//                       Content not found
//                     </p>
//                     <p className="text-[11px] text-white/30">
//                       Error 404 · Page missing
//                     </p>
//                   </div>

//                   {/* Skeleton posts */}
//                   <GhostPost delay="0s" />
//                   <GhostPost delay="0.12s" />
//                   <GhostPost delay="0.24s" />
//                   <GhostPost delay="0.36s" />
//                 </div>

//                 {/* Bottom navigation */}
//                 <div className="flex justify-around items-center px-2 py-3 border-t border-white/[0.06] mt-1">
//                   {bottomNav.map((item, i) =>
//                     i === 2 ? (
//                       // Compose button in center
//                       <button
//                         key="compose"
//                         className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-[0_0_14px_rgba(139,92,246,0.5)]"
//                       >
//                         <svg
//                           className="w-4 h-4 text-white"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                           strokeWidth={2.5}
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             d="M12 4v16m8-8H4"
//                           />
//                         </svg>
//                       </button>
//                     ) : (
//                       <Link
//                         key={item.href}
//                         href={item.href}
//                         className="flex flex-col items-center gap-0.5 group"
//                       >
//                         <svg
//                           className="w-5 h-5 text-white/25 group-hover:text-violet-400 transition-colors duration-150"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                           strokeWidth={1.8}
//                         >
//                           {item.icon}
//                         </svg>
//                       </Link>
//                     ),
//                   )}
//                 </div>
//               </div>

//               {/* Floating reaction card */}
//               <div
//                 className="absolute -left-10 top-16 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl
//                   bg-[#13131f]/90 border border-white/[0.07] backdrop-blur-xl shadow-2xl animate-bounce"
//                 style={{ animationDuration: "3.2s" }}
//               >
//                 <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
//                   <svg
//                     className="w-4 h-4 text-emerald-400"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-[9px] text-white/30 leading-none mb-0.5 uppercase tracking-wide">
//                     New reactions
//                   </p>
//                   <p className="text-sm font-bold text-white leading-none">
//                     <Counter value={2847} />
//                   </p>
//                 </div>
//               </div>

//               {/* Floating followers card */}
//               <div
//                 className="absolute -right-8 bottom-20 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl
//                   bg-[#13131f]/90 border border-white/[0.07] backdrop-blur-xl shadow-2xl animate-bounce"
//                 style={{ animationDuration: "4s", animationDelay: "0.6s" }}
//               >
//                 <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
//                   <svg
//                     className="w-4 h-4 text-violet-400"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
//                     />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="text-[9px] text-white/30 leading-none mb-0.5 uppercase tracking-wide">
//                     Online now
//                   </p>
//                   <p className="text-sm font-bold text-white leading-none">
//                     <Counter value={14203} />
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* ══ END RIGHT PANEL ══ */}
//         </div>

//         {/* Footer */}
//         <p className="text-center text-[11px] text-white/20 tracking-[0.2em] uppercase mt-20">
//           © {new Date().getFullYear()} Innovator · Where ideas connect
//         </p>
//       </div>
//     </div>
//   );
// }
