"use client";

import { useEffect, useState } from "react";

const COLORS = ["#4271b2", "#22c55e", "#eab308", "#a855f7", "#ec4899"];
const PARTICLE_COUNT = 35;

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  isCircle: boolean;
  drift: number;
  duration: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.8,
    size: 4 + Math.random() * 6,
    isCircle: Math.random() > 0.5,
    drift: (Math.random() - 0.5) * 80,
    duration: 2 + Math.random() * 1.5,
  }));
}

export function Confetti({ onComplete }: { onComplete?: () => void }) {
  const [particles] = useState(generateParticles);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: -10,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `translateX(${p.drift}px)`,
          }}
        />
      ))}
    </div>
  );
}
