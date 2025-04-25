// ============================
//  Korvynox — Stalker Site v5
//  Adds ScanReveal animation using React + GSAP + Canvas
// ============================

// 1) Install deps locally:
//    npm i gsap react-use-measure
// 2) This file contains two parts:
//    a) app/components/ScanReveal.tsx  – reusable animation component
//    b) app/page.tsx                    – page now renders <ScanReveal />
// ------------------------------------------------------------

// ---------- app/components/ScanReveal.tsx ----------
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import useMeasure from "react-use-measure";

interface ScanRevealProps {
  text: string;
  font?: string; // e.g. "600 28px 'Fira Code', monospace"
  color?: string; // final text color
  scanColor?: string; // color of scanning beam
}

export default function ScanReveal({
  text,
  font = "600 24px 'Courier New', monospace",
  color = "#ff4040",
  scanColor = "#ff0000",
}: ScanRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ref, bounds] = useMeasure();

  useEffect(() => {
    if (!canvasRef.current) return;
    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    cvs.width = bounds.width * dpr;
    cvs.height = bounds.height * dpr;
    cvs.style.width = bounds.width + "px";
    cvs.style.height = bounds.height + "px";
    ctx.scale(dpr, dpr);

    // Pre‑render text to imgData for mask
    ctx.font = font;
    ctx.fillStyle = color;
    const metrics = ctx.measureText(text);
    const x = (bounds.width - metrics.width) / 2;
    const y = bounds.height / 2 + 12; // approx vertical center
    ctx.fillText(text, x, y);
    const imgData = ctx.getImageData(0, 0, bounds.width, bounds.height);

    // Clear canvas for animation start
    ctx.clearRect(0, 0, bounds.width, bounds.height);

    const beamHeight = 4;

    function renderFrame(pos: number) {
      ctx.clearRect(0, 0, bounds.width, bounds.height);

      // Draw already revealed text
      ctx.putImageData(imgData, 0, 0);
      // Mask unrevealed area
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, bounds.width, pos);
      ctx.globalCompositeOperation = "source-over";

      // Draw scanning beam
      const grad = ctx.createLinearGradient(0, pos - beamHeight, 0, pos);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, scanColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, pos - beamHeight, bounds.width, beamHeight);
    }

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 8 });
    tl.fromTo(
      { y: 0 },
      { y: bounds.height, duration: 2, ease: "none", onUpdate() {
        // @ts-ignore – gsap proxies y
        renderFrame(this.targets()[0].y);
      } }
    );

    return () => tl.kill();
  }, [text, bounds.width, bounds.height, font, color, scanColor]);

  return (
    <div ref={ref} className="relative w-full h-52">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}